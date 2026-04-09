"use client";

import { motion } from "framer-motion";
import { CONTACT } from "@/lib/constants";

interface ContribCard {
  icon: string;
  title: string;
  description: string;
  linkText: string;
  subject: string;
}

const CARDS: ContribCard[] = [
  {
    icon: "💻",
    title: "Code bijdragen",
    description:
      "TypeScript, Next.js, en geospatial libraries. Bouw mee aan parsers, editors en exports.",
    linkText: "code bijdragen →",
    subject: "SurveyFlow - Code bijdragen",
  },
  {
    icon: "🧪",
    title: "Beta testen",
    description:
      "Test SurveyFlow met echte projecten en geef feedback over de workflow.",
    linkText: "beta testen →",
    subject: "SurveyFlow - Beta testen aanmelding",
  },
  {
    icon: "📋",
    title: "Testdata",
    description:
      "Deel RW5, CRD of BIN bestanden zodat we meer formaten kunnen ondersteunen.",
    linkText: "data delen →",
    subject: "SurveyFlow - Testdata delen",
  },
  {
    icon: "🌎",
    title: "Caribbean Netwerk",
    description:
      "Help met verspreiding in Suriname, Guyana, Trinidad en de rest van de regio.",
    linkText: "netwerk uitbreiden →",
    subject: "SurveyFlow - Caribbean Netwerk",
  },
  {
    icon: "🗺️",
    title: "Kadaster kennis",
    description:
      "Deel kennis over lokale normen, regelgeving en kadastrale processen.",
    linkText: "kennis delen →",
    subject: "SurveyFlow - Kadaster kennis bijdrage",
  },
  {
    icon: "📝",
    title: "Documentatie",
    description:
      "Schrijf tutorials, handleidingen of help met vertalingen naar het Sranan of Engels.",
    linkText: "docs schrijven →",
    subject: "SurveyFlow - Documentatie bijdrage",
  },
];

export default function Contribute() {
  return (
    <section
      id="contribute"
      className="py-24 px-5 md:px-10 bg-bg2 border-t border-b border-border"
    >
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
        >
          <p className="font-mono text-xs text-text3 tracking-widest uppercase mb-3">
            {"// bijdragen"}
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-text mb-12">
            Bouw mee aan SurveyFlow.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {CARDS.map((card, ci) => (
            <motion.a
              key={card.title}
              href={`mailto:${CONTACT.email}?subject=${encodeURIComponent(card.subject)}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: ci * 0.08 }}
              className="group bg-bg3 rounded-xl border border-border p-6 no-underline flex flex-col transition-transform duration-200 hover:-translate-y-[3px]"
            >
              <span className="text-2xl mb-4">{card.icon}</span>
              <h3 className="font-display text-base font-semibold text-text mb-2">
                {card.title}
              </h3>
              <p className="font-mono text-xs text-text3 leading-relaxed flex-1 mb-4">
                {card.description}
              </p>
              <span className="font-mono text-xs text-green group-hover:underline">
                {card.linkText}
              </span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
