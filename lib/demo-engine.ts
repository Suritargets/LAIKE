import { DEMO_POINTS, DEMO_RESULTS, type SurveyPoint } from "@/lib/demo-data";

// ── Particle system ────────────────────────────────────────────────
export class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  decay: number;
  radius: number;
  color: string;

  constructor(x: number, y: number, color: string) {
    this.x = x;
    this.y = y;
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.5 + Math.random() * 2.5;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.alpha = 1;
    this.decay = 0.015 + Math.random() * 0.015;
    this.radius = 1.5 + Math.random() * 2.5;
    this.color = color;
  }

  /** Returns false when the particle has faded out completely. */
  update(): boolean {
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.98;
    this.vy *= 0.98;
    this.alpha -= this.decay;
    return this.alpha > 0;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }
}

// ── Helpers ────────────────────────────────────────────────────────
function dist(ax: number, ay: number, bx: number, by: number): number {
  return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// ── DemoEngine ─────────────────────────────────────────────────────
export class DemoEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private animId = 0;
  private dpr = 1;
  private cssW = 0;
  private cssH = 0;

  private points: { x: number; y: number; id: string; revealed: boolean }[] =
    [];
  private polygonProgress = 0;
  private drawingPolygon = false;
  private hoveredPoint: number | null = null;
  private mouseX = -1000;
  private mouseY = -1000;

  private showDimensions = false;
  private showArea = false;
  private showExportReady = false;
  private idleGhosts = false;

  // for ghost pulsing
  private frameCount = 0;

  // polygon drawing callback
  private polygonOnComplete: (() => void) | null = null;
  private polygonStartTime = 0;
  private readonly POLYGON_DURATION = 2500; // ms

  // Pre-computed perimeter data
  private segLengths: number[] = [];
  private totalPerimeter = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context unavailable");
    this.ctx = ctx;

    this.resize();
    this.buildPoints();
  }

  // ── Resize / DPI ──────────────────────────────────────────────────
  resize(): void {
    this.dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.cssW = rect.width;
    this.cssH = rect.height;
    this.canvas.width = rect.width * this.dpr;
    this.canvas.height = rect.height * this.dpr;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.buildPoints();
  }

  // ── Map survey coords → canvas pixels ─────────────────────────────
  private mapToCanvas(n: number, e: number): { x: number; y: number } {
    // Extract bounding box from DEMO_POINTS
    const ns = DEMO_POINTS.map((p) => p.n);
    const es = DEMO_POINTS.map((p) => p.e);
    const minN = Math.min(...ns);
    const maxN = Math.max(...ns);
    const minE = Math.min(...es);
    const maxE = Math.max(...es);
    const rangeN = maxN - minN || 1;
    const rangeE = maxE - minE || 1;

    const padding = 0.22; // fraction of canvas reserved for margin
    const areaW = this.cssW * (1 - padding * 2);
    const areaH = this.cssH * (1 - padding * 2);

    // uniform scale so aspect ratio is preserved
    const scale = Math.min(areaW / rangeE, areaH / rangeN);

    const cx = this.cssW / 2;
    const cy = this.cssH / 2;

    // E → x (left→right), N → y (bottom→top so invert)
    const centroidE = (minE + maxE) / 2;
    const centroidN = (minN + maxN) / 2;

    const x = cx + (e - centroidE) * scale;
    const y = cy - (n - centroidN) * scale;
    return { x, y };
  }

  private buildPoints(): void {
    const prevRevealed = this.points.map((p) => p.revealed);
    this.points = DEMO_POINTS.map((sp, i) => {
      const { x, y } = this.mapToCanvas(sp.n, sp.e);
      return { x, y, id: sp.id, revealed: prevRevealed[i] ?? false };
    });

    // Compute segment lengths for pen-trail
    this.segLengths = [];
    this.totalPerimeter = 0;
    for (let i = 0; i < this.points.length; i++) {
      const a = this.points[i];
      const b = this.points[(i + 1) % this.points.length];
      const len = dist(a.x, a.y, b.x, b.y);
      this.segLengths.push(len);
      this.totalPerimeter += len;
    }
  }

  // ── Render loop ───────────────────────────────────────────────────
  private render = (): void => {
    this.animId = requestAnimationFrame(this.render);
    this.frameCount++;
    const ctx = this.ctx;
    const w = this.cssW;
    const h = this.cssH;

    // Update polygon animation
    if (this.drawingPolygon) {
      const elapsed = performance.now() - this.polygonStartTime;
      const raw = elapsed / this.POLYGON_DURATION;
      // Ease-in-out cubic
      const t = raw < 0.5
        ? 4 * raw * raw * raw
        : 1 - Math.pow(-2 * raw + 2, 3) / 2;
      this.polygonProgress = Math.min(t, 1);
      if (raw >= 1) {
        this.polygonProgress = 1;
        this.drawingPolygon = false;
        // spawn green particles at each vertex
        for (const pt of this.points) {
          for (let k = 0; k < 6; k++) {
            this.particles.push(new Particle(pt.x, pt.y, "#22c55e"));
          }
        }
        this.polygonOnComplete?.();
        this.polygonOnComplete = null;
      }
    }

    // 1. Clear & dark background
    ctx.fillStyle = "#111d2e";
    ctx.fillRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 1;
    const gridSpacing = 30;
    for (let gx = 0; gx < w; gx += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, h);
      ctx.stroke();
    }
    for (let gy = 0; gy < h; gy += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(w, gy);
      ctx.stroke();
    }

    // 2. Terrain patches (subtle colored rectangles)
    this.drawTerrainPatches(ctx, w, h);

    // 3. Idle ghost dots
    if (this.idleGhosts && this.polygonProgress === 0) {
      const pulse =
        0.1 + 0.06 * Math.sin(this.frameCount * 0.04);
      for (const pt of this.points) {
        ctx.save();
        ctx.globalAlpha = pulse;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#ef4444";
        ctx.fill();
        ctx.restore();
      }
    }

    // 4. Polygon with pen-trail
    if (this.polygonProgress > 0) {
      this.drawPolygon(ctx);
    }

    // 5. Revealed points
    for (const pt of this.points) {
      if (!pt.revealed) continue;
      ctx.save();
      // glow
      ctx.shadowColor = "rgba(239,68,68,0.6)";
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = "#ef4444";
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }

    // 6. Point labels
    for (const pt of this.points) {
      if (!pt.revealed) continue;
      const label = pt.id;
      ctx.font = "bold 11px ui-monospace, monospace";
      const tw = ctx.measureText(label).width;
      const lx = pt.x - tw / 2;
      const ly = pt.y - 14;
      ctx.fillStyle = "rgba(0,0,0,0.7)";
      ctx.beginPath();
      ctx.roundRect(lx - 4, ly - 11, tw + 8, 16, 3);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.fillText(label, lx, ly);
    }

    // 7. Dimension labels
    if (this.showDimensions) {
      this.drawDimensionLabels(ctx);
    }

    // 8. Area label at centroid
    if (this.showArea) {
      this.drawAreaLabel(ctx);
    }

    // 9. Export overlay (north arrow, scale bar, paper edge)
    if (this.showExportReady) {
      this.drawExportOverlay(ctx, w, h);
    }

    // 10. Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.draw(ctx);
      if (!p.update()) {
        this.particles.splice(i, 1);
      }
    }

    // 11. Tooltip on hover
    if (this.hoveredPoint !== null) {
      this.drawTooltip(ctx, this.hoveredPoint);
    }
  };

  // ── Sub-draw routines ─────────────────────────────────────────────
  private drawTerrainPatches(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
  ): void {
    const patches = [
      { x: 0.1, y: 0.15, w: 0.25, h: 0.3, color: "rgba(34,120,60,0.04)" },
      { x: 0.55, y: 0.5, w: 0.35, h: 0.25, color: "rgba(80,60,30,0.035)" },
      { x: 0.3, y: 0.6, w: 0.2, h: 0.35, color: "rgba(34,100,80,0.03)" },
    ];
    for (const p of patches) {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x * w, p.y * h, p.w * w, p.h * h);
    }
  }

  private drawPolygon(ctx: CanvasRenderingContext2D): void {
    const pts = this.points;
    const n = pts.length;
    if (n < 2) return;

    const drawnLength = this.polygonProgress * this.totalPerimeter;

    // Build the path that has been "drawn" so far
    const trailPts: { x: number; y: number }[] = [{ x: pts[0].x, y: pts[0].y }];
    let remaining = drawnLength;
    let penX = pts[0].x;
    let penY = pts[0].y;

    for (let i = 0; i < n; i++) {
      const segLen = this.segLengths[i];
      const bx = pts[(i + 1) % n].x;
      const by = pts[(i + 1) % n].y;
      if (remaining >= segLen) {
        trailPts.push({ x: bx, y: by });
        remaining -= segLen;
        penX = bx;
        penY = by;
      } else {
        const t = remaining / segLen;
        penX = lerp(pts[i].x, bx, t);
        penY = lerp(pts[i].y, by, t);
        trailPts.push({ x: penX, y: penY });
        remaining = 0;
        break;
      }
    }

    // Fill (only when polygon is fully closed)
    if (this.polygonProgress >= 1) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < n; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.closePath();
      ctx.fillStyle = "rgba(34,197,94,0.08)";
      ctx.fill();
      ctx.restore();
    }

    // Stroke the trail
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(trailPts[0].x, trailPts[0].y);
    for (let i = 1; i < trailPts.length; i++) {
      ctx.lineTo(trailPts[i].x, trailPts[i].y);
    }
    ctx.strokeStyle = "#22c55e";
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.restore();

    // Pen dot (glowing green circle at drawing tip)
    if (this.polygonProgress < 1) {
      ctx.save();
      ctx.shadowColor = "#22c55e";
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(penX, penY, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#4ade80";
      ctx.fill();
      ctx.restore();

      // Trail particles while drawing
      if (this.frameCount % 2 === 0) {
        this.particles.push(new Particle(penX, penY, "#22c55e"));
      }
    }
  }

  private drawDimensionLabels(ctx: CanvasRenderingContext2D): void {
    const pts = this.points;
    const dims = DEMO_RESULTS.dimensions;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      const label = dims[i] ?? "";

      // Offset label perpendicular to the side (push outward)
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;
      const off = 18;
      const lx = mx + nx * off;
      const ly = my + ny * off;

      ctx.save();
      ctx.font = "bold 11px ui-monospace, monospace";
      const tw = ctx.measureText(label).width;
      ctx.fillStyle = "rgba(0,0,0,0.75)";
      ctx.beginPath();
      ctx.roundRect(lx - tw / 2 - 5, ly - 8, tw + 10, 18, 4);
      ctx.fill();
      ctx.fillStyle = "#f59e0b";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, lx, ly + 1);
      ctx.restore();
    }
  }

  private drawAreaLabel(ctx: CanvasRenderingContext2D): void {
    // centroid
    const cx =
      this.points.reduce((s, p) => s + p.x, 0) / this.points.length;
    const cy =
      this.points.reduce((s, p) => s + p.y, 0) / this.points.length;

    const label = DEMO_RESULTS.area;
    ctx.save();
    ctx.font = "bold 14px ui-monospace, monospace";
    const tw = ctx.measureText(label).width;
    // bg pill
    ctx.fillStyle = "rgba(34,197,94,0.15)";
    ctx.beginPath();
    ctx.roundRect(cx - tw / 2 - 10, cy - 12, tw + 20, 26, 6);
    ctx.fill();
    ctx.strokeStyle = "#22c55e";
    ctx.lineWidth = 1;
    ctx.stroke();
    // text
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, cx, cy);
    ctx.restore();
  }

  private drawExportOverlay(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
  ): void {
    // Paper-edge overlay (light border around canvas)
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(16, 16, w - 32, h - 32);
    ctx.setLineDash([]);
    ctx.restore();

    // North arrow (top-right corner)
    const arrowX = w - 42;
    const arrowY = 42;
    ctx.save();
    ctx.strokeStyle = "#fff";
    ctx.fillStyle = "#fff";
    ctx.lineWidth = 1.5;
    // shaft
    ctx.beginPath();
    ctx.moveTo(arrowX, arrowY + 22);
    ctx.lineTo(arrowX, arrowY - 14);
    ctx.stroke();
    // arrowhead
    ctx.beginPath();
    ctx.moveTo(arrowX, arrowY - 18);
    ctx.lineTo(arrowX - 5, arrowY - 10);
    ctx.lineTo(arrowX + 5, arrowY - 10);
    ctx.closePath();
    ctx.fill();
    // N label
    ctx.font = "bold 11px ui-monospace, monospace";
    ctx.textAlign = "center";
    ctx.fillText("N", arrowX, arrowY - 23);
    ctx.restore();

    // Scale bar (bottom-left)
    const barX = 30;
    const barY = h - 36;
    const barW = 70;
    ctx.save();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1.5;
    // horizontal bar
    ctx.beginPath();
    ctx.moveTo(barX, barY);
    ctx.lineTo(barX + barW, barY);
    ctx.stroke();
    // end ticks
    ctx.beginPath();
    ctx.moveTo(barX, barY - 5);
    ctx.lineTo(barX, barY + 5);
    ctx.moveTo(barX + barW, barY - 5);
    ctx.lineTo(barX + barW, barY + 5);
    ctx.stroke();
    // label
    ctx.font = "10px ui-monospace, monospace";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText("10 m", barX + barW / 2, barY + 16);
    ctx.restore();

    // "EXPORT READY" badge
    const badgeText = "EXPORT READY";
    ctx.save();
    ctx.font = "bold 10px ui-monospace, monospace";
    const btw = ctx.measureText(badgeText).width;
    const bx = w - btw - 30;
    const by = h - 30;
    ctx.fillStyle = "rgba(34,197,94,0.2)";
    ctx.beginPath();
    ctx.roundRect(bx - 6, by - 10, btw + 12, 18, 4);
    ctx.fill();
    ctx.strokeStyle = "#22c55e";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = "#22c55e";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(badgeText, bx, by - 1);
    ctx.restore();
  }

  private drawTooltip(ctx: CanvasRenderingContext2D, idx: number): void {
    const pt = this.points[idx];
    const sp = DEMO_POINTS[idx];
    if (!pt || !sp) return;

    const lines = [
      `ID: ${sp.id}`,
      `N: ${sp.n.toFixed(3)}`,
      `E: ${sp.e.toFixed(3)}`,
      `EL: ${sp.el.toFixed(2)}`,
    ];

    ctx.save();
    ctx.font = "11px ui-monospace, monospace";
    const lineH = 16;
    const maxW = Math.max(...lines.map((l) => ctx.measureText(l).width));
    const padX = 10;
    const padY = 8;
    const tipW = maxW + padX * 2;
    const tipH = lines.length * lineH + padY * 2;

    // position tooltip to upper-right of point, clamp to canvas
    let tx = pt.x + 16;
    let ty = pt.y - tipH - 4;
    if (tx + tipW > this.cssW) tx = pt.x - tipW - 16;
    if (ty < 4) ty = pt.y + 20;

    // background
    ctx.fillStyle = "rgba(0,0,0,0.85)";
    ctx.beginPath();
    ctx.roundRect(tx, ty, tipW, tipH, 5);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // text
    ctx.fillStyle = "#fff";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], tx + padX, ty + padY + i * lineH);
    }
    ctx.restore();
  }

  // ── Public API ────────────────────────────────────────────────────
  start(): void {
    this.idleGhosts = true;
    this.animId = requestAnimationFrame(this.render);
  }

  stop(): void {
    cancelAnimationFrame(this.animId);
  }

  revealPoint(index: number): void {
    const pt = this.points[index];
    if (!pt) return;
    pt.revealed = true;
    // radial burst of 12 particles
    for (let i = 0; i < 12; i++) {
      this.particles.push(new Particle(pt.x, pt.y, "#ef4444"));
    }
    // disable idle ghosts once first point is revealed
    this.idleGhosts = false;
  }

  startPolygonDraw(onComplete: () => void): void {
    this.polygonProgress = 0;
    this.drawingPolygon = true;
    this.polygonStartTime = performance.now();
    this.polygonOnComplete = onComplete;
  }

  showDims(): void {
    this.showDimensions = true;
  }

  showAreaLabel(): void {
    this.showArea = true;
  }

  showExport(): void {
    this.showExportReady = true;
  }

  reset(): void {
    for (const pt of this.points) pt.revealed = false;
    this.polygonProgress = 0;
    this.drawingPolygon = false;
    this.showDimensions = false;
    this.showArea = false;
    this.showExportReady = false;
    this.hoveredPoint = null;
    this.particles = [];
    this.idleGhosts = true;
    this.polygonOnComplete = null;
  }

  // ── Mouse handling ────────────────────────────────────────────────
  handleMouseMove(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    this.mouseX = e.clientX - rect.left;
    this.mouseY = e.clientY - rect.top;

    let found: number | null = null;
    for (let i = 0; i < this.points.length; i++) {
      const pt = this.points[i];
      if (!pt.revealed) continue;
      if (dist(this.mouseX, this.mouseY, pt.x, pt.y) < 15) {
        found = i;
        break;
      }
    }
    this.hoveredPoint = found;
    this.canvas.style.cursor = found !== null ? "pointer" : "default";
  }

  handleMouseLeave(): void {
    this.hoveredPoint = null;
    this.mouseX = -1000;
    this.mouseY = -1000;
    this.canvas.style.cursor = "default";
  }

  destroy(): void {
    this.stop();
  }
}
