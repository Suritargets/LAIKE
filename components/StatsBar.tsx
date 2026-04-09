"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { STATS } from "@/lib/constants";

function parseValue(value: string): { num: number; suffix: string } {
  const match = value.match(/^(\d+)(.*)/);
  if (!match) return { num: 0, suffix: value };
  return { num: parseInt(match[1], 10), suffix: match[2] };
}

function AnimatedValue({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [displayed, setDisplayed] = useState(0);
  const { num, suffix } = parseValue(value);

  useEffect(() => {
    if (!isInView) return;
    if (num === 0) {
      setDisplayed(0);
      return;
    }

    const duration = 1500;
    const startTime = performance.now();

    let frameId: number;
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(eased * num));
      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [isInView, num]);

  return (
    <span ref={ref}>
      {displayed}
      {suffix}
    </span>
  );
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export default function StatsBar() {
  return (
    <motion.div
      className="w-full border-t border-b border-border"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 max-w-[1200px] mx-auto">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            variants={itemVariants}
            className={`flex flex-col items-center justify-center py-10 px-4 ${
              i < STATS.length - 1 ? "md:border-r md:border-border" : ""
            } ${i < 2 ? "border-b border-border md:border-b-0" : ""} ${
              i === 0 ? "border-r border-border md:border-r" : ""
            } ${i === 2 ? "border-r border-border md:border-r" : ""}`}
          >
            <span className="font-display text-[42px] font-[800] leading-none text-green">
              <AnimatedValue value={stat.value} />
            </span>
            <span className="font-mono text-[11px] uppercase tracking-widest text-text3 mt-2 text-center">
              {stat.label}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
