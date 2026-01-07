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

  return (
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
        padding: "12px 16px",
        borderRadius: "12px",
        fontFamily:
          '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", "Source Code Pro", monospace',
        fontSize: "12px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow:
          "0 4px 16px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05) inset",
        minWidth: "360px",
        maxWidth: "440px",
        zIndex: 1000,
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      {/* 랩 타임 헤더 섹션 */}
      {mounted && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingBottom: "10px",
            marginBottom: "10px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
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
                fontSize: "16px",
                fontWeight: "700",
                color: "#60a5fa",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {`${displayLap} / ${totalLaps}`}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
            }}
          >
            {/* 현재 랩 타임 */}
            {currentLap > 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: "4px",
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
                  Current
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: "700",
                    color: "#34d399",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {formatTime(currentLapTime)}
                </div>
              </div>
            )}

            {/* 최고 랩 타임 */}
            {bestLapTime !== null && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: "2px",
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
                  Best
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: "700",
                    color: "#fbbf24",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {formatTime(bestLapTime)}
                </div>
              </div>
            )}

            {/* 총 시간 */}
            {currentLap > 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: "2px",
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
                  Total
                </div>
                <div
                  style={{
                    fontSize: "14px",
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
        </div>
      )}

      {/* 랩 기록 리스트 */}
      {lapRecords.length > 0 && (
        <div
          style={{
            marginBottom: "10px",
            paddingBottom: "10px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            maxHeight: "120px",
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
                  border: isBest ? "1px solid rgba(251, 191, 36, 0.3)" : "none",
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

      {/* 체크포인트 정보 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingBottom: "10px",
          marginBottom: "10px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <div
            style={{
              fontSize: "9px",
              color: "rgba(255, 255, 255, 0.5)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Checkpoint
          </div>
          <div
            style={{
              fontSize: "14px",
              fontWeight: "700",
              color: "#60a5fa",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            #{savePointId}
          </div>
        </div>
      </div>

      {/* 차량 상태 정보 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "6px",
        }}
      >
        {/* Position */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "6px 10px",
            background: "rgba(255, 255, 255, 0.03)",
            borderRadius: "6px",
          }}
        >
          <span
            style={{
              color: "rgba(255, 255, 255, 0.6)",
              fontSize: "11px",
              fontWeight: "500",
            }}
          >
            Position
          </span>
          <span
            style={{
              fontWeight: "600",
              color: "#ffffff",
              fontVariantNumeric: "tabular-nums",
              fontSize: "11px",
            }}
          >
            {position
              ? `${position.x.toFixed(1)}, ${position.y.toFixed(
                  1
                )}, ${position.z.toFixed(1)}`
              : "0.0, 0.0, 0.0"}
          </span>
        </div>

        {/* Speed */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "6px 10px",
            background: "rgba(255, 255, 255, 0.03)",
            borderRadius: "6px",
          }}
        >
          <span
            style={{
              color: "rgba(255, 255, 255, 0.6)",
              fontSize: "11px",
              fontWeight: "500",
            }}
          >
            Speed
          </span>
          <span
            style={{
              fontWeight: "700",
              color: speed > 5 ? "#f87171" : "#4ade80",
              fontVariantNumeric: "tabular-nums",
              fontSize: "12px",
            }}
          >
            {speed.toFixed(1)} m/s
          </span>
        </div>

        {/* Collision */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "6px 10px",
            background: "rgba(255, 255, 255, 0.03)",
            borderRadius: "6px",
          }}
        >
          <span
            style={{
              color: "rgba(255, 255, 255, 0.6)",
              fontSize: "11px",
              fontWeight: "500",
            }}
          >
            Contact
          </span>
          <span
            style={{
              fontWeight: "600",
              color: collision ? "#fbbf24" : "#6ee7b7",
              fontSize: "11px",
            }}
          >
            {collision ? "Touching" : "Air"}
          </span>
        </div>

        {/* Drift */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "6px 10px",
            background: "rgba(255, 255, 255, 0.03)",
            borderRadius: "6px",
          }}
        >
          <span
            style={{
              color: "rgba(255, 255, 255, 0.6)",
              fontSize: "11px",
              fontWeight: "500",
            }}
          >
            Drift Mode
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                fontWeight: "700",
                color: driftMode ? "#fbbf24" : "#a5b4fc",
                fontSize: "11px",
              }}
            >
              {driftMode ? "Drift" : "Normal"}
            </span>
            {score > 0 && (
              <span
                style={{
                  fontWeight: "600",
                  color: "#ffffff",
                  background: "rgba(251, 191, 36, 0.2)",
                  padding: "2px 6px",
                  borderRadius: "10px",
                  fontSize: "9px",
                }}
              >
                {score}
              </span>
            )}
          </div>
        </div>

        {/* Detection */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "6px 10px",
            background: "rgba(255, 255, 255, 0.03)",
            borderRadius: "6px",
            gridColumn: "span 2",
          }}
        >
          <span
            style={{
              color: "rgba(255, 255, 255, 0.6)",
              fontSize: "11px",
              fontWeight: "500",
            }}
          >
            Detection
          </span>
          <span
            style={{
              fontWeight: "600",
              color: detectedObject ? "#4ade80" : "rgba(255, 255, 255, 0.4)",
              fontVariantNumeric: "tabular-nums",
              fontSize: "11px",
            }}
          >
            {detectedDistance !== null
              ? `${detectedDistance.toFixed(2)} m`
              : "0.00 m"}
          </span>
        </div>
      </div>

      {/* 드리프트 게이지 */}
      <div
        style={{
          marginTop: "10px",
          paddingTop: "10px",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "6px",
          }}
        >
          <span
            style={{
              color: "rgba(255, 255, 255, 0.6)",
              fontSize: "10px",
              fontWeight: "500",
            }}
          >
            Drift Gauge
          </span>
          <span
            style={{
              fontWeight: "700",
              color: "#ffffff",
              fontSize: "11px",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {Math.round(driftGauge)}%
          </span>
        </div>
        <div
          style={{
            width: "100%",
            height: "8px",
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

      {/* 리플레이 컨트롤 */}
      <div
        style={{
          marginTop: "10px",
          paddingTop: "10px",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          pointerEvents: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span
            style={{
              color: "rgba(255, 255, 255, 0.6)",
              fontSize: "10px",
              fontWeight: "500",
            }}
          >
            Replay
          </span>
          <div
            style={{
              display: "flex",
              gap: "6px",
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
                fontSize: "10px",
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
                fontSize: "10px",
                borderRadius: "6px",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                background: isReplaying
                  ? "rgba(96, 165, 250, 0.5)"
                  : "rgba(15, 23, 42, 0.8)",
                color:
                  replayFrames.length === 0 ? "rgba(255,255,255,0.3)" : "#fff",
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
                fontSize: "10px",
                borderRadius: "6px",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                background: "rgba(15, 23, 42, 0.8)",
                color:
                  replayFrames.length === 0 ? "rgba(255,255,255,0.3)" : "#fff",
                cursor: replayFrames.length === 0 ? "not-allowed" : "pointer",
              }}
            >
              Export
            </button>
            <label
              style={{
                padding: "4px 8px",
                fontSize: "10px",
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
        </div>
        <div
          style={{
            fontSize: "9px",
            color: "rgba(255,255,255,0.4)",
          }}
        >
          Frames: {replayFrames.length}
        </div>
      </div>
    </div>
  );
}
