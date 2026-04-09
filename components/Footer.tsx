"use client";

import { motion } from "framer-motion";
import { CONTACT } from "@/lib/constants";

const FOOTER_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#roadmap", label: "Roadmap" },
  { href: "#donate", label: "Donate" },
  {
    href: `mailto:${CONTACT.email}?subject=${encodeURIComponent("SurveyFlow - Contact")}`,
    label: "Contact",
  },
];

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5 }}
      className="border-t border-border py-8 px-5 md:px-10"
    >
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-green shadow-[0_0_8px_var(--green)]" />
          <span className="font-display text-sm font-bold text-text">
            SurveyFlow
          </span>
        </div>

        {/* Company info */}
        <div className="flex items-center gap-2 text-center">
          <span className="font-mono text-[11px] text-text3">
            {CONTACT.company}
          </span>
          <span className="text-border2 hidden sm:inline">·</span>
          <a
            href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}
            className="font-mono text-[11px] text-text3 no-underline hover:text-green transition-colors"
          >
            {CONTACT.phone}
          </a>
        </div>

        {/* Links */}
        <div className="flex items-center gap-5">
          {FOOTER_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-mono text-[11px] text-text3 no-underline hover:text-green transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </motion.footer>
  );
}
