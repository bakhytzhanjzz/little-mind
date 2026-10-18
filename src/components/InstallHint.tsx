"use client";

import { useEffect, useState } from "react";

type InstallPrompt = Event & { prompt: () => Promise<void> };

const DISMISS_KEY = "lm:installHintDismissed";

/**
 * Android/desktop Chrome: an "Install" button using the browser prompt.
 * iPhone Safari has no prompt, so it explains Share → Add to Home Screen.
 * Hidden once installed or dismissed.
 */
export function InstallHint() {
  const [mode, setMode] = useState<"ios" | "prompt" | null>(null);
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone;
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(DISMISS_KEY) === "1";
    } catch {}
    if (standalone || dismissed) return;

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    // Reading browser-only state once on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (ios) setMode("ios");
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPrompt(e as InstallPrompt);
      setMode("prompt");
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const dismiss = () => {
    setMode(null);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {}
  };

  if (!mode) return null;
  return (
    <div className="card flex items-start gap-3 p-4">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-ink-2" aria-hidden>
        <rect x="6" y="2.5" width="12" height="19" rx="3" />
        <path d="M10.5 18.5h3" />
      </svg>
      <div className="flex-1 text-[15px] leading-snug">
        <p className="font-semibold">Keep Little Mind+ on your home screen</p>
        {mode === "ios" ? (
          <p className="mt-1 text-ink-2">
            In Safari, tap <span className="font-medium text-ink">Share</span>, then{" "}
            <span className="font-medium text-ink">Add to Home Screen</span>.
          </p>
        ) : (
          <button
            className="mt-2 rounded-full bg-ink px-4 py-2 text-[14px] font-semibold text-bg"
            onClick={async () => {
              await prompt?.prompt();
              dismiss();
            }}
          >
            Install app
          </button>
        )}
      </div>
      <button onClick={dismiss} aria-label="Dismiss" className="-m-2 p-2 text-ink-3">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>
    </div>
  );
}
