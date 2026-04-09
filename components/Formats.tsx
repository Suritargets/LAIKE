"use client";

import { motion } from "framer-motion";

interface FormatEntry {
  ext: string;
  sprint: 1 | 2 | 3;
}

interface FormatGroup {
  icon: string;
  title: string;
  formats: FormatEntry[];
}

const FORMAT_GROUPS: FormatGroup[] = [
  {
    icon: "📡",
    title: "Velddata",
    formats: [
      { ext: ".rw5", sprint: 1 },
      { ext: ".crd", sprint: 1 },
      { ext: ".csv", sprint: 1 },
      { ext: ".xml", sprint: 1 },
      { ext: ".bin", sprint: 2 },
    ],
  },
  {
    icon: "🗂️",
    title: "CAD bestanden",
    formats: [
      { ext: ".dxf", sprint: 2 },
      { ext: ".dwg", sprint: 2 },
      { ext: ".shp", sprint: 2 },
      { ext: ".kml", sprint: 2 },
      { ext: ".geojson", sprint: 1 },
    ],
  },
  {
    icon: "📷",
    title: "Scan input",
    formats: [
      { ext: ".jpg/.png", sprint: 3 },
      { ext: ".pdf", sprint: 3 },
      { ext: ".tif", sprint: 3 },
      { ext: "Foto", sprint: 3 },
    ],
  },
  {
    icon: "📤",
    title: "Export",
    formats: [
      { ext: ".dxf/.dwg", sprint: 2 },
      { ext: "PDF A1/A3/A4", sprint: 1 },
      { ext: ".geojson", sprint: 1 },
      { ext: ".shp", sprint: 2 },
      { ext: "Rapport", sprint: 2 },
    ],
  },
];

const SPRINT_COLORS: Record<1 | 2 | 3, string> = {
  1: "bg-green/15 text-green border-green/30",
  2: "bg-blue/15 text-blue border-blue/30",
  3: "bg-amber/15 text-amber border-amber/30",
};

export default function Formats() {
  return (
    <section id="formats" className="py-24 px-5 md:px-10">
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
        >
          <p className="font-mono text-xs text-text3 tracking-widest uppercase mb-3">
            {"// bestandsformaten"}
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-text mb-12">
            Werkt met alles wat je al hebt.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {FORMAT_GROUPS.map((group, gi) => (
            <motion.div
              key={group.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: gi * 0.1 }}
              className="bg-bg2 rounded-xl border border-border p-5"
            >
              <div className="flex items-center gap-2.5 mb-4">
                <span className="text-xl">{group.icon}</span>
                <h3 className="font-display text-base font-semibold text-text">
                  {group.title}
                </h3>
              </div>

              <div className="flex flex-col gap-2">
                {group.formats.map((fmt) => (
                  <div
                    key={fmt.ext}
                    className="flex items-center justify-between py-1.5"
                  >
                    <span className="font-mono text-xs bg-green/10 text-green px-2.5 py-1 rounded-md border border-green/20">
                      {fmt.ext}
                    </span>
                    <span
                      className={`font-mono text-[10px] px-2 py-0.5 rounded-full border ${SPRINT_COLORS[fmt.sprint]}`}
                    >
                      Sprint {fmt.sprint}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
