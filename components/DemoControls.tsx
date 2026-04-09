"use client";

import { useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DEMO_STEPS, RW5_LINES } from "@/lib/demo-data";

interface DemoControlsProps {
  step: number;
  logs: string[];
  stats: { points: number; area: string; perimeter: string; traverse: string };
  onStart: () => void;
  onReset: () => void;
  onExport: () => void;
  exporting: boolean;
}

export default function DemoControls({
  step,
  logs,
  stats,
  onStart,
  onReset,
  onExport,
  exporting,
}: DemoControlsProps) {
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="w-full lg:w-[300px] bg-bg2 border-l border-border p-5 flex flex-col">
      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-5">
        {DEMO_STEPS.map((s) => (
          <div key={s.num} className="flex flex-col items-center gap-1.5">
            <div
              className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[11px] font-mono font-bold transition-colors ${
                step >= s.num
                  ? "border-green text-green"
                  : "border-border text-text3"
              } ${step === s.num ? "animate-pulse" : ""}`}
            >
              {s.num}
            </div>
            <span
              className={`text-[10px] font-mono uppercase tracking-wider ${
                step >= s.num ? "text-green" : "text-text3"
              }`}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Content area */}
      <div className="flex-1 min-h-0 flex flex-col">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-4"
            >
              <pre className="font-mono text-[11px] text-green bg-bg3 rounded p-3 overflow-auto max-h-[160px] leading-relaxed">
                {RW5_LINES.join("\n")}
              </pre>
              <p className="text-[12px] text-text3 font-mono">
                4 GPS punten &middot; Carlson SurvCE formaat
              </p>
              <button
                onClick={onStart}
                className="w-full py-3 px-4 bg-green text-bg font-mono text-sm font-bold rounded hover:brightness-110 transition-all cursor-pointer"
              >
                Start Demo
              </button>
            </motion.div>
          )}

          {step >= 1 && step <= 3 && (
            <motion.div
              key="running"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-4 flex-1 min-h-0"
            >
              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <span className="text-[11px] font-mono text-text3">
                  Punten
                </span>
                <span className="text-[11px] font-mono text-text text-right">
                  {stats.points}
                </span>
                <span className="text-[11px] font-mono text-text3">
                  Oppervlakte
                </span>
                <span className="text-[11px] font-mono text-text text-right">
                  {stats.area}
                </span>
                <span className="text-[11px] font-mono text-text3">Omtrek</span>
                <span className="text-[11px] font-mono text-text text-right">
                  {stats.perimeter}
                </span>
                <span className="text-[11px] font-mono text-text3">
                  Traverse
                </span>
                <span className="text-[11px] font-mono text-text text-right">
                  {stats.traverse}
                </span>
              </div>

              {/* Log panel */}
              <div
                ref={logRef}
                className="flex-1 min-h-[120px] max-h-[200px] bg-bg3 rounded p-3 overflow-y-auto"
              >
                {logs.map((line, i) => (
                  <div
                    key={i}
                    className="font-mono text-[10px] text-text2 leading-relaxed"
                  >
                    <span className="text-text3 mr-1">&gt;</span>
                    {line}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="export"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-4"
            >
              {/* Export options */}
              <div className="flex flex-col gap-2.5">
                <ExportCheckbox label="PDF A3" defaultChecked />
                <ExportCheckbox label="DXF" defaultChecked />
                <ExportCheckbox label="GeoJSON" defaultChecked={false} />
                <ExportCheckbox label="Kadaster rapport" defaultChecked={false} />
              </div>

              <button
                onClick={onExport}
                disabled={exporting}
                className="w-full py-3 px-4 bg-green text-bg font-mono text-sm font-bold rounded hover:brightness-110 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {exporting ? "Exporteren..." : "Exporteer bestanden"}
              </button>
              <button
                onClick={onReset}
                className="w-full py-2.5 px-4 border border-border text-text3 font-mono text-sm rounded hover:border-text3 hover:text-text2 transition-all cursor-pointer"
              >
                Reset demo
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ExportCheckbox({
  label,
  defaultChecked,
}: {
  label: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <input
        type="checkbox"
        defaultChecked={defaultChecked}
        className="w-3.5 h-3.5 rounded-sm border border-border bg-bg3 accent-green cursor-pointer"
      />
      <span className="font-mono text-[12px] text-text2 group-hover:text-text transition-colors">
        {label}
      </span>
    </label>
  );
}
