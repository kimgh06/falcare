import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Euler, Object3D, Quaternion, Vector3 } from "three";
import { useCarStore, type ReplayFrame } from "~/src/shared/store/carStore";

type GhostCarProps = {
  color?: string;
};

export default function GhostCar({ color = "cyan" }: GhostCarProps) {
  const ghostObject = useRef<Object3D>(new Object3D());
  const tempPos = useRef(new Vector3());
  const tempQuat = useRef(new Quaternion());
  const tempEuler = useRef(new Euler());

  const { replayFrames, isReplaying, replayStartTime, stopReplay } =
    useCarStore();

  useFrame(() => {
    if (!isReplaying || !replayStartTime || replayFrames.length === 0) return;

    const now = performance.now();
    const elapsed = now - replayStartTime;

    // 마지막 프레임을 넘으면 재생 종료
    const lastFrame = replayFrames[replayFrames.length - 1];
    if (elapsed >= lastFrame.time) {
      // 마지막 위치에 고정 후 정지
      applyFrame(lastFrame);
      stopReplay();
      return;
    }

    // 현재 시간에 해당하는 두 프레임 찾기
    let i = 0;
    while (i < replayFrames.length - 1 && replayFrames[i + 1].time < elapsed) {
      i++;
    }

    const current = replayFrames[i];
    const next = replayFrames[i + 1] ?? current;

    // 두 프레임 사이 보간 비율
    const dt = next.time - current.time || 1;
    const t = (elapsed - current.time) / dt;

    // 위치 보간
    tempPos.current.set(
      lerp(current.position.x, next.position.x, t),
      lerp(current.position.y, next.position.y, t),
      lerp(current.position.z, next.position.z, t)
    );

    // 회전 보간 (쿼터니언 slerp)
    tempQuat.current.set(
      current.rotation.x,
      current.rotation.y,
      current.rotation.z,
      current.rotation.w
    );
    const nextQuat = new Quaternion(
      next.rotation.x,
      next.rotation.y,
      next.rotation.z,
      next.rotation.w
    );
    tempQuat.current.slerp(nextQuat, t);

    ghostObject.current.position.copy(tempPos.current);
    ghostObject.current.quaternion.copy(tempQuat.current);
  });

  const applyFrame = (frame: ReplayFrame) => {
    ghostObject.current.position.set(
      frame.position.x,
      frame.position.y,
      frame.position.z
    );
    ghostObject.current.quaternion.set(
      frame.rotation.x,
      frame.rotation.y,
      frame.rotation.z,
      frame.rotation.w
    );
  };

  return (
    <group ref={ghostObject}>
      <mesh castShadow>
        <boxGeometry args={[1, 0.5, 2]} />
        <meshStandardMaterial color={color} transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}


