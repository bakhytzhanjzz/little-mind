"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { moodColor, type MoodKey } from "@/lib/moods";
import { MoodFace } from "./MoodFace";

const STEPS = [
  { n: 5, sense: "see", prompt: "Look around. Find 5 things you can see." },
  { n: 4, sense: "feel", prompt: "Find 4 things you can touch or feel." },
  { n: 3, sense: "hear", prompt: "Listen. Find 3 things you can hear." },
  { n: 2, sense: "smell", prompt: "Find 2 things you can smell, or 2 smells you like." },
  { n: 1, sense: "taste", prompt: "Notice 1 thing you can taste, or your favourite taste." },
];

/** 5-4-3-2-1 grounding: tap a dot for each thing you notice. */
export function Grounding({
  tint = "good",
  finishLabel,
  onFinish,
}: {
  tint?: MoodKey;
  finishLabel: string;
  onFinish: () => void;
}) {
  const [step, setStep] = useState(-1); // -1 = intro, STEPS.length = done
  const [found, setFound] = useState(0);
  const cur = STEPS[step];
  const next = () => {
    setFound(0);
    setStep((s) => s + 1);
  };

  if (step === -1 || step === STEPS.length) {
    const done = step === STEPS.length;
    return (
      <div className="flex flex-1 flex-col items-center text-center">
        <div className="flex flex-1 flex-col items-center justify-center">
          <MoodFace mood={done ? "great" : "good"} tint={tint} size={150} idle={!done} />
          <h1 className="font-display mt-6 text-[32px] leading-tight">{done ? "You're right here" : "5 · 4 · 3 · 2 · 1"}</h1>
          <p className="mt-3 max-w-[30ch] text-[17px] text-ink-2 text-pretty">
            {done
              ? "Noticing what's around you helps big feelings settle down."
              : "When feelings get too big, your senses can bring you back. We'll notice things one at a time."}
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 pt-6">
          <button className="btn btn-primary" onClick={done ? onFinish : next}>
            {done ? finishLabel : "Start"}
          </button>
          {done && (
            <button className="btn btn-text self-center" onClick={() => setStep(0)}>
              Do it again
            </button>
          )}
        </div>
      </div>
    );
  }

  const complete = found >= cur.n;
  return (
    <div className="flex flex-1 flex-col items-center text-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="flex flex-1 flex-col items-center justify-center"
        >
          <span
            className="font-display flex size-28 items-center justify-center rounded-full text-[64px]"
            style={{ background: moodColor(tint), color: tint === "low" ? "#f1eeff" : "#1b1e33" }}
            aria-hidden
          >
            {cur.n}
          </span>
          <p className="eyebrow mt-6">Things you can {cur.sense}</p>
          <h1 className="font-display mt-2 max-w-[18ch] text-[30px] leading-tight text-balance">{cur.prompt}</h1>
          <div className="mt-8 flex gap-3" role="group" aria-label={`Found ${found} of ${cur.n}`}>
            {Array.from({ length: cur.n }, (_, i) => (
              <button
                key={i}
                onClick={() => setFound(i < found ? i : i + 1)}
                aria-label={`Thing ${i + 1}${i < found ? ", found" : ""}`}
                className="flex size-12 items-center justify-center rounded-full ring-2 ring-ink transition-colors"
                style={{ background: i < found ? "var(--ink)" : "transparent" }}
              >
                {i < found && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="m5 12 5 5 9-10" />
                  </svg>
                )}
              </button>
            ))}
          </div>
          <p className="mt-3 text-[15px] text-ink-2">Tap a circle for each one you find.</p>
        </motion.div>
      </AnimatePresence>
      <div className="flex w-full flex-col gap-2 pt-6">
        <button className="btn btn-primary" onClick={next} disabled={!complete}>
          {step === STEPS.length - 1 ? "Finish" : "Next"}
        </button>
        {!complete && (
          <button className="btn btn-text self-center" onClick={next}>
            Skip this one
          </button>
        )}
      </div>
    </div>
  );
}
