import { RigidBody, CuboidCollider } from "@react-three/rapier";
import { useMemo } from "react";
import { Html, Plane } from "@react-three/drei";
import { MeshStandardMaterial, DoubleSide } from "three";
import { useCarStore } from "../shared/store/carStore";

export type SavePointData = {
  position: [number, number, number];
  rotationY: number;
};

type SavePointProps = {
  id: number; // 세이브 포인트 고유 번호
  maxId: number;
  position: [number, number, number];
  rotationY?: number;
  size?: [number, number]; // [width, height]
  color?: string; // 색상
  // R 키로 리셋될 때 적용할 위치/방향 (미리 설정된 값)
};

/**
 * 세이브 포인트 컴포넌트 (발판 방식)
 * 차량이 발판 위에 올라가면 세이브 포인트 번호를 저장합니다.
 */
export default function SavePoint({
  id,
  maxId,
  position = [0, 0, 0],
  size = [5, 2],
  color = "#00ff00", // 녹색
  rotationY = 0, // 기본 방향: 월드 Z-축 기준
}: SavePointProps) {
  const {
    savePointId,
    setSavePointId,
    currentLap,
    totalLaps,
    startLap,
    completeLap,
  } = useCarStore();
  const isNextSavePoint = id - 1 !== savePointId && savePointId !== maxId;

  // Material 메모이제이션 (녹색 발판)
  const material = useMemo(
    () =>
      new MeshStandardMaterial({
        color: isNextSavePoint ? color : "#ff0000",
        transparent: true,
        opacity: 0.5, // 발판이므로 조금 더 진하게
        side: DoubleSide,
      }),
    [isNextSavePoint, color]
  );

  return (
    <RigidBody
      type="fixed"
      position={position}
      rotation={[0, -rotationY, 0]}
      sensor={true}
      onIntersectionEnter={(event) => {
        const otherBody = event.other.rigidBody;
        // check that it is player's car.
        if (!otherBody || !otherBody.isDynamic()) return;

        // Start 라인 (id === 0) 통과 시
        if (id === 0) {
          // 첫 시작이거나 이전 랩을 완료한 경우에만 랩 시작
          if (savePointId === maxId || currentLap === 0) {
            startLap();
            setSavePointId(0);
          }
          return;
        }

        // Finish 라인 (id === maxId) 통과 시
        if (id === maxId) {
          // 이전 체크포인트를 모두 통과했고, 랩이 시작된 경우에만 랩 완료
          if (id - 1 === savePointId && currentLap > 0) {
            completeLap();

            // 경주 완료 체크
            if (currentLap >= totalLaps) {
              console.log(`경주 완료! 총 ${totalLaps}바퀴 완주했습니다.`);
            }
          }
          setSavePointId(id);
          return;
        }

        // 일반 체크포인트 통과
        if (id - 1 === savePointId && savePointId !== maxId) {
          setSavePointId(id);
        }
      }}
    >
      <Plane args={size} material={material} />
      <Html style={{ fontSize: "30px" }}>
        {id === 0 ? "Start" : id === maxId ? "Finish" : id}
      </Html>
    </RigidBody>
  );
}
