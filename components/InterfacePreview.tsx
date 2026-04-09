"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DEMO_POINTS, DEMO_RESULTS } from "@/lib/demo-data";

const TABS = ["Editor", "Upload", "Export"] as const;
type Tab = (typeof TABS)[number];

// ─── MINI CANVAS EDITOR ───
function EditorCanvas({ activeTool }: { activeTool: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);

  const mapToCanvas = useCallback(
    (n: number, e: number, w: number, h: number) => {
      const padding = 50;
      const allN = DEMO_POINTS.map((p) => p.n);
      const allE = DEMO_POINTS.map((p) => p.e);
      const minN = Math.min(...allN),
        maxN = Math.max(...allN);
      const minE = Math.min(...allE),
        maxE = Math.max(...allE);
      const rangeN = maxN - minN || 1,
        rangeE = maxE - minE || 1;
      const scaleX = (w - 2 * padding) / rangeE;
      const scaleY = (h - 2 * padding) / rangeN;
      const scale = Math.min(scaleX, scaleY);
      const offsetX = (w - rangeE * scale) / 2;
      const offsetY = (h - rangeN * scale) / 2;
      return {
        x: offsetX + (e - minE) * scale,
        y: h - offsetY - (n - minN) * scale,
      };
    },
    []
  );

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const w = rect.width,
      h = rect.height;

    // Background
    ctx.fillStyle = "#111d2e";
    ctx.fillRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 0.5;
    for (let x = 0; x < w; x += 25) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 25) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Terrain
    ctx.fillStyle = "rgba(30,61,20,0.2)";
    ctx.fillRect(w * 0.1, h * 0.12, w * 0.35, h * 0.3);
    ctx.fillStyle = "rgba(13,34,51,0.15)";
    ctx.fillRect(w * 0.45, h * 0.4, w * 0.25, h * 0.2);

    const pts = DEMO_POINTS.map((p) => mapToCanvas(p.n, p.e, w, h));

    // Old boundary (dashed red)
    ctx.beginPath();
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = "rgba(239,68,68,0.35)";
    ctx.lineWidth = 1.5;
    pts.forEach((p, i) => {
      const ox = p.x + (i % 2 === 0 ? 5 : -5);
      const oy = p.y + (i < 2 ? -5 : 5);
      i === 0 ? ctx.moveTo(ox, oy) : ctx.lineTo(ox, oy);
    });
    ctx.closePath();
    ctx.stroke();
    ctx.setLineDash([]);

    // New boundary (green fill + stroke)
    ctx.beginPath();
    pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.closePath();
    ctx.fillStyle = "rgba(34,197,94,0.08)";
    ctx.fill();
    ctx.strokeStyle = "#22c55e";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Dimension lines + labels
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 0.7;
    ctx.setLineDash([4, 3]);
    const dims = DEMO_RESULTS.dimensions;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      const mx = (a.x + b.x) / 2,
        my = (a.y + b.y) / 2;
      ctx.font = '9px "DM Mono", monospace';
      ctx.fillStyle = "#f59e0b";
      ctx.fillText(dims[i], mx + 4, my - 4);
    }
    ctx.setLineDash([]);

    // Area at centroid
    const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
    const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
    ctx.font = '12px "DM Mono", monospace';
    ctx.fillStyle = "rgba(34,197,94,0.5)";
    ctx.textAlign = "center";
    ctx.fillText(DEMO_RESULTS.area, cx, cy);
    ctx.font = '9px "DM Mono", monospace';
    ctx.fillStyle = "rgba(34,197,94,0.3)";
    ctx.fillText("Perceel P-234", cx, cy + 14);
    ctx.textAlign = "start";

    // North arrow
    ctx.save();
    ctx.translate(28, 40);
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fillStyle = "#151a21";
    ctx.fill();
    ctx.strokeStyle = "#2a3548";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -9);
    ctx.lineTo(3, 3);
    ctx.lineTo(0, 1);
    ctx.lineTo(-3, 3);
    ctx.closePath();
    ctx.fillStyle = "#22c55e";
    ctx.fill();
    ctx.font = '8px "DM Mono", monospace';
    ctx.fillStyle = "#22c55e";
    ctx.textAlign = "center";
    ctx.fillText("N", 0, -14);
    ctx.textAlign = "start";
    ctx.restore();

    // Scale bar
    ctx.save();
    ctx.translate(28, h - 30);
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(60, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -3);
    ctx.lineTo(0, 3);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(60, -3);
    ctx.lineTo(60, 3);
    ctx.stroke();
    ctx.font = '8px "DM Mono", monospace';
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("0", 0, 12);
    ctx.fillText("40m", 42, 12);
    ctx.restore();

    // Points
    pts.forEach((p, i) => {
      const isHovered = hoveredPoint === i;
      const isSelected = selectedPoint === i;
      const radius = isHovered || isSelected ? 7 : 5;

      // Glow
      if (isHovered || isSelected) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 16, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(239,68,68,0.2)";
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = "#ef4444";
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      const label = DEMO_POINTS[i].id;
      ctx.font = '10px "DM Mono", monospace';
      const tw = ctx.measureText(label).width;
      ctx.fillStyle = "rgba(0,0,0,0.75)";
      ctx.beginPath();
      ctx.roundRect(p.x + 10, p.y - 14, tw + 8, 16, 3);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.fillText(label, p.x + 14, p.y - 2);

      // Tooltip on hover
      if (isHovered) {
        const pt = DEMO_POINTS[i];
        const tip = `N ${pt.n.toFixed(3)}° · E ${pt.e.toFixed(3)}°`;
        ctx.font = '9px "DM Mono", monospace';
        const tipW = ctx.measureText(tip).width;
        ctx.fillStyle = "rgba(0,0,0,0.9)";
        ctx.beginPath();
        ctx.roundRect(p.x + 10, p.y + 8, tipW + 12, 20, 4);
        ctx.fill();
        ctx.strokeStyle = "rgba(34,197,94,0.4)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = "#94a3b8";
        ctx.fillText(tip, p.x + 16, p.y + 22);
      }
    });

    // Tool cursor indicator
    if (activeTool === "measure") {
      ctx.font = '9px "DM Mono", monospace';
      ctx.fillStyle = "rgba(245,158,11,0.6)";
      ctx.fillText("📐 Maat modus actief", w - 140, h - 12);
    } else if (activeTool === "polygon") {
      ctx.font = '9px "DM Mono", monospace';
      ctx.fillStyle = "rgba(34,197,94,0.6)";
      ctx.fillText("⬡ Polygon modus actief", w - 150, h - 12);
    }

    // AI badge
    ctx.fillStyle = "rgba(34,197,94,0.12)";
    ctx.beginPath();
    ctx.roundRect(10, h - 50, 145, 26, 5);
    ctx.fill();
    ctx.strokeStyle = "rgba(21,128,61,0.5)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(22, h - 37, 3, 0, Math.PI * 2);
    ctx.fillStyle = "#22c55e";
    ctx.fill();

    ctx.font = '9px "DM Mono", monospace';
    ctx.fillStyle = "#22c55e";
    ctx.fillText("Auto-tekening gereed", 30, h - 33);
  }, [hoveredPoint, selectedPoint, activeTool, mapToCanvas]);

  useEffect(() => {
    draw();
    const handleResize = () => draw();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [draw]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const w = rect.width,
      h = rect.height;

    let found = -1;
    DEMO_POINTS.forEach((p, i) => {
      const cp = mapToCanvas(p.n, p.e, w, h);
      const dist = Math.sqrt((mx - cp.x) ** 2 + (my - cp.y) ** 2);
      if (dist < 15) found = i;
    });
    setHoveredPoint(found >= 0 ? found : null);
  };

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block cursor-crosshair"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoveredPoint(null)}
      onClick={() => {
        if (hoveredPoint !== null) setSelectedPoint(hoveredPoint);
        else setSelectedPoint(null);
      }}
    />
  );
}

// ─── EDITOR TAB ───
function EditorMockup() {
  const [activeTool, setActiveTool] = useState("select");
  const tools = [
    { id: "select", icon: "↖", label: "Selecteer" },
    { id: "polygon", icon: "⬡", label: "Polygon" },
    { id: "point", icon: "⊕", label: "Punt" },
    { id: "measure", icon: "⟷", label: "Maat" },
    { id: "text", icon: "T", label: "Tekst" },
    { id: "map", icon: "🗺", label: "Kaart" },
    { id: "layers", icon: "☰", label: "Lagen" },
  ];

  const points = DEMO_POINTS;

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-bg2/50">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-green shadow-[0_0_6px_var(--green)]" />
          <span className="font-display text-xs font-bold text-text">SurveyFlow</span>
          <span className="text-text3 text-xs">/</span>
          <span className="font-mono text-[10px] text-text3">Projecten</span>
          <span className="text-text3 text-xs">/</span>
          <span className="font-mono text-[10px] text-text2">Perceel P-234 Paramaribo</span>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <span className="font-mono text-[10px] px-2.5 py-1 rounded border border-border text-text3">Ongedaan</span>
          <span className="font-mono text-[10px] px-2.5 py-1 rounded border border-border text-text3">Schaal: 1:500</span>
          <span className="font-mono text-[10px] px-2.5 py-1 rounded border border-green/30 text-green bg-green/10">⬇ Exporteren</span>
        </div>
      </div>

      {/* Main area */}
      <div className="flex flex-1 min-h-0">
        {/* Tool sidebar */}
        <div className="w-11 md:w-[52px] border-r border-border flex flex-col items-center py-3 gap-1 bg-bg2/30">
          {tools.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTool(t.id)}
              title={t.label}
              className={`w-8 h-8 md:w-9 md:h-9 rounded-lg flex items-center justify-center text-sm transition-all cursor-pointer ${
                activeTool === t.id
                  ? "bg-green/15 text-green border border-green/30"
                  : "text-text3 hover:text-text2 hover:bg-bg4 border border-transparent"
              }`}
            >
              {t.icon}
            </button>
          ))}
          <div className="flex-1" />
          <button className="w-8 h-8 md:w-9 md:h-9 rounded-lg flex items-center justify-center text-sm text-green/60 hover:text-green hover:bg-green/10 transition-all cursor-pointer border border-transparent">
            ✦
          </button>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <EditorCanvas activeTool={activeTool} />

          {/* Human gate overlay */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-bg/95 border border-amber rounded-xl px-4 py-3 flex items-center gap-4 shadow-[0_0_30px_rgba(245,158,11,0.15)]">
            <div className="w-8 h-8 rounded-full bg-amber/10 border border-amber/30 flex items-center justify-center text-base">⏸</div>
            <div className="font-mono text-[11px]">
              <div className="text-amber font-medium">Human Gate #2 — Review tekening</div>
              <div className="text-text3 text-[10px]">Maatvoering correct?</div>
            </div>
            <div className="flex gap-1.5 ml-2">
              <button className="font-mono text-[10px] px-3 py-1.5 rounded bg-bg4 text-text2 border border-border2 cursor-pointer hover:bg-bg3">Bewerken</button>
              <button className="font-mono text-[10px] px-3 py-1.5 rounded bg-green text-black cursor-pointer hover:brightness-110">✓ Goedkeuren</button>
            </div>
          </div>

          {/* Presence bar */}
          <div className="absolute top-3 right-3 flex items-center gap-1">
            <div className="w-6 h-6 rounded-full bg-[#1D3E2A] text-green text-[9px] font-mono flex items-center justify-center border-2 border-bg2">K</div>
            <div className="w-6 h-6 rounded-full bg-[#1a2840] text-blue text-[9px] font-mono flex items-center justify-center border-2 border-bg2 -ml-1.5">A</div>
            <span className="font-mono text-[9px] text-text3 ml-1">2 online</span>
          </div>
        </div>

        {/* Right panel */}
        <div className="hidden lg:flex w-[220px] border-l border-border flex-col bg-bg2/50 overflow-y-auto">
          <div className="px-3 py-2.5 border-b border-border font-mono text-[9px] text-text3 uppercase tracking-widest">
            Project info
          </div>

          {/* Parcel info */}
          <div className="px-3 py-2.5 border-b border-border">
            <div className="font-mono text-[8px] text-text3 uppercase tracking-widest mb-1.5">Perceel</div>
            <div className="space-y-0.5">
              {[
                ["Nummer", "P-234"],
                ["Oppervlakte", DEMO_RESULTS.area, "green"],
                ["Omtrek", DEMO_RESULTS.perimeter],
                ["Traverse", DEMO_RESULTS.traverse, "green"],
              ].map(([key, val, color]) => (
                <div key={key} className="flex justify-between font-mono text-[10px]">
                  <span className="text-text3">{key}</span>
                  <span className={color === "green" ? "text-green" : "text-text"}>{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Points */}
          <div className="px-3 py-2.5 border-b border-border">
            <div className="font-mono text-[8px] text-text3 uppercase tracking-widest mb-1.5">Hoekpunten (4)</div>
            <div className="space-y-1">
              {points.map((pt, i) => (
                <div
                  key={pt.id}
                  className={`flex items-center gap-2 px-1.5 py-1 rounded text-[9px] font-mono cursor-pointer transition-colors ${
                    i === 0 ? "bg-green/8 border border-green/20" : "hover:bg-bg3"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444] flex-shrink-0" />
                  <span className="text-text2 w-7">{pt.id}</span>
                  <span className="text-text3 flex-1 text-[8px]">{pt.n.toFixed(3)}°N</span>
                  <span className="text-[8px] px-1 py-0.5 rounded bg-green/10 text-green">GRENS</span>
                </div>
              ))}
            </div>
          </div>

          {/* Export status */}
          <div className="px-3 py-2.5">
            <div className="font-mono text-[8px] text-text3 uppercase tracking-widest mb-1.5">Export</div>
            <div className="space-y-0.5">
              {[
                ["Formaat", "A3 liggend"],
                ["Schaal", "1:500"],
                ["Status", "Review", "amber"],
              ].map(([key, val, color]) => (
                <div key={key} className="flex justify-between font-mono text-[10px]">
                  <span className="text-text3">{key}</span>
                  <span className={color === "amber" ? "text-amber" : "text-text"}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-6 px-4 py-1.5 border-t border-border bg-bg2/50 font-mono text-[9px] text-text3">
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green" />
          Online
        </div>
        <span>📁 P234_opmeting.rw5</span>
        <span>Schaal: 1:500</span>
        <span className="ml-auto text-green">AI ✓ Gereed</span>
      </div>
    </div>
  );
}

// ─── UPLOAD TAB ───
function UploadMockup() {
  const [uploaded, setUploaded] = useState(false);
  const [dragging, setDragging] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 gap-8">
      {!uploaded ? (
        <div
          className={`w-full max-w-md border-2 border-dashed rounded-2xl p-10 flex flex-col items-center gap-5 transition-all cursor-pointer ${
            dragging
              ? "border-green bg-green/5 scale-[1.02]"
              : "border-border2 hover:border-green/40"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            setUploaded(true);
          }}
          onClick={() => setUploaded(true)}
        >
          <div className="w-16 h-16 rounded-2xl bg-bg4 flex items-center justify-center">
            <span className="text-3xl">{dragging ? "📡" : "↑"}</span>
          </div>
          <div className="text-center">
            <p className="font-display text-sm font-semibold text-text mb-1">Sleep je bestand hier</p>
            <p className="font-mono text-[10px] text-text3">.rw5 · .crd · .bin · .csv · .dxf · .pdf · .jpg</p>
          </div>
          <button className="font-mono text-xs px-5 py-2.5 bg-green text-black rounded cursor-pointer hover:brightness-110">
            Of klik om te selecteren
          </button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-bg3 border border-green/30 rounded-2xl p-8 flex flex-col items-center gap-4"
        >
          <div className="w-14 h-14 rounded-full bg-green/15 flex items-center justify-center text-2xl">✓</div>
          <div className="text-center">
            <p className="font-display text-sm font-semibold text-text mb-1">perceel_P234.rw5</p>
            <p className="font-mono text-[10px] text-text3">4 GPS punten · 2.3 KB · Carlson SurvCE</p>
          </div>
          <div className="w-full bg-bg4 rounded-full h-1.5 overflow-hidden">
            <motion.div
              className="h-full bg-green rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>
          <div className="flex gap-3 mt-2">
            <button
              className="font-mono text-[10px] px-4 py-2 rounded border border-border text-text3 cursor-pointer hover:bg-bg4"
              onClick={() => setUploaded(false)}
            >
              Ander bestand
            </button>
            <button className="font-mono text-[10px] px-4 py-2 rounded bg-green text-black cursor-pointer hover:brightness-110">
              → Verwerken
            </button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-4 gap-3 w-full max-w-md">
        {[
          { icon: "📄", ext: ".rw5", label: "SurvCE raw", color: "green" },
          { icon: "📐", ext: ".crd", label: "Coördinaten", color: "green" },
          { icon: "🔵", ext: ".bin", label: "GNSS binary", color: "amber" },
          { icon: "🗂️", ext: "+8 meer", label: "Alle formaten", color: "blue" },
        ].map((f) => (
          <div
            key={f.ext}
            className={`bg-bg3 border rounded-lg p-3 text-center ${
              f.color === "amber" ? "border-amber/20 bg-amber/5" : "border-border"
            }`}
          >
            <div className="text-xl mb-1">{f.icon}</div>
            <div className={`font-mono text-[10px] ${
              f.color === "green" ? "text-green" : f.color === "amber" ? "text-amber" : "text-blue"
            }`}>{f.ext}</div>
            <div className="text-[10px] text-text3 mt-0.5">{f.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── EXPORT TAB ───
function ExportMockup() {
  const [paperSize, setPaperSize] = useState("A3");
  const [scale, setScale] = useState("1:500");
  const [files, setFiles] = useState({ pdf: true, dxf: true, dwg: false, geojson: false, rapport: true });
  const [generating, setGenerating] = useState(false);
  const [done, setDone] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    setDone(false);
    setTimeout(() => {
      setGenerating(false);
      setDone(true);
    }, 2000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 h-full">
      {/* Left: settings */}
      <div className="p-5 border-r border-border overflow-y-auto flex flex-col gap-5">
        <div>
          <p className="font-mono text-[10px] text-text3 uppercase tracking-widest mb-2">Papierformaat</p>
          <div className="flex gap-2">
            {["A1", "A3", "A4"].map((s) => (
              <button
                key={s}
                onClick={() => setPaperSize(s)}
                className={`font-mono text-xs px-4 py-2 rounded border transition-colors cursor-pointer ${
                  paperSize === s ? "border-green text-green bg-green/10" : "border-border text-text3 hover:border-border2"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="font-mono text-[10px] text-text3 uppercase tracking-widest mb-2">Schaal</p>
          <div className="flex gap-2 flex-wrap">
            {["1:200", "1:500", "1:1000", "Auto"].map((s) => (
              <button
                key={s}
                onClick={() => setScale(s)}
                className={`font-mono text-xs px-3 py-2 rounded border transition-colors cursor-pointer ${
                  scale === s ? "border-green text-green bg-green/10" : "border-border text-text3 hover:border-border2"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="font-mono text-[10px] text-text3 uppercase tracking-widest mb-2">Bestanden</p>
          <div className="flex flex-col gap-2.5">
            {(
              [
                ["pdf", "PDF " + paperSize + " (drukklaar)"],
                ["dxf", "DXF (AutoCAD)"],
                ["dwg", "DWG (AutoCAD)"],
                ["geojson", "GeoJSON"],
                ["rapport", "Kadaster rapport (NL)"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2.5 cursor-pointer group">
                <span
                  onClick={() => setFiles((f) => ({ ...f, [key]: !f[key as keyof typeof files] }))}
                  className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] transition-colors ${
                    files[key as keyof typeof files]
                      ? "border-green bg-green/15 text-green"
                      : "border-border2 text-transparent group-hover:border-text3"
                  }`}
                >
                  ✓
                </span>
                <span className="font-mono text-xs text-text2">{label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Right: stamp + generate */}
      <div className="p-5 flex flex-col gap-4">
        <p className="font-mono text-[10px] text-text3 uppercase tracking-widest">Stempel & validatie</p>
        <div className="bg-bg3 border border-border rounded-lg p-4">
          <p className="text-xs font-medium text-text mb-3">Demo Landmeetbureau N.V.</p>
          <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 font-mono text-[10px]">
            <span className="text-text3">Landmeter</span><span className="text-text2">A. Jansen, PLS</span>
            <span className="text-text3">Datum</span><span className="text-text2">09-04-2026</span>
            <span className="text-text3">Perceel nr.</span><span className="text-text2">P-234</span>
            <span className="text-text3">Schaal</span><span className="text-green">{scale}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <span className="font-mono text-[10px] px-3 py-2 rounded border border-border text-text3 cursor-pointer hover:bg-bg4">Concept</span>
          <span className="font-mono text-[10px] px-3 py-2 rounded border border-green text-green bg-green/10 cursor-pointer">Definitief</span>
        </div>

        <div className="mt-auto">
          {done ? (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-2 py-3"
            >
              <span className="text-green text-lg">✓</span>
              <span className="font-mono text-xs text-green">Export pakket gereed!</span>
              <button
                onClick={() => setDone(false)}
                className="font-mono text-[10px] text-text3 hover:text-text2 cursor-pointer"
              >
                Opnieuw genereren
              </button>
            </motion.div>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full font-mono text-xs py-3 bg-green text-black rounded cursor-pointer hover:brightness-110 disabled:opacity-60 disabled:cursor-wait transition-all"
            >
              {generating ? "⏳ Genereren..." : "⬇ Genereer export pakket"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN SECTION ───
export default function InterfacePreview() {
  const [activeTab, setActiveTab] = useState<Tab>("Editor");

  return (
    <section id="interface" className="py-24 px-5 md:px-10 bg-bg2 border-t border-b border-border">
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
        >
          <p className="font-mono text-xs text-green tracking-widest uppercase mb-3">{"// interface preview"}</p>
          <h2 className="font-display text-3xl md:text-4xl font-black text-text mb-3">Zo ziet het eruit.</h2>
          <p className="text-base text-text2 leading-relaxed mb-10 max-w-lg">
            Een indicatie van de interface — professioneel CAD gevoel, gebouwd voor de landmeter. Klik, hover en test.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Tabs */}
          <div className="flex gap-1 mb-0 border-b border-border">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`font-mono text-xs px-5 py-3 rounded-t-lg border border-b-0 transition-colors cursor-pointer ${
                  activeTab === tab
                    ? "bg-bg3 border-border text-green"
                    : "bg-transparent border-transparent text-text3 hover:text-text2"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="bg-bg3 border border-t-0 border-border rounded-b-xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.3)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className={activeTab === "Editor" ? "h-[500px]" : "h-[460px]"}
              >
                {activeTab === "Editor" && <EditorMockup />}
                {activeTab === "Upload" && <UploadMockup />}
                {activeTab === "Export" && <ExportMockup />}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
