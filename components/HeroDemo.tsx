"use client";

import { useState, useRef, useCallback } from "react";
import DemoCanvas, { type DemoCanvasHandle } from "@/components/DemoCanvas";
import DemoControls from "@/components/DemoControls";
import { DEMO_POINTS, DEMO_RESULTS } from "@/lib/demo-data";

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export default function HeroDemo() {
  const [step, setStep] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [stats, setStats] = useState({
    points: 0,
    area: "—",
    perimeter: "—",
    traverse: "—",
  });
  const [exporting, setExporting] = useState(false);
  const canvasRef = useRef<DemoCanvasHandle>(null);

  const addLog = useCallback((msg: string) => {
    setLogs((prev) => [...prev, msg]);
  }, []);

  const handleStart = useCallback(async () => {
    setStep(1);
    addLog("Parsing RW5 bestand...");
    await delay(600);
    addLog("4 GPS punten gevonden.");

    setStep(2);
    for (let i = 0; i < 4; i++) {
      await delay(600);
      const pt = DEMO_POINTS[i];
      canvasRef.current?.revealPoint(i);
      addLog(`Punt ${pt.id} geplot: N${pt.n} E${pt.e}`);
      setStats((s) => ({ ...s, points: i + 1 }));
    }

    setStep(3);
    await delay(400);
    addLog("AI: Polygon verbinding berekend...");

    await new Promise<void>((resolve) => {
      canvasRef.current?.startPolygonDraw(() => {
        canvasRef.current?.showDims();
        resolve();
      });
    });

    await delay(300);
    canvasRef.current?.showAreaLabel();
    setStats({
      points: 4,
      area: DEMO_RESULTS.area,
      perimeter: DEMO_RESULTS.perimeter,
      traverse: DEMO_RESULTS.traverse,
    });
    addLog("✓ Perceelkaart gereed. Klaar voor export.");

    setStep(4);
    await delay(500);
    canvasRef.current?.showExport();
  }, [addLog]);

  const handleReset = useCallback(() => {
    setStep(0);
    setLogs([]);
    setStats({ points: 0, area: "—", perimeter: "—", traverse: "—" });
    setExporting(false);
    canvasRef.current?.reset();
  }, []);

  const handleExport = useCallback(async () => {
    setExporting(true);
    addLog("Exporteren naar PDF en DXF...");
    await delay(1200);
    addLog("✓ Export succesvol. Bestanden klaar voor download.");
    setExporting(false);
  }, [addLog]);

  return (
    <section
      id="hero"
      className="min-h-[calc(100vh-60px)] pt-[60px] relative overflow-hidden"
    >
      {/* Glow effect */}
      <div
        className="pointer-events-none absolute z-0"
        style={{
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 900,
          height: 600,
          background:
            "radial-gradient(ellipse at 40% 50%, rgba(34,197,94,0.14) 0%, transparent 60%), radial-gradient(ellipse at 65% 40%, rgba(6,182,212,0.07) 0%, transparent 55%)",
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] h-full min-h-[calc(100vh-60px)]">
        {/* Left: text + controls */}
        <div className="flex flex-col p-6 lg:p-10 justify-center relative z-10">
          {/* Badge */}
          <div className="mb-2">
            <span className="inline-flex items-center gap-2 font-mono text-[11px] text-green tracking-widest uppercase px-3 py-1.5 border border-green/30 rounded-sm bg-green/5 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
              Coming Soon &middot; Suriname &amp; Caribbean
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-3xl lg:text-5xl font-black leading-tight tracking-tight mb-5 text-text">
            Van veldmeting naar{" "}
            <span className="text-green [text-shadow:0_0_40px_rgba(34,197,94,0.3)]">
              offici&euml;le kaart
            </span>{" "}
            in 15 minuten.
          </h1>

          {/* Subtext */}
          <p className="text-base text-text2 leading-relaxed mb-8 max-w-md border-l-2 border-green-dim pl-5">
            SurveyFlow automatiseert de complete landmeet workflow. Importeer
            RW5, CRD en BIN bestanden — de AI genereert de perceelkaart, jij
            keurt goed.
          </p>

          {/* Demo controls */}
          <DemoControls
            step={step}
            logs={logs}
            stats={stats}
            onStart={handleStart}
            onReset={handleReset}
            onExport={handleExport}
            exporting={exporting}
          />
        </div>

        {/* Right: canvas */}
        <div className="relative bg-[var(--canvas-bg)] border-l border-border min-h-[400px]">
          <DemoCanvas ref={canvasRef} />
        </div>
      </div>
    </section>
  );
}
