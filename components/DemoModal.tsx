"use client";

import { useState, useEffect } from "react";
import FormModal from "./FormModal";

interface DemoModalProps {
  open: boolean;
  onClose: () => void;
}

export default function DemoModal({ open, onClose }: DemoModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  /* Reset form when modal closes */
  useEffect(() => {
    if (!open) {
      setName("");
      setEmail("");
      setCompany("");
      setPhone("");
      setMessage("");
      setSubmitting(false);
      setSuccess(false);
      setError("");
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !company.trim()) {
      setError("Naam, email en bedrijf zijn verplicht.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: "demo",
          name: name.trim(),
          email: email.trim(),
          company: company.trim(),
          phone: phone.trim() || undefined,
          message: message.trim() || undefined,
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
      title="Demo Aanvragen"
      subtitle="Plan een persoonlijke walkthrough van SurveyFlow."
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
            placeholder="Bedrijf *"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className={inputClass}
            required
          />
          <input
            type="tel"
            placeholder="Telefoon"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClass}
          />
          <textarea
            placeholder="Bericht"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className={`${inputClass} resize-none`}
          />

          {error && (
            <p className="font-mono text-xs text-amber">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-green text-black font-mono text-sm font-semibold py-3 rounded-lg hover:shadow-[0_0_30px_rgba(34,197,94,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-none"
          >
            {submitting ? "Verzenden..." : "Demo aanvragen"}
          </button>
        </form>
      )}
    </FormModal>
  );
}
