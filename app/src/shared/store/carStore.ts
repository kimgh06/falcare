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
  velocity: { x: number; y: number; z: number }; // 차량의 선형 속도
  driftGauge: number; // 드리프트 게이지 (0-100)
  score: number; // 드리프트 점수
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
  raceEndTime: number | null; // 경주 종료 시간 (경주 완료 시 설정)
  isRaceComplete: boolean; // 경주 완료 여부

  // 리플레이 시스템
  replayFrames: ReplayFrame[]; // 녹화된 프레임
  isRecordingReplay: boolean;
  isReplaying: boolean;
  replayStartTime: number | null; // 재생 시작 시각
  isReplayPaused: boolean; // 일시정지 상태
  replaySpeed: number; // 재생 속도 (0.5, 1.0, 2.0 등)
  replayPausedTime: number | null; // 일시정지된 시점의 경과 시간
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
  pauseReplay: () => void;
  resumeReplay: () => void;
  setReplaySpeed: (speed: number) => void;
  seekReplay: (time: number) => void; // 특정 시점으로 이동 (ms)
  getReplayCurrentTime: () => number; // 현재 재생 시간 반환 (ms)
  getReplayTotalTime: () => number; // 총 리플레이 시간 반환 (ms)
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
  totalLaps: 2, // 디버깅용: 2바퀴
  currentLap: 0,
  lapStartTime: null,
  lapRecords: [],
  raceStartTime: null,
  raceEndTime: null,
  isRaceComplete: false,

  // 리플레이 초기 상태
  replayFrames: [],
  isRecordingReplay: false,
  isReplaying: false,
  replayStartTime: null,
  isReplayPaused: false,
  replaySpeed: 1.0,
  replayPausedTime: null,

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

    // 경주가 완료된 상태면 새 랩 시작 불가
    if (state.isRaceComplete) return;

    // 첫 랩 시작이면 경주 시작 시간도 함께 설정하고 자동 녹화 시작
    if (state.raceStartTime === null) {
      set({
        raceStartTime: now,
        currentLap: 1,
        lapStartTime: now,
        lapRecords: [], // 새 경주 시작 시 기존 기록 초기화
        raceEndTime: null,
        isRaceComplete: false,
        // 자동 녹화 시작
        isRecordingReplay: true,
        replayFrames: [], // 새 경주 시작 시 기존 리플레이 초기화
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

    const updatedRecords = [...state.lapRecords, newRecord];
    const isComplete = updatedRecords.length >= state.totalLaps;

    set({
      lapRecords: updatedRecords,
      lapStartTime: null, // 랩이 끝났음을 표시
      // 모든 랩 완료 시 경주 종료 처리
      isRaceComplete: isComplete,
      raceEndTime: isComplete ? now : null,
      // 경주 완료 시 녹화 자동 중지
      isRecordingReplay: isComplete ? false : state.isRecordingReplay,
    });
  },

  resetRace: () => {
    set({
      currentLap: 0,
      lapStartTime: null,
      lapRecords: [],
      raceStartTime: null,
      raceEndTime: null,
      isRaceComplete: false,
      savePointId: 0,
      // 리플레이도 초기화
      replayFrames: [],
      isRecordingReplay: false,
      isReplaying: false,
      replayStartTime: null,
    });
  },

  getCurrentLapTime: () => {
    const state = get();

    // 경주가 완료되었으면 시간 정지
    if (state.isRaceComplete && state.raceEndTime !== null) {
      // 마지막 랩 기록 반환
      if (state.lapRecords.length > 0) {
        const last = state.lapRecords[state.lapRecords.length - 1];
        return last.lapTime;
      }
      return 0;
    }

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
    
    // 경주가 완료되었으면 종료 시각 기준으로 시간 정지
    if (state.isRaceComplete && state.raceEndTime !== null) {
      return state.raceEndTime - state.raceStartTime;
    }
    
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
      isReplayPaused: false,
      replayPausedTime: null,
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
      isReplayPaused: false,
      replayPausedTime: null,
    });
  },

  startReplay: () => {
    const state = get();
    if (state.replayFrames.length === 0) return;
    const pausedTime = state.replayPausedTime ?? 0;
    set({
      isReplaying: true,
      isReplayPaused: false,
      replayStartTime: performance.now() - pausedTime / state.replaySpeed,
      replayPausedTime: null,
    });
  },

  stopReplay: () => {
    set({
      isReplaying: false,
      isReplayPaused: false,
      replayStartTime: null,
      replayPausedTime: null,
    });
  },

  pauseReplay: () => {
    const state = get();
    if (!state.isReplaying || state.isReplayPaused) return;
    
    // 현재 재생 시간 계산
    const now = performance.now();
    const elapsed = (now - (state.replayStartTime ?? now)) * state.replaySpeed;
    const lastFrame = state.replayFrames[state.replayFrames.length - 1];
    const currentTime = Math.min(elapsed, lastFrame?.time ?? 0);
    
    set({
      isReplayPaused: true,
      replayPausedTime: currentTime,
    });
  },

  resumeReplay: () => {
    const state = get();
    if (!state.isReplaying || !state.isReplayPaused) return;
    
    const pausedTime = state.replayPausedTime ?? 0;
    set({
      isReplayPaused: false,
      replayStartTime: performance.now() - pausedTime / state.replaySpeed,
      replayPausedTime: null,
    });
  },

  setReplaySpeed: (speed: number) => {
    const state = get();
    if (!state.isReplaying) {
      set({ replaySpeed: speed });
      return;
    }
    
    // 재생 중이면 현재 시간을 보존하면서 속도 변경
    const now = performance.now();
    const currentTime = state.isReplayPaused
      ? (state.replayPausedTime ?? 0)
      : (now - (state.replayStartTime ?? now)) * state.replaySpeed;
    
    set({
      replaySpeed: speed,
      replayStartTime: state.isReplayPaused ? state.replayStartTime : now - currentTime / speed,
    });
  },

  seekReplay: (time: number) => {
    const state = get();
    if (state.replayFrames.length === 0) return;
    
    const lastFrame = state.replayFrames[state.replayFrames.length - 1];
    const clampedTime = Math.max(0, Math.min(time, lastFrame.time));
    
    if (state.isReplaying) {
      set({
        replayStartTime: performance.now() - clampedTime / state.replaySpeed,
        replayPausedTime: state.isReplayPaused ? clampedTime : null,
      });
    } else {
      set({
        replayPausedTime: clampedTime,
      });
    }
  },

  getReplayCurrentTime: () => {
    const state = get();
    if (state.replayFrames.length === 0) return 0;
    
    if (state.isReplayPaused) {
      return state.replayPausedTime ?? 0;
    }
    
    if (!state.isReplaying || !state.replayStartTime) return 0;
    
    const now = performance.now();
    const elapsed = (now - state.replayStartTime) * state.replaySpeed;
    const lastFrame = state.replayFrames[state.replayFrames.length - 1];
    return Math.min(elapsed, lastFrame.time);
  },

  getReplayTotalTime: () => {
    const state = get();
    if (state.replayFrames.length === 0) return 0;
    const lastFrame = state.replayFrames[state.replayFrames.length - 1];
    return lastFrame.time;
  },
}));
