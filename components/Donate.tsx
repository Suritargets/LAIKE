"use client";

import { motion } from "framer-motion";
import { CONTACT } from "@/lib/constants";
import { useModals } from "./ModalProvider";

interface Tier {
  amount: string;
  value?: number;
  title: string;
  detail: string;
  featured?: boolean;
}

const TIERS: Tier[] = [
  {
    amount: "$10",
    value: 10,
    title: "Koffie bijdrage",
    detail: "Steun de ontwikkeling met een kleine bijdrage.",
  },
  {
    amount: "$50",
    value: 50,
    title: "Early Supporter",
    detail: "Vroege toegang + vermelding als supporter.",
    featured: true,
  },
  {
    amount: "$100",
    value: 100,
    title: "Founding Supporter",
    detail: "Founding member badge + prioriteit feature requests.",
  },
  {
    amount: "Custom",
    title: "Bureau / Organisatie",
    detail: "Maatwerk bijdrage voor bedrijven en organisaties.",
  },
];

const REASONS = [
  {
    icon: "🔓",
    text: "Open platform — geen vendor lock-in, geen verborgen kosten.",
  },
  {
    icon: "🌍",
    text: "Gebouwd voor de Caribbean — door landmeters, voor landmeters.",
  },
  {
    icon: "⚡",
    text: "Elke bijdrage versnelt de ontwikkeling van nieuwe features.",
  },
];

export default function Donate() {
  const { openDonate } = useModals();
  return (
    <section id="donate" className="py-24 px-5 md:px-10">
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
        >
          <p className="font-mono text-xs text-text3 tracking-widest uppercase mb-3">
            {"// steun het project"}
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-text mb-12">
            Draag bij aan SurveyFlow.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left column — intro */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <p className="text-text2 leading-relaxed mb-8">
              SurveyFlow is bootstrapped — geen venture capital, geen
              investeerders. We bouwen een open platform dat landmeters in
              Suriname en de Caribbean betaalbare, moderne tools geeft. Jouw
              bijdrage maakt direct impact.
            </p>

            <div className="flex flex-col gap-4">
              {REASONS.map((r) => (
                <div key={r.text} className="flex items-start gap-3">
                  <span className="text-lg mt-0.5">{r.icon}</span>
                  <span className="font-mono text-xs text-text2 leading-relaxed">
                    {r.text}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right column — tiers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col gap-3"
          >
            {TIERS.map((tier) => (
              <button
                key={tier.title}
                type="button"
                onClick={() => openDonate(tier.value)}
                className={`group flex items-center gap-5 p-4 rounded-xl border text-left transition-all duration-200 hover:translate-x-1 hover:bg-bg3 cursor-pointer ${
                  tier.featured
                    ? "border-green bg-green-glow"
                    : "border-border bg-bg2"
                }`}
              >
                <span className="font-display text-2xl font-bold min-w-[72px] text-green">
                  {tier.amount}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="block font-display text-sm font-semibold text-text">
                    {tier.title}
                  </span>
                  <span className="block font-mono text-[11px] text-text3 mt-0.5">
                    {tier.detail}
                  </span>
                </div>
                <span className="text-text3 group-hover:text-green transition-colors text-lg">
                  →
                </span>
              </button>
            ))}

            <p className="font-mono text-[10px] text-text3 mt-3 leading-relaxed">
              Liever via bank of crypto? Neem contact op via{" "}
              <a
                href={`mailto:${CONTACT.email}?subject=${encodeURIComponent("SurveyFlow - Alternatieve betaling")}`}
                className="text-green no-underline hover:underline"
              >
                {CONTACT.email}
              </a>{" "}
              voor alternatieve betaalmethoden.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
