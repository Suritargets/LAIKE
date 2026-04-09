"use client";

import { motion } from "framer-motion";

type TagColor = "green" | "amber" | "blue" | "default";

interface Tag {
  label: string;
  color: TagColor;
}

interface Feature {
  icon: string;
  title: string;
  desc: string;
  tags: Tag[];
}

const features: Feature[] = [
  {
    icon: "\u{1F4E1}",
    title: "RW5 \u00B7 CRD \u00B7 BIN Import",
    desc: "Upload bestanden direct van je Archer 2 of BRx7. Automatische formaat detectie.",
    tags: [
      { label: ".rw5", color: "green" },
      { label: ".crd", color: "green" },
      { label: ".bin GNSS", color: "amber" },
      { label: "LandXML", color: "blue" },
    ],
  },
  {
    icon: "\u{1F916}",
    title: "AI Auto-tekening",
    desc: "Punten importeren \u2192 polygon automatisch verbonden \u2192 volledige perceelkaart gegenereerd met maatvoering.",
    tags: [
      { label: "Auto polygon", color: "green" },
      { label: "Maatvoering", color: "green" },
      { label: "Human gates", color: "amber" },
    ],
  },
  {
    icon: "\u{1F5FA}\uFE0F",
    title: "Google Maps Live",
    desc: "Satellite imagery als realtime achtergrond. Teken perceelgrenzen direct over echte kaart.",
    tags: [
      { label: "Satellite hybrid", color: "blue" },
      { label: "GeoJSON", color: "blue" },
    ],
  },
  {
    icon: "\u{1F50D}",
    title: "Scan naar Vector",
    desc: "Scan een oude kadasterkaart. Claude Vision detecteert grenzen automatisch.",
    tags: [
      { label: "Claude Vision", color: "amber" },
      { label: "OpenCV", color: "amber" },
      { label: "Georeferentie", color: "amber" },
    ],
  },
  {
    icon: "\u2696\uFE0F",
    title: "Grens Reconstructie",
    desc: "Vergelijk oude kadasterkaart met nieuwe GPS meting. AI berekent afwijkingen.",
    tags: [
      { label: "Oud vs nieuw", color: "amber" },
      { label: "Afwijkingskaart", color: "amber" },
      { label: "Juridisch rapport", color: "amber" },
    ],
  },
  {
    icon: "\u{1F465}",
    title: "Team Samenwerking",
    desc: "Meerdere landmeters werken simultaan. Live cursors, realtime updates.",
    tags: [
      { label: "Realtime CRDT", color: "blue" },
      { label: "Supabase", color: "blue" },
      { label: "Offline-first", color: "green" },
    ],
  },
  {
    icon: "\u{1F4C4}",
    title: "Export & Templates",
    desc: "DWG, DXF, PDF A1/A3/A4, GeoJSON, KML, Shapefile. Custom templates mogelijk.",
    tags: [
      { label: "DWG/DXF", color: "green" },
      { label: "PDF A1/A3/A4", color: "green" },
      { label: "Shapefile/KML", color: "default" },
    ],
  },
  {
    icon: "\u{1F512}",
    title: "Traverse Verificatie",
    desc: "Automatische traverse sluiting. Acceptatienorm Surinaams kadaster (1:5000).",
    tags: [
      { label: "Sluiting check", color: "green" },
      { label: "Outlier detectie", color: "green" },
      { label: "Kadaster normen", color: "amber" },
    ],
  },
  {
    icon: "\u2601\uFE0F",
    title: "Cloud + Offline",
    desc: "Browser app \u2014 geen installatie. Offline modus met lokale opslag. PWA installeerbaar.",
    tags: [
      { label: "PWA", color: "blue" },
      { label: "IndexedDB", color: "green" },
      { label: "Auto-sync", color: "default" },
    ],
  },
];

const tagStyles: Record<TagColor, string> = {
  green:
    "bg-green-glow border-green/30 text-green",
  amber:
    "bg-(--amber-dim)/15 border-amber/30 text-amber",
  blue:
    "bg-[color:var(--blue)]/10 border-blue/30 text-blue",
  default:
    "bg-bg4/50 border-border2 text-text3",
};

const gridVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

export default function Features() {
  return (
    <section id="features" className="py-30">
      <div className="max-w-300 mx-auto px-10">
        {/* Section header */}
        <p className="font-mono text-sm text-green mb-4">// features</p>
        <h2 className="font-display text-4xl md:text-5xl font-bold text-text mb-4">
          Alles in &eacute;&eacute;n platform.
        </h2>
        <p className="text-text2 text-lg max-w-150 mb-12">
          Van veldmeting tot kadasterrapport. Geen AutoCAD, geen Excel, geen
          handmatig tekenen.
        </p>

        {/* Feature grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-xl overflow-hidden"
          variants={gridVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              className="group bg-bg2 p-8 hover:bg-bg3 transition-colors border-t-2 border-t-transparent hover:border-t-green"
            >
              {/* Icon */}
              <div className="w-11 h-11 rounded-lg border border-border2 flex items-center justify-center text-xl mb-5">
                {feature.icon}
              </div>

              {/* Title */}
              <h3 className="font-display text-[18px] font-bold text-text mb-2">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-text2 leading-relaxed mb-4">
                {feature.desc}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {feature.tags.map((tag) => (
                  <span
                    key={tag.label}
                    className={`font-mono text-[10px] px-2 py-0.75 rounded border ${tagStyles[tag.color]}`}
                  >
                    {tag.label}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
