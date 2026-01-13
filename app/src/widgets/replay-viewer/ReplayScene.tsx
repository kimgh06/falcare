import { useFrame, useThree } from "@react-three/fiber";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { useEffect, useRef, useMemo } from "react";
import { Vector3, Quaternion, Euler, Object3D } from "three";
import { Box } from "@react-three/drei";
import MapFloor from "~/src/entities/floor";
import Map from "~/src/entities/map";
import GhostCar, { type GhostCarHandle } from "~/src/entities/ghost-car";
import { useCarStore } from "~/src/shared/store/carStore";

// ===============================
// 카메라 설정 상수
// ===============================
const CAMERA_CONFIG = {
  DISTANCE: {
    DEFAULT: 3.1,
    MIN: 0.3,
    MAX: 10,
  },
  ROTATION: {
    PITCH: -0.3,
    MOUSE_SENSITIVITY: 0.002,
  },
  WHEEL: {
    SENSITIVITY: 0.005,
  },
  FOLLOW: {
    POSITION_SPEED: 20,
    ROTATION_SPEED: 15,
  },
} as const;

function ReplayScene() {
  const { camera } = useThree();
  const ghostCarRef = useRef<GhostCarHandle>(null);

  // useFrame에서 재사용할 객체들
  const tempVector = useRef(new Vector3());
  const tempEuler = useRef(new Euler());

  // 카메라 계층 구조
  const pivot = useMemo(() => new Object3D(), []);
  const yaw = useMemo(() => new Object3D(), []);
  const pitch = useMemo(() => new Object3D(), []);

  useEffect(() => {
    pivot.add(yaw);
    yaw.add(pitch);
    pitch.add(camera);
    camera.position.z = CAMERA_CONFIG.DISTANCE.DEFAULT;
  }, [pivot, yaw, pitch, camera]);

  // 마우스 컨트롤
  const yawRotation = useRef(0);
  const pitchRotation = useRef(CAMERA_CONFIG.ROTATION.PITCH);
  const cameraDistance = useRef<number>(CAMERA_CONFIG.DISTANCE.DEFAULT);

  const onDocumentMouseMove = (e: MouseEvent) => {
    if (e.buttons === 0) return;
    yawRotation.current -=
      e.movementX * CAMERA_CONFIG.ROTATION.MOUSE_SENSITIVITY;
  };

  const onDocumentMouseWheel = (e: WheelEvent) => {
    e.preventDefault();
    const v =
      cameraDistance.current + e.deltaY * CAMERA_CONFIG.WHEEL.SENSITIVITY;
    if (v >= CAMERA_CONFIG.DISTANCE.MIN && v <= CAMERA_CONFIG.DISTANCE.MAX) {
      cameraDistance.current = v;
    }
  };

  useEffect(() => {
    document.addEventListener("mousemove", onDocumentMouseMove);
    document.addEventListener("wheel", onDocumentMouseWheel);

    return () => {
      document.removeEventListener("mousemove", onDocumentMouseMove);
      document.removeEventListener("wheel", onDocumentMouseWheel);
    };
  }, []);

  useFrame((state, delta) => {
    const { replayFrames } = useCarStore.getState();

    // 리플레이가 없거나 차량이 없으면 카메라 업데이트 안 함
    if (replayFrames.length === 0 || !ghostCarRef.current) {
      return;
    }

    const ghostObject = ghostCarRef.current.object;
    ghostObject.getWorldPosition(tempVector.current);

    // Follow 모드: 차량을 따라가며 차량 방향을 바라봄
    const targetPos = tempVector.current.clone();
    targetPos.y += 0.5; // followTarget 높이

    pivot.position.lerp(targetPos, delta * CAMERA_CONFIG.FOLLOW.POSITION_SPEED);

    const ghostRotation = ghostObject.quaternion;
    tempEuler.current.setFromQuaternion(ghostRotation, "YXZ");
    const targetYaw = tempEuler.current.y;

    let deltaYaw = targetYaw - yawRotation.current;
    while (deltaYaw > Math.PI) deltaYaw -= Math.PI * 2;
    while (deltaYaw < -Math.PI) deltaYaw += Math.PI * 2;

    yawRotation.current +=
      deltaYaw * CAMERA_CONFIG.FOLLOW.ROTATION_SPEED * delta;
    pitchRotation.current = CAMERA_CONFIG.ROTATION.PITCH;

    yaw.rotation.y = yawRotation.current;
    pitch.rotation.x = pitchRotation.current;
    camera.position.z = cameraDistance.current;
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <primitive object={pivot} />
      {/* 리플레이 고스트 차량 */}
      <GhostCar ref={ghostCarRef} color="cyan" />
      <Map />
      <MapFloor />
    </>
  );
}

export default ReplayScene;
