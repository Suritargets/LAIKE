"use client";

import { useState } from "react";
import { useTheme } from "./ThemeProvider";
import { NAV_LINKS } from "@/lib/constants";

export default function Nav() {
  const [open, setOpen] = useState(false);
  const { theme, toggle } = useTheme();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-[60px] flex items-center justify-between px-5 md:px-10 bg-bg/85 backdrop-blur-xl border-b border-border">
      <a href="#" className="flex items-center gap-2.5 no-underline">
        <span className="w-2 h-2 rounded-full bg-green shadow-[0_0_8px_var(--green)] animate-pulse" />
        <span className="font-display text-lg font-bold text-text">LAIKE</span>
        <span className="font-mono text-[9px] text-text3 tracking-wider">by Suritargets</span>
      </a>

      {/* Desktop links */}
      <ul className="hidden md:flex gap-8 list-none">
        {NAV_LINKS.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              className="font-mono text-xs text-text2 no-underline tracking-wider hover:text-green transition-colors"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-3">
        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="w-9 h-9 rounded-lg border border-border2 bg-transparent flex items-center justify-center text-text2 hover:text-green hover:border-green transition-colors cursor-pointer"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? "☀" : "🌙"}
        </button>

        {/* Hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="flex md:hidden flex-col gap-1 bg-transparent border-none cursor-pointer p-2"
          aria-label="Menu"
        >
          <span
            className={`block w-5 h-0.5 bg-text transition-all duration-300 ${open ? "rotate-45 translate-y-[6px]" : ""}`}
          />
          <span
            className={`block w-5 h-0.5 bg-text transition-all duration-300 ${open ? "opacity-0" : ""}`}
          />
          <span
            className={`block w-5 h-0.5 bg-text transition-all duration-300 ${open ? "-rotate-45 -translate-y-[6px]" : ""}`}
          />
        </button>

        {/* CTA */}
        <a
          href="#cta"
          className="hidden md:inline-block font-mono text-xs px-5 py-2 border border-green text-green rounded hover:bg-green-glow hover:shadow-[0_0_20px_rgba(34,197,94,0.2)] transition-all no-underline tracking-wider"
        >
          Early Access →
        </a>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="fixed top-[60px] left-0 right-0 bottom-0 bg-bg/97 backdrop-blur-xl flex flex-col items-center justify-center gap-8 z-50 md:hidden">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="font-mono text-base text-text2 no-underline hover:text-green transition-colors"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#cta"
            onClick={() => setOpen(false)}
            className="font-mono text-sm px-6 py-3 border border-green text-green rounded no-underline"
          >
            Early Access →
          </a>
        </div>
      )}
    </nav>
  );
}
