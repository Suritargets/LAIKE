"use client";

import { useRef, useEffect, useImperativeHandle, forwardRef } from "react";
import { DemoEngine } from "@/lib/demo-engine";

export interface DemoCanvasHandle {
  revealPoint(index: number): void;
  startPolygonDraw(onComplete: () => void): void;
  showDims(): void;
  showAreaLabel(): void;
  showExport(): void;
  reset(): void;
}

const DemoCanvas = forwardRef<DemoCanvasHandle, {}>(function DemoCanvas(
  _,
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<DemoEngine | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const engine = new DemoEngine(canvasRef.current);
    engineRef.current = engine;
    engine.start();

    const handleResize = () => engine.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      engine.destroy();
    };
  }, []);

  useImperativeHandle(ref, () => ({
    revealPoint: (i: number) => engineRef.current?.revealPoint(i),
    startPolygonDraw: (cb: () => void) =>
      engineRef.current?.startPolygonDraw(cb),
    showDims: () => engineRef.current?.showDims(),
    showAreaLabel: () => engineRef.current?.showAreaLabel(),
    showExport: () => engineRef.current?.showExport(),
    reset: () => engineRef.current?.reset(),
  }));

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block"
      onMouseMove={(e) => engineRef.current?.handleMouseMove(e.nativeEvent)}
      onMouseLeave={() => engineRef.current?.handleMouseLeave()}
    />
  );
});

export default DemoCanvas;
