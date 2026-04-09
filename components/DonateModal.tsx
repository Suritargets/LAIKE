"use client";

import { useState, useEffect } from "react";
import FormModal from "./FormModal";

interface DonateModalProps {
  open: boolean;
  onClose: () => void;
  prefilledAmount?: number;
}

export default function DonateModal({
  open,
  onClose,
  prefilledAmount,
}: DonateModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  /* Reset form when modal closes; set prefilled amount when opening */
  useEffect(() => {
    if (open) {
      setAmount(prefilledAmount ? String(prefilledAmount) : "");
    } else {
      setName("");
      setEmail("");
      setAmount("");
      setMessage("");
      setSubmitting(false);
      setSuccess(false);
      setError("");
    }
  }, [open, prefilledAmount]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const numericAmount = Number(amount);

    if (!name.trim() || !email.trim()) {
      setError("Naam en email zijn verplicht.");
      return;
    }

    if (!amount || isNaN(numericAmount) || numericAmount < 1) {
      setError("Voer een geldig bedrag in (minimaal $1).");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: "donate",
          name: name.trim(),
          email: email.trim(),
          amount: Math.round(numericAmount * 100),
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

  const numericAmount = Number(amount);

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title="Steun SurveyFlow"
      subtitle="Jouw bijdrage maakt het verschil."
    >
      {success ? (
        <div className="flex flex-col items-center justify-center py-8 gap-3">
          <span className="text-4xl">🙏</span>
          <p className="font-mono text-sm text-green">
            Bedankt voor je steun! 🙏
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

          {/* Amount with formatted label */}
          <div className="flex items-center gap-3">
            <input
              type="number"
              placeholder="Bedrag *"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={1}
              className={`${inputClass} flex-1`}
              required
            />
            {amount && !isNaN(numericAmount) && numericAmount >= 1 && (
              <span className="font-mono text-sm text-green whitespace-nowrap">
                $ {numericAmount}
              </span>
            )}
          </div>

          <textarea
            placeholder="Bericht"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={2}
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
            {submitting ? "Verzenden..." : "Doneren"}
          </button>
        </form>
      )}
    </FormModal>
  );
}
