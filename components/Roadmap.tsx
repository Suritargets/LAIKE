"use client";

import { motion } from "framer-motion";

interface Task {
  label: string;
  done?: boolean;
}

interface Sprint {
  id: number;
  weeks: string;
  active?: boolean;
  title: string;
  description: string;
  tasks: Task[];
}

const SPRINTS: Sprint[] = [
  {
    id: 1,
    weeks: "Week 1-2",
    active: true,
    title: "Kern MVP",
    description:
      "De basis: parsers, kaartweergave, en eerste exports. Alles wat je nodig hebt om een meting te verwerken.",
    tasks: [
      { label: "RW5 parser", done: true },
      { label: "CRD parser", done: true },
      { label: "Auto polygon", done: true },
      { label: "Google Maps", done: true },
      { label: "PDF A3", done: true },
      { label: "DXF export", done: true },
      { label: "Auth", done: true },
    ],
  },
  {
    id: 2,
    weeks: "Week 3-4",
    title: "Samenwerking + BIN + DWG",
    description:
      "Realtime samenwerking, meer importformaten en geavanceerde rapporten.",
    tasks: [
      { label: "Realtime cursors" },
      { label: "BIN via RTKLIB" },
      { label: "DXF/DWG import" },
      { label: "AI agent" },
      { label: "Offline sync" },
      { label: "Traverse rapport" },
    ],
  },
  {
    id: 3,
    weeks: "Week 5-6",
    title: "AI Vision",
    description:
      "AI-gestuurde document analyse, georeferentie en grensreconstructie.",
    tasks: [
      { label: "Claude Vision" },
      { label: "OpenCV WASM" },
      { label: "Georeferentie" },
      { label: "Grens reconstructie" },
      { label: "Rapport" },
    ],
  },
  {
    id: 4,
    weeks: "Week 7-8",
    title: "Launch",
    description:
      "Betalingen, PWA, onboarding flow en productie deployment.",
    tasks: [
      { label: "Stripe" },
      { label: "PWA" },
      { label: "Onboarding" },
      { label: "Email" },
      { label: "Deploy" },
    ],
  },
];

export default function Roadmap() {
  return (
    <section id="roadmap" className="py-24 px-5 md:px-10">
      <div className="max-w-[900px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
        >
          <p className="font-mono text-xs text-text3 tracking-widest uppercase mb-3">
            {"// roadmap"}
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-text mb-14">
            Wat er wanneer komt.
          </h2>
        </motion.div>

        <div className="flex flex-col">
          {SPRINTS.map((sprint, si) => (
            <motion.div
              key={sprint.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: si * 0.1 }}
              className="grid grid-cols-[80px_40px_1fr] md:grid-cols-[120px_40px_1fr] gap-0"
            >
              {/* Sprint label */}
              <div className="flex flex-col items-end justify-start pt-1 pr-4">
                <span
                  className={`font-mono text-xs font-semibold ${
                    sprint.active ? "text-green" : "text-text3"
                  }`}
                >
                  Sprint {sprint.id}
                </span>
                <span className="font-mono text-[10px] text-text3 mt-0.5">
                  {sprint.weeks}
                </span>
                {sprint.active && (
                  <span className="font-mono text-[9px] px-1.5 py-0.5 mt-1.5 rounded bg-green/15 text-green border border-green/30 uppercase tracking-wider">
                    Active
                  </span>
                )}
              </div>

              {/* Timeline line + dot */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-3.5 h-3.5 rounded-full border-2 mt-1 ${
                    sprint.active
                      ? "border-green bg-green/30 shadow-[0_0_12px_var(--green)]"
                      : "border-border2 bg-bg3"
                  }`}
                />
                {si < SPRINTS.length - 1 && (
                  <div
                    className={`w-px flex-1 ${
                      sprint.active ? "bg-green/40" : "bg-border"
                    }`}
                  />
                )}
              </div>

              {/* Content */}
              <div className="pb-10 pl-4">
                <h3 className="font-display text-lg font-bold text-text mb-1">
                  {sprint.title}
                </h3>
                <p className="font-mono text-xs text-text3 leading-relaxed mb-4 max-w-md">
                  {sprint.description}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {sprint.tasks.map((task) => (
                    <span
                      key={task.label}
                      className={`font-mono text-[10px] px-2 py-1 rounded-md border ${
                        task.done
                          ? "bg-green/10 text-green border-green/25"
                          : "bg-bg3 text-text3 border-border"
                      }`}
                    >
                      {task.done && "✓ "}
                      {task.label}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
