"use client";

import { useState, useEffect } from "react";
import FormModal from "./FormModal";

interface EarlyAccessModalProps {
  open: boolean;
  onClose: () => void;
}

export default function EarlyAccessModal({
  open,
  onClose,
}: EarlyAccessModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  /* Reset form when modal closes */
  useEffect(() => {
    if (!open) {
      setName("");
      setEmail("");
      setCompany("");
      setRole("");
      setSubmitting(false);
      setSuccess(false);
      setError("");
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim()) {
      setError("Naam en email zijn verplicht.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: "early_access",
          name: name.trim(),
          email: email.trim(),
          company: company.trim() || undefined,
          role: role || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Er is iets misgegaan.");
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er is iets misgegaan.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "bg-bg3 border border-border rounded-lg px-4 py-3 text-sm text-text font-mono w-full focus:border-green focus:outline-none placeholder:text-text3 transition-colors";

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title="Aanmelden voor Early Access"
      subtitle="Wees de eerste die SurveyFlow test."
    >
      {success ? (
        <div className="flex flex-col items-center justify-center py-8 gap-3">
          <span className="text-green text-4xl">✓</span>
          <p className="font-mono text-sm text-green">
            Bedankt! We nemen contact op.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Naam *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            required
          />
          <input
            type="email"
            placeholder="Email *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            required
          />
          <input
            type="text"
            placeholder="Bedrijf"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className={inputClass}
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className={`${inputClass} ${!role ? "text-text3" : ""}`}
          >
            <option value="">Rol</option>
            <option value="Landmeter">Landmeter</option>
            <option value="Developer">Developer</option>
            <option value="Designer">Designer</option>
            <option value="Anders">Anders</option>
          </select>

          {error && (
            <p className="font-mono text-xs text-amber">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-green text-black font-mono text-sm font-semibold py-3 rounded-lg hover:shadow-[0_0_30px_rgba(34,197,94,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-none"
          >
            {submitting ? "Verzenden..." : "Aanmelden"}
          </button>
        </form>
      )}
    </FormModal>
  );
}
