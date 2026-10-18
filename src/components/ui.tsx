"use client";

import Link from "next/link";
import { useEffect } from "react";
import { moodColor, type MoodKey } from "@/lib/moods";
import { MoodFace } from "./MoodFace";

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display text-[19px] font-semibold tracking-tight ${className}`}>
      Little Mind<span className="text-ink-2">+</span>
    </span>
  );
}

export function BackLink({ href, children = "Back" }: { href: string; children?: React.ReactNode }) {
  return (
    <Link href={href} className="-ml-2 inline-flex h-11 items-center gap-1 self-start px-2 text-[15px] font-medium text-ink-2">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="m15 18-6-6 6-6" />
      </svg>
      {children}
    </Link>
  );
}

/** Tints the whole page (including overscroll) toward a mood's color. */
export function Wash({ mood, strength = 14 }: { mood: MoodKey | null; strength?: number }) {
  useEffect(() => {
    document.body.style.backgroundColor = mood
      ? `color-mix(in oklab, ${moodColor(mood)} ${strength}%, var(--bg))`
      : "";
  }, [mood, strength]);
  useEffect(() => () => void (document.body.style.backgroundColor = ""), []);
  return null;
}

export function Loading({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex flex-1 items-center justify-center" role="status" aria-label={label}>
      <MoodFace mood={null} size={64} idle />
    </div>
  );
}

export function FormError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p className="text-[15px] text-danger" role="alert">
      {message}
    </p>
  );
}
