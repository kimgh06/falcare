import { useEffect, useRef, useState, forwardRef } from "react";
import { useCarStore, type ReplayFrame } from "~/src/shared/store/carStore";

const ReplayControls = forwardRef<HTMLDivElement>((props, ref) => {
  const {
    replayFrames,
    isReplaying,
    isReplayPaused,
    replaySpeed,
    getReplayCurrentTime,
    getReplayTotalTime,
    startReplay,
    stopReplay,
    pauseReplay,
    resumeReplay,
    setReplaySpeed,
    seekReplay,
    loadReplay,
  } = useCarStore();

  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [currentLap, setCurrentLap] = useState(0);
  const [currentScore, setCurrentScore] = useState(0);
  const [currentDriftGauge, setCurrentDriftGauge] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLInputElement>(null);

  // 현재 시간에 해당하는 프레임 찾기
  const findFrameAtTime = (frames: ReplayFrame[], time: number): ReplayFrame | null => {
    if (frames.length === 0) return null;
    if (frames.length === 1) return frames[0];

    let i = 0;
    while (i < frames.length - 1 && frames[i + 1].time < time) {
      i++;
    }
    return frames[i];
  };

  // 현재 시간에 해당하는 프레임과 인덱스 찾기
  const findFrameAndIndexAtTime = (
    frames: ReplayFrame[],
    time: number
  ): { frame: ReplayFrame; index: number } | null => {
    if (frames.length === 0) return null;
    if (frames.length === 1) return { frame: frames[0], index: 0 };

    let i = 0;
    while (i < frames.length - 1 && frames[i + 1].time < time) {
      i++;
    }
    return { frame: frames[i], index: i };
  };

  // 프레임 간 위치 차이로 속도 계산 (m/s)
  const calculateSpeedFromFrames = (
    currentFrame: ReplayFrame | null,
    previousFrame: ReplayFrame | null
  ): number => {
    if (!currentFrame || !previousFrame) return 0;

    // 위치 차이 계산
    const dx = currentFrame.position.x - previousFrame.position.x;
    const dy = currentFrame.position.y - previousFrame.position.y;
    const dz = currentFrame.position.z - previousFrame.position.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

    // 시간 차이 계산 (ms를 초로 변환)
    const dt = (currentFrame.time - previousFrame.time) / 1000;

    // 속도 = 거리 / 시간 (m/s)
    if (dt <= 0) return 0;
    return distance / dt;
  };

  // 시간 및 속도 업데이트
  useEffect(() => {
    if (replayFrames.length === 0) {
      setCurrentTime(0);
      setTotalTime(0);
      setCurrentSpeed(0);
      setCurrentLap(0);
      setCurrentScore(0);
      setCurrentDriftGauge(0);
      return;
    }

    setTotalTime(getReplayTotalTime());

    const interval = setInterval(() => {
      if (!isReplayPaused) {
        const time = getReplayCurrentTime();
        setCurrentTime(time);
        
        // 현재 시간에 해당하는 프레임과 인덱스 찾기
        const result = findFrameAndIndexAtTime(replayFrames, time);
        if (result) {
          const { frame, index } = result;
          // 이전 프레임 찾기 (속도 계산용)
          const previousFrame = index > 0 ? replayFrames[index - 1] : null;
          
          // 프레임 간 위치 차이로 속도 계산
          const speed = calculateSpeedFromFrames(frame, previousFrame);
          setCurrentSpeed(speed);
          setCurrentScore(frame.score);
          setCurrentDriftGauge(frame.driftGauge);
          
          // 랩 정보 계산 (간단한 추정: 시간 기반)
          // 실제로는 리플레이 메타데이터에 랩 정보가 있어야 함
          // 여기서는 시간을 기반으로 추정 (30초당 1랩으로 가정)
          const estimatedLap = Math.floor(time / 30000) + 1;
          setCurrentLap(estimatedLap);
        }
      } else {
        // 일시정지 상태에서도 현재 프레임 정보 업데이트
        const result = findFrameAndIndexAtTime(replayFrames, currentTime);
        if (result) {
          const { frame, index } = result;
          // 이전 프레임 찾기 (속도 계산용)
          const previousFrame = index > 0 ? replayFrames[index - 1] : null;
          
          // 프레임 간 위치 차이로 속도 계산
          const speed = calculateSpeedFromFrames(frame, previousFrame);
          setCurrentSpeed(speed);
          setCurrentScore(frame.score);
          setCurrentDriftGauge(frame.driftGauge);
          const estimatedLap = Math.floor(currentTime / 30000) + 1;
          setCurrentLap(estimatedLap);
        }
      }
    }, 16); // 60fps

    return () => clearInterval(interval);
  }, [replayFrames, isReplayPaused, getReplayCurrentTime, getReplayTotalTime, currentTime]);


  // 슬라이더 값 업데이트
  useEffect(() => {
    if (!isDragging && sliderRef.current) {
      sliderRef.current.value = currentTime.toString();
    }
  }, [currentTime, isDragging]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${minutes}:${seconds.toString().padStart(2, "0")}.${milliseconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handlePlayPause = () => {
    if (!isReplaying) {
      startReplay();
    } else if (isReplayPaused) {
      resumeReplay();
    } else {
      pauseReplay();
    }
  };

  const handleSpeedChange = (speed: number) => {
    setReplaySpeed(speed);
  };

  const handleSpeedSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const speed = parseFloat(e.target.value);
    setReplaySpeed(speed);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    seekReplay(time);
  };

  const handleSliderMouseDown = () => {
    setIsDragging(true);
  };

  const handleSliderMouseUp = () => {
    setIsDragging(false);
    if (sliderRef.current) {
      const time = parseFloat(sliderRef.current.value);
      seekReplay(time);
    }
  };

  const handleFileLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const frames = JSON.parse(event.target?.result as string);
        loadReplay(frames);
      } catch (error) {
        console.error("Failed to load replay:", error);
        alert("리플레이 파일을 불러올 수 없습니다.");
      }
    };
    reader.readAsText(file);
  };


  const hasReplay = replayFrames.length > 0;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        background: "rgba(15, 23, 42, 0.95)",
        borderTop: "1px solid rgba(255, 255, 255, 0.1)",
        padding: "16px 20px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        fontFamily:
          '"Pretendard", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "맑은 고딕", sans-serif',
        color: "#ffffff",
      }}
    >
      {/* 상단 정보 패널 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 16px",
          background: "rgba(0, 0, 0, 0.3)",
          borderRadius: "8px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", gap: "24px", alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.6)" }}>
              속도
            </div>
            <div style={{ fontSize: "20px", fontWeight: "600", color: "#60a5fa" }}>
              {(currentSpeed * 3.6).toFixed(1)} km/h
            </div>
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.6)" }}>
              랩
            </div>
            <div style={{ fontSize: "20px", fontWeight: "600", color: "#a78bfa" }}>
              {currentLap}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.6)" }}>
              점수
            </div>
            <div style={{ fontSize: "20px", fontWeight: "600", color: "#ec4899" }}>
              {currentScore}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.6)" }}>
              드리프트
            </div>
            <div style={{ fontSize: "20px", fontWeight: "600", color: "#fbbf24" }}>
              {currentDriftGauge.toFixed(0)}%
            </div>
          </div>
        </div>
      </div>

      {/* 타임라인 슬라이더 */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ fontSize: "12px", minWidth: "60px" }}>
          {formatTime(currentTime)}
        </span>
        <input
          ref={sliderRef}
          type="range"
          min="0"
          max={totalTime}
          step="1"
          defaultValue="0"
          onChange={handleSliderChange}
          onMouseDown={handleSliderMouseDown}
          onMouseUp={handleSliderMouseUp}
          disabled={!hasReplay}
          style={{
            flex: 1,
            height: "6px",
            borderRadius: "3px",
            background: hasReplay
              ? "rgba(255, 255, 255, 0.2)"
              : "rgba(255, 255, 255, 0.1)",
            outline: "none",
            cursor: hasReplay ? "pointer" : "not-allowed",
          }}
        />
        <span style={{ fontSize: "12px", minWidth: "60px" }}>
          {formatTime(totalTime)}
        </span>
      </div>

      {/* 컨트롤 버튼들 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        {/* 재생/일시정지 */}
        <button
          onClick={handlePlayPause}
          disabled={!hasReplay}
          style={{
            padding: "10px 20px",
            fontSize: "14px",
            fontWeight: "600",
            borderRadius: "8px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            background: isReplaying && !isReplayPaused
              ? "rgba(96, 165, 250, 0.4)"
              : "rgba(15, 23, 42, 0.8)",
            color: "#fff",
            cursor: hasReplay ? "pointer" : "not-allowed",
            minWidth: "100px",
          }}
        >
          {!isReplaying
            ? "▶ 재생"
            : isReplayPaused
            ? "▶ 재개"
            : "⏸ 일시정지"}
        </button>

        {/* 재생 속도 슬라이더 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "8px 16px",
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: "8px",
            minWidth: "200px",
          }}
        >
          <span style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.7)", minWidth: "45px" }}>
            속도:
          </span>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={replaySpeed}
            onChange={handleSpeedSliderChange}
            style={{
              flex: 1,
              height: "6px",
              borderRadius: "3px",
              background: "rgba(255, 255, 255, 0.2)",
              outline: "none",
              cursor: "pointer",
            }}
          />
          <span style={{ fontSize: "12px", color: "#fff", minWidth: "35px", textAlign: "right" }}>
            {replaySpeed.toFixed(1)}x
          </span>
        </div>

        {/* 파일 로드 */}
        <label
          style={{
            padding: "10px 20px",
            fontSize: "14px",
            fontWeight: "600",
            borderRadius: "8px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            background: "rgba(15, 23, 42, 0.8)",
            color: "#fff",
            cursor: "pointer",
            display: "inline-block",
          }}
        >
          📁 불러오기
          <input
            type="file"
            accept=".json"
            onChange={handleFileLoad}
            style={{ display: "none" }}
          />
        </label>

      </div>

      {/* 리플레이 정보 */}
      {hasReplay && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "24px",
            fontSize: "12px",
            color: "rgba(255, 255, 255, 0.7)",
          }}
        >
          <span>프레임: {replayFrames.length}</span>
          <span>총 시간: {formatTime(totalTime)}</span>
          <span>재생 속도: {replaySpeed}x</span>
        </div>
      )}

    </div>
  );
});

ReplayControls.displayName = "ReplayControls";

export default ReplayControls;

