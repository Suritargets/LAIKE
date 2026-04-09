"use client";

import { motion } from "framer-motion";

interface Step {
  num: string;
  label: string;
  desc: string;
  type: "active" | "gate";
}

const steps: Step[] = [
  { num: "1", label: "Upload", desc: "Drop je RW5, CRD of BIN bestand.", type: "active" },
  { num: "2", label: "Parse & Plot", desc: "GPS punten geplot op satellite.", type: "active" },
  { num: "\u23F8", label: "Gate #1", desc: "Jij verifieert punten.", type: "gate" },
  { num: "3", label: "Auto-tekening", desc: "AI genereert perceelkaart.", type: "active" },
  { num: "\u23F8", label: "Gate #2", desc: "Review tekening.", type: "gate" },
  { num: "4", label: "Rapport", desc: "Technisch rapport Nederlands.", type: "active" },
  { num: "\u23F8", label: "Gate #3", desc: "Finale goedkeuring + stempel.", type: "gate" },
  { num: "5", label: "Export", desc: "DWG + PDF + GeoJSON.", type: "active" },
];

const CIRCLE_R = 28;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_R;

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.3,
    },
  },
};

const stepVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

const lineVariants = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: 1.8, ease: "easeInOut" as const },
  },
};

function PipelineCircle({ step, index }: { step: Step; index: number }) {
  const isActive = step.type === "active";
  const color = isActive ? "#22c55e" : "#f59e0b";
  const bgColor = isActive ? "#0d1a12" : "#1a1408";
  const delay = index * 0.18 + 0.3;

  return (
    <div className="relative w-16 h-16">
      <svg width="64" height="64" viewBox="0 0 64 64" className="absolute inset-0">
        {/* Background circle (faint) */}
        <circle
          cx="32" cy="32" r={CIRCLE_R}
          fill={bgColor}
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="2"
        />
        {/* Animated ring draw */}
        <motion.circle
          cx="32" cy="32" r={CIRCLE_R}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={CIRCLE_CIRCUMFERENCE}
          initial={{ strokeDashoffset: CIRCLE_CIRCUMFERENCE }}
          whileInView={{ strokeDashoffset: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.8,
            delay,
            ease: "easeOut" as const,
          }}
          style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
        />
        {/* Glow ring for active steps */}
        {isActive && (
          <motion.circle
            cx="32" cy="32" r={CIRCLE_R + 4}
            fill="none"
            stroke={color}
            strokeWidth="1"
            opacity="0"
            initial={{ opacity: 0 }}
            whileInView={{
              opacity: [0, 0.3, 0],
              scale: [1, 1.1, 1],
            }}
            viewport={{ once: true }}
            transition={{
              duration: 2,
              delay: delay + 0.8,
              repeat: Infinity,
              ease: "easeInOut" as const,
            }}
          />
        )}
      </svg>

      {/* Number */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center font-display text-xl font-bold"
        style={{ color }}
        initial={{ opacity: 0, scale: 0.3 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{
          duration: 0.35,
          delay: delay + 0.5,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {step.num}
      </motion.div>
    </div>
  );
}

export default function Pipeline() {
  return (
    <section id="pipeline" className="bg-bg2 border-t border-b border-border py-30">
      <div className="max-w-300 mx-auto px-10">
        <p className="font-mono text-sm text-green mb-4">// workflow</p>
        <h2 className="font-display text-4xl md:text-5xl font-bold text-text mb-4">
          Van RW5 naar PDF in 5 stappen.
        </h2>
        <p className="text-text2 text-lg max-w-150 mb-16">
          Geautomatiseerd met menselijke checkpoints. Jij behoudt controle bij
          elke cruciale stap.
        </p>

        <motion.div
          className="relative flex flex-wrap justify-center gap-8 min-[900px]:flex-nowrap min-[900px]:gap-0"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {/* Connecting line — behind circles */}
          <motion.div
            className="hidden min-[900px]:block absolute top-8 left-8 right-8 h-px z-0"
            style={{
              originX: 0,
              background: "linear-gradient(90deg, #22c55e, #f59e0b 30%, #22c55e 50%, #f59e0b 70%, #22c55e)",
            }}
            variants={lineVariants}
          />

          {steps.map((step, i) => {
            const isActive = step.type === "active";
            return (
              <motion.div
                key={step.label}
                className="flex flex-col items-center flex-1 min-w-25 relative z-10 group"
                variants={stepVariants}
              >
                <PipelineCircle step={step} index={i} />

                <motion.span
                  className={`font-display text-sm font-bold mt-3 ${isActive ? "text-text" : "text-amber"}`}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.18 + 0.9 }}
                >
                  {step.label}
                </motion.span>

                <motion.span
                  className="font-mono text-[11px] text-text3 mt-1 text-center max-w-32.5"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.18 + 1.1 }}
                >
                  {step.desc}
                </motion.span>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
