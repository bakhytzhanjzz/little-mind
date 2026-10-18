"use client";

import { motion, useAnimate } from "motion/react";
import { useEffect, useState } from "react";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];

/**
 * Four-digit PIN entry. `onComplete` resolves to an error message to show
 * (the dots shake and clear), or to nothing on success.
 */
export function PinPad({
  title,
  hint,
  onComplete,
}: {
  title: string;
  hint?: string;
  onComplete: (pin: string) => Promise<string | void>;
}) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [scope, animate] = useAnimate();

  const submit = async (full: string) => {
    setBusy(true);
    const msg = await onComplete(full);
    setBusy(false);
    if (msg) {
      setError(msg);
      setPin("");
      animate(scope.current, { x: [0, -10, 10, -6, 6, 0] }, { duration: 0.35 });
    }
  };

  const press = (k: string) => {
    if (busy) return;
    setError("");
    if (k === "del") return setPin(pin.slice(0, -1));
    if (!k || pin.length >= 4) return;
    const next = pin + k;
    setPin(next);
    if (next.length === 4) submit(next);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^\d$/.test(e.key)) press(e.key);
      else if (e.key === "Backspace") press("del");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-center text-[22px] font-semibold">{title}</h2>
      <p className={`mt-2 min-h-5 text-center text-[15px] ${error ? "text-danger" : "text-ink-2"}`} role="status">
        {error || hint}
      </p>
      <div ref={scope} className="mt-7 flex gap-4" aria-label={`${pin.length} of 4 digits entered`}>
        {[0, 1, 2, 3].map((i) => (
          <motion.span
            key={i}
            className="size-3.5 rounded-full ring-2 ring-ink"
            animate={{ backgroundColor: i < pin.length ? "var(--ink)" : "rgba(0,0,0,0)" }}
            transition={{ duration: 0.12 }}
          />
        ))}
      </div>
      <div className="mt-9 grid w-full max-w-[300px] grid-cols-3 gap-x-6 gap-y-3">
        {KEYS.map((k, i) =>
          k ? (
            <button
              key={i}
              type="button"
              onClick={() => press(k)}
              aria-label={k === "del" ? "Delete digit" : k}
              className="flex h-16 items-center justify-center rounded-full text-[26px] font-medium tabular-nums transition-colors active:bg-line"
            >
              {k === "del" ? (
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M9 5h11a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H9l-6-7z" />
                  <path d="m12.5 9.5 5 5m0-5-5 5" />
                </svg>
              ) : (
                k
              )}
            </button>
          ) : (
            <span key={i} />
          ),
        )}
      </div>
    </div>
  );
}
