import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { Suspense, useRef } from "react";
import ReplayScene from "./ReplayScene";
import ReplayControls from "./ReplayControls";

// 컨트롤 패널 높이 (하드코딩)
const CONTROLS_PANEL_HEIGHT = 170;

export default function ReplayViewer() {
  const controlsRef = useRef<HTMLDivElement>(null);

  return (
    <div
      style={{
        position: "relative",
        width: "100svw",
        height: "100svh",
        overflow: "hidden",
      }}
    >
      <Canvas
        style={{
          width: "100svw",
          height: `calc(100svh - ${CONTROLS_PANEL_HEIGHT}px)`,
          display: "block",
        }}
      >
        <color attach="background" args={["white"]} />
        <Suspense>
          <Physics>
            <ReplayScene />
          </Physics>
        </Suspense>
      </Canvas>
      <ReplayControls ref={controlsRef} />
    </div>
  );
}
