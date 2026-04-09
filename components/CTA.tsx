"use client";

import { motion } from "framer-motion";
import { CONTACT } from "@/lib/constants";

export default function CTA() {
  return (
    <section
      id="cta"
      className="relative py-32 px-5 md:px-10 overflow-hidden"
    >
      {/* Radial glow background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(34,197,94,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-[700px] mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
        >
          <p className="font-mono text-xs text-text3 tracking-widest uppercase mb-4">
            {"// early access"}
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-text mb-5 leading-tight">
            Wees de eerste. Bouw mee aan de toekomst.
          </h2>
          <p className="font-mono text-sm text-text3 leading-relaxed mb-10 max-w-md mx-auto">
            SurveyFlow is in actieve ontwikkeling. Meld je aan voor early
            access en help de toekomst van landmeten in de Caribbean vormgeven.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
        >
          <a
            href={`mailto:${CONTACT.email}?subject=${encodeURIComponent("SurveyFlow - Early Access aanmelding")}`}
            className="font-mono text-sm px-8 py-3.5 rounded-lg bg-green text-[#000] font-semibold no-underline hover:shadow-[0_0_30px_rgba(34,197,94,0.3)] transition-all tracking-wide"
          >
            Aanmelden voor early access
          </a>
          <a
            href={`mailto:${CONTACT.email}?subject=${encodeURIComponent("SurveyFlow - Demo aanvragen")}`}
            className="font-mono text-sm px-8 py-3.5 rounded-lg border border-border2 text-text2 no-underline hover:border-green hover:text-green transition-all tracking-wide"
          >
            Demo aanvragen
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="flex items-center justify-center gap-6 flex-wrap"
        >
          <a
            href={`mailto:${CONTACT.email}`}
            className="font-mono text-xs text-text3 no-underline hover:text-green transition-colors"
          >
            {CONTACT.email}
          </a>
          <span className="text-border2 hidden sm:inline">|</span>
          <a
            href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}
            className="font-mono text-xs text-text3 no-underline hover:text-green transition-colors"
          >
            {CONTACT.phone}
          </a>
        </motion.div>
      </div>
    </section>
  );
}
