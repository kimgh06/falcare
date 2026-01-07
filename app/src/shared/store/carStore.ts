import { create } from "zustand";

// 랩 기록 타입
export type LapRecord = {
  lapNumber: number; // 랩 번호 (1부터 시작)
  lapTime: number; // 랩 시간 (ms)
};

// 리플레이 프레임 타입
export type ReplayFrame = {
  time: number; // 리플레이 시작으로부터 경과 시간 (ms)
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number; w: number };
};

type CarState = {
  // 차량 위치
  position: { x: number; y: number; z: number } | null;
  savePointId: number;
  // 속도
  speed: number;
  // 충돌 상태
  collision: boolean;
  // 드리프트 모드
  driftMode: boolean;
  // 드리프트 점수
  score: number;
  // 드리프트 게이지 (0-100)
  driftGauge: number;
  // 감지된 오브젝트 거리
  detectedDistance: number | null;
  // 감지된 오브젝트 여부
  detectedObject: boolean;

  // 랩 타임 시스템
  totalLaps: number; // 총 바퀴 수 (설정 가능)
  currentLap: number; // 현재 랩 (0이면 아직 시작 전)
  lapStartTime: number | null; // 현재 랩 시작 시간
  lapRecords: LapRecord[]; // 완료된 랩 기록
  raceStartTime: number | null; // 경주 시작 시간

  // 리플레이 시스템
  replayFrames: ReplayFrame[]; // 녹화된 프레임
  isRecordingReplay: boolean;
  isReplaying: boolean;
  replayStartTime: number | null; // 재생 시작 시각
};

type CarActions = {
  setPosition: (position: { x: number; y: number; z: number } | null) => void;
  setSavePointId: (savePointId: number) => void;
  setSpeed: (speed: number) => void;
  setCollision: (collision: boolean) => void;
  setDriftMode: (driftMode: boolean) => void;
  setScore: (score: number) => void;
  setDriftGauge: (gauge: number) => void;
  setDetectedDistance: (distance: number | null) => void;
  setDetectedObject: (detected: boolean) => void;
  incrementScore: () => void;
  resetScore: () => void;

  // 랩 타임 관련 액션
  setTotalLaps: (laps: number) => void;
  startLap: () => void;
  completeLap: () => void;
  resetRace: () => void;
  getCurrentLapTime: () => number;
  getBestLapTime: () => number | null;
  getTotalTime: () => number;

  // 리플레이 관련 액션
  startReplayRecording: () => void;
  stopReplayRecording: () => void;
  clearReplay: () => void;
  addReplayFrame: (frame: ReplayFrame) => void;
  loadReplay: (frames: ReplayFrame[]) => void;
  startReplay: () => void;
  stopReplay: () => void;
};

export const useCarStore = create<CarState & CarActions>((set, get) => ({
  // 초기 상태
  position: null,
  savePointId: 0,
  speed: 0,
  collision: false,
  driftMode: false,
  score: 0,
  driftGauge: 0,
  detectedDistance: null,
  detectedObject: false,

  // 랩 타임 초기 상태
  totalLaps: 3,
  currentLap: 0,
  lapStartTime: null,
  lapRecords: [],
  raceStartTime: null,

  // 리플레이 초기 상태
  replayFrames: [],
  isRecordingReplay: false,
  isReplaying: false,
  replayStartTime: null,

  // Actions
  setPosition: (position) => set({ position }),
  setSavePointId: (savePointId) => set({ savePointId }),
  setSpeed: (speed) => set({ speed }),
  setCollision: (collision) => set({ collision }),
  setDriftMode: (driftMode) => set({ driftMode }),
  setScore: (score) => set({ score }),
  setDriftGauge: (driftGauge) => set({ driftGauge }),
  setDetectedDistance: (detectedDistance) => set({ detectedDistance }),
  setDetectedObject: (detectedObject) => set({ detectedObject }),
  incrementScore: () => set((state) => ({ score: state.score + 1 })),
  resetScore: () => set({ score: 0 }),

  // 랩 타임 액션
  setTotalLaps: (laps) => set({ totalLaps: Math.max(1, laps) }),

  startLap: () => {
    const now = performance.now();
    const state = get();

    // 첫 랩 시작이면 경주 시작 시간도 함께 설정
    if (state.raceStartTime === null) {
      set({
        raceStartTime: now,
        currentLap: 1,
        lapStartTime: now,
        lapRecords: [], // 새 경주 시작 시 기존 기록 초기화
      });
    } else {
      set({
        currentLap: state.currentLap + 1,
        lapStartTime: now,
      });
    }
  },

  completeLap: () => {
    const state = get();
    const now = performance.now();

    if (state.lapStartTime === null || state.currentLap === 0) return;

    const lapTime = now - state.lapStartTime;
    const newRecord: LapRecord = {
      lapNumber: state.currentLap,
      lapTime,
    };

    set({
      lapRecords: [...state.lapRecords, newRecord],
      lapStartTime: null, // 랩이 끝났음을 표시
    });
  },

  resetRace: () => {
    set({
      currentLap: 0,
      lapStartTime: null,
      lapRecords: [],
      raceStartTime: null,
      savePointId: 0,
    });
  },

  getCurrentLapTime: () => {
    const state = get();

    // 진행 중인 랩이 있으면 경과 시간 계산
    if (state.lapStartTime !== null) {
      return performance.now() - state.lapStartTime;
    }

    // 진행 중인 랩이 없고, 마지막 랩 기록이 있으면 그 값을 유지
    if (state.lapRecords.length > 0) {
      const last = state.lapRecords[state.lapRecords.length - 1];
      return last.lapTime;
    }

    return 0;
  },

  getBestLapTime: () => {
    const state = get();
    if (state.lapRecords.length === 0) return null;
    return Math.min(...state.lapRecords.map((r) => r.lapTime));
  },

  getTotalTime: () => {
    const state = get();
    if (state.raceStartTime === null) return 0;
    return performance.now() - state.raceStartTime;
  },

  // 리플레이 액션
  startReplayRecording: () => {
    // 새 녹화 시작 시 기존 프레임은 비우지 않는다 (원하면 clearReplay 호출)
    set({ isRecordingReplay: true });
  },

  stopReplayRecording: () => {
    set({ isRecordingReplay: false });
  },

  clearReplay: () => {
    set({
      replayFrames: [],
      isRecordingReplay: false,
      isReplaying: false,
      replayStartTime: null,
    });
  },

  addReplayFrame: (frame: ReplayFrame) => {
    const state = get();
    // 너무 많은 프레임을 방지하기 위해 상한 설정 (예: 60 FPS * 300초 = 18,000)
    if (state.replayFrames.length > 20000) return;
    set({ replayFrames: [...state.replayFrames, frame] });
  },

  loadReplay: (frames: ReplayFrame[]) => {
    set({
      replayFrames: frames,
      isRecordingReplay: false,
      isReplaying: false,
      replayStartTime: null,
    });
  },

  startReplay: () => {
    const state = get();
    if (state.replayFrames.length === 0) return;
    set({
      isReplaying: true,
      replayStartTime: performance.now(),
    });
  },

  stopReplay: () => {
    set({
      isReplaying: false,
      replayStartTime: null,
    });
  },
}));
