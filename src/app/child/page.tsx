"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Breathing } from "@/components/Breathing";
import { MoodFace } from "@/components/MoodFace";
import { PinPad } from "@/components/PinPad";
import { FormError, Loading, Wash } from "@/components/ui";
import { api, type Child } from "@/lib/api";
import { MOODS, MOOD_KEYS, TAGS, type MoodKey } from "@/lib/moods";

type Step = "mood" | "tags" | "saved" | "breathe" | "handback";

/** Child mode: the check-in a child does on the parent's phone. */
export default function ChildMode() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [child, setChild] = useState<Child | null>(null);
  const [step, setStep] = useState<Step>("mood");
  const [mood, setMood] = useState<MoodKey | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [pinOpen, setPinOpen] = useState(false);

  useEffect(() => {
    api<{ child: Child }>("/api/child-mode")
      .then((r) => setChild(r.child))
      .catch(() => router.replace("/home"));
  }, [router]);

  const save = async (withTags: string[]) => {
    if (!mood) return;
    setSaving(true);
    setError("");
    try {
      await api("/api/moods", { body: { mood, tags: withTags } });
      setStep("saved");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const restart = () => {
    setMood(null);
    setTags([]);
    setStep("mood");
  };

  const slide = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -12 },
      };

  if (!child)
    return (
      <main className="screen">
        <Loading />
      </main>
    );

  return (
    <main className="screen">
      <Wash
        mood={step === "handback" ? null : step === "breathe" ? child.color : mood}
        strength={step === "mood" ? 16 : 12}
      />

      <header className="flex h-11 items-center justify-between">
        <span className="font-display text-[18px] text-ink-2">Hi {child.name}</span>
        <button
          onClick={() => setPinOpen(true)}
          className="-mr-2 inline-flex h-11 items-center gap-1.5 rounded-full px-3 text-[14px] font-medium text-ink-2"
          aria-label="Parent: enter PIN to leave Child mode"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
            <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
          </svg>
          Parent
        </button>
      </header>

      <AnimatePresence mode="wait">
        {step === "mood" && (
          <motion.section key="mood" {...slide} transition={{ duration: 0.3 }} className="flex flex-1 flex-col">
            <h1 className="font-display mt-4 text-center text-[34px] leading-[1.1] text-balance">
              How are you feeling right now?
            </h1>
            <div className="flex flex-1 flex-col items-center justify-center py-4">
              <MoodFace mood={mood} size={232} idle={!mood} label={mood ? MOODS[mood].label : undefined} />
              <p className="font-display mt-3 h-9 text-[28px]" aria-live="polite">
                {mood ? MOODS[mood].label : <span className="text-ink-2 text-[20px]">Tap the face that fits</span>}
              </p>
            </div>
            <div className="grid grid-cols-5 gap-1" role="radiogroup" aria-label="Mood">
              {MOOD_KEYS.map((m) => (
                <button
                  key={m}
                  role="radio"
                  aria-checked={mood === m}
                  onClick={() => setMood(m)}
                  className={`flex flex-col items-center gap-1 rounded-2xl py-2 transition-all ${
                    mood === m ? "bg-surface shadow-[0_1px_0_var(--line)] ring-2 ring-ink" : ""
                  }`}
                >
                  <motion.span animate={{ scale: mood === m ? 1.08 : 1 }} transition={{ type: "spring", stiffness: 300, damping: 18 }}>
                    <MoodFace mood={m} size={50} />
                  </motion.span>
                  <span className="text-[13px] font-semibold">{MOODS[m].label}</span>
                </button>
              ))}
            </div>
            <button className="btn btn-primary mt-5" disabled={!mood} onClick={() => setStep("tags")}>
              Next
            </button>
          </motion.section>
        )}

        {step === "tags" && mood && (
          <motion.section key="tags" {...slide} transition={{ duration: 0.3 }} className="flex flex-1 flex-col">
            <div className="mt-2 flex justify-center">
              <MoodFace mood={mood} size={112} />
            </div>
            <h1 className="font-display mt-4 text-center text-[30px] leading-[1.15] text-balance">{MOODS[mood].reply}</h1>
            <p className="mt-2 text-center text-[16px] text-ink-2">Pick any that fit, or none.</p>
            <div className="mt-7 grid grid-cols-2 gap-2.5">
              {TAGS.map((t) => {
                const on = tags.includes(t.key);
                return (
                  <button
                    key={t.key}
                    aria-pressed={on}
                    onClick={() => setTags((ts) => (on ? ts.filter((x) => x !== t.key) : [...ts, t.key]))}
                    className={`h-14 rounded-2xl text-[17px] font-semibold transition-colors ${
                      on ? "bg-ink text-bg" : "bg-surface text-ink ring-1 ring-line"
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
            <div className="mt-auto flex flex-col gap-2 pt-6">
              <FormError message={error} />
              <button className="btn btn-primary" disabled={saving} onClick={() => save(tags)}>
                {saving ? "Saving…" : "Save my check-in"}
              </button>
              <button className="btn btn-text self-center" onClick={() => setStep("mood")} disabled={saving}>
                Change my feeling
              </button>
            </div>
          </motion.section>
        )}

        {step === "saved" && mood && (
          <motion.section key="saved" {...slide} transition={{ duration: 0.3 }} className="flex flex-1 flex-col text-center">
            <div className="flex flex-1 flex-col items-center justify-center">
              <MoodFace mood={mood} size={180} />
              <h1 className="font-display mt-6 text-[34px] leading-tight">Saved. Thank you!</h1>
              <p className="mt-3 max-w-[30ch] text-[17px] text-ink-2 text-pretty">
                {mood === "low" || mood === "upset"
                  ? "Big feelings are easier with slow breaths. Want to try one minute together?"
                  : "Want to take one slow, calm minute before you go?"}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button className="btn btn-primary" onClick={() => setStep("breathe")}>
                Breathe for a minute
              </button>
              <button className="btn btn-quiet" onClick={() => setStep("handback")}>
                I&apos;m done
              </button>
            </div>
          </motion.section>
        )}

        {step === "breathe" && (
          <motion.section key="breathe" {...slide} transition={{ duration: 0.3 }} className="flex flex-1 flex-col">
            <Breathing tint={child.color} finishLabel="I'm done" onFinish={() => setStep("handback")} />
          </motion.section>
        )}

        {step === "handback" && (
          <motion.section key="handback" {...slide} transition={{ duration: 0.3 }} className="flex flex-1 flex-col text-center">
            <div className="flex flex-1 flex-col items-center justify-center">
              <MoodFace mood="great" tint={child.color} size={160} idle />
              <h1 className="font-display mt-6 text-[34px] leading-tight">All done, {child.name}!</h1>
              <p className="mt-3 text-[17px] text-ink-2">You can give the phone back now.</p>
            </div>
            <div className="flex flex-col gap-3">
              <button className="btn btn-primary" onClick={() => setPinOpen(true)}>
                Grown-up: unlock
              </button>
              <button className="btn btn-text self-center" onClick={restart}>
                Check in again
              </button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {pinOpen && (
          <motion.div
            key="pin"
            role="dialog"
            aria-modal="true"
            aria-label="Parent PIN"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-10 bg-bg"
          >
            <div className="screen">
              <div className="flex h-11 justify-end">
                <button className="btn btn-text -mr-3" onClick={() => setPinOpen(false)}>
                  Cancel
                </button>
              </div>
              <div className="mt-6">
                <PinPad
                  title="Parent PIN"
                  hint="Enter your PIN to go back to the parent screens."
                  onComplete={async (pin) => {
                    try {
                      await api("/api/child-mode/exit", { body: { pin } });
                      router.replace("/home");
                    } catch (err) {
                      return (err as Error).message;
                    }
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
