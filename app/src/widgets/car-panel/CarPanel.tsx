import { useState, useEffect } from "react";
import { useCarStore } from "~/src/shared/store/carStore";

/**
 * 차량 상태 패널 컴포넌트 (일반 React 컴포넌트)
 * 화면 하단에 표시됩니다.
 */
export default function CarPanel() {
  const {
    position,
    speed,
    collision,
    driftMode,
    score,
    driftGauge,
    detectedDistance,
    detectedObject,
    savePointId,
    // 랩 타임 관련
    currentLap,
    totalLaps,
    lapRecords,
    getCurrentLapTime,
    getBestLapTime,
    getTotalTime,
    isRaceComplete,
    // 리플레이
    replayFrames,
    isRecordingReplay,
    isReplaying,
    startReplayRecording,
    stopReplayRecording,
    clearReplay,
    loadReplay,
    startReplay,
    stopReplay,
  } = useCarStore();

  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    // 클라이언트에서만 실행
    setMounted(true);

    // 현재 시간을 주기적으로 업데이트 (UI 갱신용)
    const interval = setInterval(() => {
      setCurrentTime(getCurrentLapTime());
    }, 16); // 약 60fps

    return () => clearInterval(interval);
  }, [getCurrentLapTime]);

  // 시간 포맷팅 함수 (밀리초를 MM:SS.mmm 형식으로)
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10); // 10ms 단위로 표시
    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, "0")}.${milliseconds
        .toString()
        .padStart(2, "0")}`;
    }
    return `${seconds}.${milliseconds.toString().padStart(2, "0")}`;
  };

  const currentLapTime = getCurrentLapTime();
  const bestLapTime = getBestLapTime();
  const totalTime = getTotalTime();
  const completedLaps = lapRecords.length;
  // 화면에 표시할 랩: 최소 1부터 시작, 진행 중이면 currentLap 기준
  const displayLap =
    currentLap > 0 ? currentLap : completedLaps > 0 ? completedLaps : 1;

  // 리플레이 다운로드 함수
  const handleDownloadReplay = () => {
    if (replayFrames.length === 0) {
      alert("다운로드할 리플레이가 없습니다.");
      return;
    }
    const data = JSON.stringify(replayFrames);
    const blob = new Blob([data], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `replay_${new Date()
      .toISOString()
      .replace(/[:.]/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* 경주 완료 시 리플레이 다운로드 버튼 */}
      {isRaceComplete && replayFrames.length > 0 && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 2000,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
            pointerEvents: "auto",
          }}
        >
          <div
            style={{
              background:
                "linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              padding: "40px 50px",
              minWidth: "400px",
              maxWidth: "500px",
              borderRadius: "20px",
              border: "2px solid rgba(96, 165, 250, 0.3)",
              boxShadow:
                "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1) inset",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "28px",
                fontWeight: "700",
                color: "#60a5fa",
                marginBottom: "24px",
                fontFamily:
                  '"Pretendard", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "맑은 고딕", sans-serif',
              }}
            >
              경주 완료!
            </div>

            {/* 기록 표시 */}
            <div
              style={{
                marginBottom: "24px",
                padding: "20px",
                background: "rgba(255, 255, 255, 0.05)",
                borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              {/* 총 시간 */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <span
                  style={{
                    fontSize: "14px",
                    color: "rgba(255, 255, 255, 0.7)",
                    fontFamily:
                      '"Pretendard", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "맑은 고딕", sans-serif',
                  }}
                >
                  총 시간
                </span>
                <span
                  style={{
                    fontSize: "18px",
                    fontWeight: "700",
                    color: "#a78bfa",
                    fontVariantNumeric: "tabular-nums",
                    fontFamily:
                      '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", "Source Code Pro", monospace',
                  }}
                >
                  {formatTime(totalTime)}
                </span>
              </div>

              {/* 최고 랩 타임 */}
              {bestLapTime !== null && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "12px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "14px",
                      color: "rgba(255, 255, 255, 0.7)",
                      fontFamily:
                        '"Pretendard", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "맑은 고딕", sans-serif',
                    }}
                  >
                    최고 랩 타임
                  </span>
                  <span
                    style={{
                      fontSize: "18px",
                      fontWeight: "700",
                      color: "#fbbf24",
                      fontVariantNumeric: "tabular-nums",
                      fontFamily:
                        '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", "Source Code Pro", monospace',
                    }}
                  >
                    {formatTime(bestLapTime)}
                  </span>
                </div>
              )}

              {/* 랩 기록 리스트 */}
              {lapRecords.length > 0 && (
                <div
                  style={{
                    marginTop: "16px",
                    paddingTop: "16px",
                    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                    maxHeight: "200px",
                    overflowY: "auto",
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      color: "rgba(255, 255, 255, 0.5)",
                      marginBottom: "8px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      fontFamily:
                        '"Pretendard", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "맑은 고딕", sans-serif',
                    }}
                  >
                    랩 기록
                  </div>
                  {lapRecords.map((record) => {
                    const isBest = bestLapTime === record.lapTime;
                    return (
                      <div
                        key={record.lapNumber}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "6px 12px",
                          background: isBest
                            ? "rgba(251, 191, 36, 0.15)"
                            : "rgba(255, 255, 255, 0.03)",
                          borderRadius: "6px",
                          marginBottom: "6px",
                          border: isBest
                            ? "1px solid rgba(251, 191, 36, 0.3)"
                            : "none",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "12px",
                            color: "rgba(255, 255, 255, 0.7)",
                            fontWeight: isBest ? "600" : "400",
                            fontFamily:
                              '"Pretendard", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "맑은 고딕", sans-serif',
                          }}
                        >
                          Lap {record.lapNumber}
                        </span>
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: "600",
                            color: isBest
                              ? "#fbbf24"
                              : "rgba(255, 255, 255, 0.9)",
                            fontVariantNumeric: "tabular-nums",
                            fontFamily:
                              '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", "Source Code Pro", monospace',
                          }}
                        >
                          {formatTime(record.lapTime)}
                          {isBest && " ⭐"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div
              style={{
                fontSize: "14px",
                color: "rgba(255, 255, 255, 0.7)",
                marginBottom: "24px",
                fontFamily:
                  '"Pretendard", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "맑은 고딕", sans-serif',
              }}
            >
              리플레이를 다운로드하시겠습니까?
            </div>
            <button
              onClick={handleDownloadReplay}
              style={{
                padding: "16px 32px",
                fontSize: "16px",
                fontWeight: "600",
                color: "#ffffff",
                background: "linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)",
                border: "none",
                borderRadius: "12px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 16px rgba(96, 165, 250, 0.4)",
                fontFamily:
                  '"Pretendard", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "맑은 고딕", sans-serif',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.boxShadow =
                  "0 6px 20px rgba(96, 165, 250, 0.6)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow =
                  "0 4px 16px rgba(96, 165, 250, 0.4)";
              }}
            >
              리플레이 다운로드
            </button>
            <div
              style={{
                fontSize: "12px",
                color: "rgba(255, 255, 255, 0.5)",
                marginTop: "12px",
                fontFamily:
                  '"Pretendard", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "맑은 고딕", sans-serif',
              }}
            >
              {replayFrames.length} 프레임
            </div>
          </div>
        </div>
      )}
      {/* 상단 좌우 패널 */}
      <div
        style={{
          position: "fixed",
          top: "24px",
          left: "24px",
          right: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "16px",
          zIndex: 1000,
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        {/* 왼쪽 패널 */}
        <div
          style={{
            background:
              "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            color: "#ffffff",
            padding: "12px 16px",
            borderRadius: "12px",
            fontFamily:
              '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", "Source Code Pro", monospace',
            fontSize: "12px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow:
              "0 4px 16px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05) inset",
            minWidth: "200px",
          }}
        >
          {/* 랩 정보 */}
          {mounted && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                marginBottom: "12px",
                paddingBottom: "12px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <div
                style={{
                  fontSize: "9px",
                  color: "rgba(255, 255, 255, 0.5)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Lap
              </div>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "#60a5fa",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {`${displayLap} / ${totalLaps}`}
              </div>
            </div>
          )}

          {/* 랩 타임 정보 */}
          {mounted && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {currentLap > 0 && (
                <div>
                  <div
                    style={{
                      fontSize: "9px",
                      color: "rgba(255, 255, 255, 0.5)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      marginBottom: "4px",
                    }}
                  >
                    Current
                  </div>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: "700",
                      color: "#34d399",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {formatTime(currentLapTime)}
                  </div>
                </div>
              )}

              {bestLapTime !== null && (
                <div>
                  <div
                    style={{
                      fontSize: "9px",
                      color: "rgba(255, 255, 255, 0.5)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      marginBottom: "4px",
                    }}
                  >
                    Best
                  </div>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: "700",
                      color: "#fbbf24",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {formatTime(bestLapTime)}
                  </div>
                </div>
              )}

              {currentLap > 0 && (
                <div>
                  <div
                    style={{
                      fontSize: "9px",
                      color: "rgba(255, 255, 255, 0.5)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      marginBottom: "4px",
                    }}
                  >
                    Total
                  </div>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: "700",
                      color: "#a78bfa",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {formatTime(totalTime)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 오른쪽 패널 */}
        <div
          style={{
            background:
              "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            color: "#ffffff",
            padding: "12px 16px",
            borderRadius: "12px",
            fontFamily:
              '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", "Source Code Pro", monospace',
            fontSize: "12px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow:
              "0 4px 16px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05) inset",
            minWidth: "200px",
          }}
        >
          {/* 체크포인트 */}
          <div
            style={{
              marginBottom: "12px",
              paddingBottom: "12px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <div
              style={{
                fontSize: "9px",
                color: "rgba(255, 255, 255, 0.5)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "4px",
              }}
            >
              Checkpoint
            </div>
            <div
              style={{
                fontSize: "20px",
                fontWeight: "700",
                color: "#60a5fa",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              #{savePointId}
            </div>
          </div>

          {/* 기타 정보 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {/* Position */}
            <div>
              <div
                style={{
                  fontSize: "9px",
                  color: "rgba(255, 255, 255, 0.5)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: "4px",
                }}
              >
                Position
              </div>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: "600",
                  color: "#ffffff",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {position
                  ? `${position.x.toFixed(1)}, ${position.y.toFixed(
                      1
                    )}, ${position.z.toFixed(1)}`
                  : "0.0, 0.0, 0.0"}
              </div>
            </div>

            {/* Contact */}
            <div>
              <div
                style={{
                  fontSize: "9px",
                  color: "rgba(255, 255, 255, 0.5)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: "4px",
                }}
              >
                Contact
              </div>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: "600",
                  color: collision ? "#fbbf24" : "#6ee7b7",
                }}
              >
                {collision ? "Touching" : "Air"}
              </div>
            </div>

            {/* Drift Mode */}
            <div>
              <div
                style={{
                  fontSize: "9px",
                  color: "rgba(255, 255, 255, 0.5)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: "4px",
                }}
              >
                Drift Mode
              </div>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  color: driftMode ? "#fbbf24" : "#a5b4fc",
                }}
              >
                {driftMode ? "Drift" : "Normal"}
              </div>
            </div>

            {/* Detection */}
            <div>
              <div
                style={{
                  fontSize: "9px",
                  color: "rgba(255, 255, 255, 0.5)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: "4px",
                }}
              >
                Detection
              </div>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: "600",
                  color: detectedObject
                    ? "#4ade80"
                    : "rgba(255, 255, 255, 0.4)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {detectedDistance !== null
                  ? `${detectedDistance.toFixed(2)} m`
                  : "0.00 m"}
              </div>
            </div>
          </div>

          {/* 리플레이 컨트롤 */}
          <div
            style={{
              marginTop: "12px",
              paddingTop: "12px",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              pointerEvents: "auto",
            }}
          >
            <div
              style={{
                fontSize: "9px",
                color: "rgba(255, 255, 255, 0.5)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "6px",
              }}
            >
              Replay
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "4px",
              }}
            >
              <button
                onClick={() => {
                  if (isRecordingReplay) {
                    stopReplayRecording();
                  } else {
                    clearReplay();
                    startReplayRecording();
                  }
                }}
                style={{
                  padding: "4px 8px",
                  fontSize: "9px",
                  borderRadius: "6px",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  background: isRecordingReplay
                    ? "rgba(248, 113, 113, 0.4)"
                    : "rgba(15, 23, 42, 0.8)",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                {isRecordingReplay ? "Stop Rec" : "Rec"}
              </button>
              <button
                onClick={() => {
                  if (isReplaying) {
                    stopReplay();
                  } else {
                    startReplay();
                  }
                }}
                disabled={replayFrames.length === 0}
                style={{
                  padding: "4px 8px",
                  fontSize: "9px",
                  borderRadius: "6px",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  background: isReplaying
                    ? "rgba(96, 165, 250, 0.5)"
                    : "rgba(15, 23, 42, 0.8)",
                  color:
                    replayFrames.length === 0
                      ? "rgba(255,255,255,0.3)"
                      : "#fff",
                  cursor: replayFrames.length === 0 ? "not-allowed" : "pointer",
                }}
              >
                {isReplaying ? "Stop" : "Play"}
              </button>
              <button
                onClick={() => {
                  // JSON 다운로드
                  const data = JSON.stringify(replayFrames);
                  const blob = new Blob([data], {
                    type: "application/json",
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "replay.json";
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                disabled={replayFrames.length === 0}
                style={{
                  padding: "4px 8px",
                  fontSize: "9px",
                  borderRadius: "6px",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  background: "rgba(15, 23, 42, 0.8)",
                  color:
                    replayFrames.length === 0
                      ? "rgba(255,255,255,0.3)"
                      : "#fff",
                  cursor: replayFrames.length === 0 ? "not-allowed" : "pointer",
                }}
              >
                Export
              </button>
              <label
                style={{
                  padding: "4px 8px",
                  fontSize: "9px",
                  borderRadius: "6px",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  background: "rgba(15, 23, 42, 0.8)",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Import
                <input
                  type="file"
                  accept="application/json"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      try {
                        const parsed = JSON.parse(
                          reader.result as string
                        ) as unknown;
                        if (Array.isArray(parsed)) {
                          loadReplay(parsed as any);
                        }
                      } catch (err) {
                        console.error("Failed to load replay", err);
                      }
                    };
                    reader.readAsText(file);
                    // 같은 파일 다시 선택 가능하도록 초기화
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
            <div
              style={{
                fontSize: "8px",
                color: "rgba(255,255,255,0.4)",
                marginTop: "4px",
              }}
            >
              Frames: {replayFrames.length}
            </div>
          </div>
        </div>
      </div>

      {/* 중앙 패널 - 속도, 드리프트 게이지, 점수 */}
      <div
        style={{
          position: "fixed",
          bottom: "24px",
          left: "50%",
          transform: "translateX(-50%)",
          background:
            "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          color: "#ffffff",
          padding: "16px 24px",
          borderRadius: "12px",
          fontFamily:
            '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", "Source Code Pro", monospace',
          fontSize: "12px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow:
            "0 4px 16px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05) inset",
          minWidth: "320px",
          zIndex: 1000,
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        {/* 속도 - 중앙 강조 */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              color: "rgba(255, 255, 255, 0.5)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: "8px",
            }}
          >
            Speed
          </div>
          <div
            style={{
              fontSize: "32px",
              fontWeight: "700",
              color: speed > 5 ? "#f87171" : "#4ade80",
              fontVariantNumeric: "tabular-nums",
              lineHeight: "1",
            }}
          >
            {(speed * 3.6).toFixed(1)}
          </div>
          <div
            style={{
              fontSize: "14px",
              color: "rgba(255, 255, 255, 0.6)",
              marginTop: "4px",
            }}
          >
            km/h
          </div>
        </div>

        {/* 드리프트 게이지 - 중앙 */}
        <div
          style={{
            marginBottom: "16px",
            paddingBottom: "16px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <span
              style={{
                color: "rgba(255, 255, 255, 0.6)",
                fontSize: "11px",
                fontWeight: "500",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Drift Gauge
            </span>
            <span
              style={{
                fontWeight: "700",
                color: "#ffffff",
                fontSize: "16px",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {Math.round(driftGauge)}%
            </span>
          </div>
          <div
            style={{
              width: "100%",
              height: "12px",
              background: "rgba(255, 255, 255, 0.08)",
              borderRadius: "6px",
              overflow: "hidden",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              position: "relative",
            }}
          >
            <div
              style={{
                width: `${driftGauge}%`,
                height: "100%",
                background:
                  driftGauge > 70
                    ? "linear-gradient(90deg, #f87171 0%, #fbbf24 100%)"
                    : driftGauge > 40
                    ? "linear-gradient(90deg, #fbbf24 0%, #fde047 100%)"
                    : "linear-gradient(90deg, #34d399 0%, #60a5fa 100%)",
                transition:
                  "width 0.2s cubic-bezier(0.4, 0, 0.2, 1), background 0.2s ease",
                borderRadius: "6px",
                boxShadow:
                  driftGauge > 70
                    ? "0 0 12px rgba(248, 113, 113, 0.4)"
                    : driftGauge > 40
                    ? "0 0 8px rgba(251, 191, 36, 0.3)"
                    : "0 0 4px rgba(52, 211, 153, 0.2)",
              }}
            />
          </div>
        </div>

        {/* 점수 - 중앙 강조 */}
        <div
          style={{
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              color: "rgba(255, 255, 255, 0.5)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: "8px",
            }}
          >
            Score
          </div>
          <div
            style={{
              fontSize: "28px",
              fontWeight: "700",
              color: "#fbbf24",
              fontVariantNumeric: "tabular-nums",
              lineHeight: "1",
            }}
          >
            {score}
          </div>
        </div>

        {/* 랩 기록 리스트 */}
        {lapRecords.length > 0 && (
          <div
            style={{
              marginTop: "16px",
              paddingTop: "16px",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
              maxHeight: "100px",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                fontSize: "9px",
                color: "rgba(255, 255, 255, 0.5)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "6px",
              }}
            >
              Lap Times
            </div>
            {lapRecords.map((record) => {
              const isBest = bestLapTime === record.lapTime;
              return (
                <div
                  key={record.lapNumber}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "4px 8px",
                    background: isBest
                      ? "rgba(251, 191, 36, 0.15)"
                      : "rgba(255, 255, 255, 0.03)",
                    borderRadius: "4px",
                    marginBottom: "4px",
                    border: isBest
                      ? "1px solid rgba(251, 191, 36, 0.3)"
                      : "none",
                  }}
                >
                  <span
                    style={{
                      fontSize: "10px",
                      color: "rgba(255, 255, 255, 0.7)",
                      fontWeight: isBest ? "600" : "400",
                    }}
                  >
                    Lap {record.lapNumber}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "600",
                      color: isBest ? "#fbbf24" : "rgba(255, 255, 255, 0.9)",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {formatTime(record.lapTime)}
                    {isBest && " ⭐"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
