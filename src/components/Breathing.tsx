"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import type { MoodKey } from "@/lib/moods";
import { MoodFace } from "./MoodFace";

const IN = 4;
const OUT = 6;
const BREATHS = 6; // 6 × 10 s ≈ one minute

type Phase = "ready" | "in" | "out" | "done";

/** Guided "grow and shrink" breathing: in for 4 s, out for 6 s, six times. */
export function Breathing({
  tint = "okay",
  finishLabel,
  onFinish,
}: {
  tint?: MoodKey;
  finishLabel: string;
  onFinish: () => void;
}) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("ready");
  const [breath, setBreath] = useState(1);

  useEffect(() => {
    if (phase !== "in" && phase !== "out") return;
    const id = setTimeout(
      () => {
        if (phase === "in") return setPhase("out");
        if (breath >= BREATHS) return setPhase("done");
        setBreath((b) => b + 1);
        setPhase("in");
      },
      (phase === "in" ? IN : OUT) * 1000,
    );
    return () => clearTimeout(id);
  }, [phase, breath]);

  const running = phase === "in" || phase === "out";
  const big = phase === "in" || phase === "done";
  const words: Record<Phase, string> = {
    ready: "Breathe with me",
    in: "Breathe in…",
    out: "…and out",
    done: "Nice and slow",
  };

  return (
    <div className="flex flex-1 flex-col items-center text-center">
      <div className="relative mt-6 flex size-[280px] items-center justify-center">
        <span className="absolute inset-0 rounded-full border-2 border-dashed border-ink-3/45" aria-hidden />
        <motion.div
          animate={
            reduce ? { opacity: big ? 1 : 0.5 } : { scale: big ? 1 : 0.6 }
          }
          initial={false}
          transition={{
            duration: running ? (phase === "in" ? IN : OUT) : 0.8,
            ease: "easeInOut",
          }}
        >
          <MoodFace mood="good" tint={tint} size={260} />
        </motion.div>
      </div>

      <div className="mt-8 min-h-[110px]" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.h1
            key={phase}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35 }}
            className="font-display text-[34px] leading-tight"
          >
            {words[phase]}
          </motion.h1>
        </AnimatePresence>
        <p className="mt-2 text-[16px] text-ink-2">
          {phase === "ready" && "Breathe in as the shape grows, out as it shrinks. Six slow breaths, about a minute."}
          {running && `Breath ${breath} of ${BREATHS}`}
          {phase === "done" && "That was a whole minute of calm."}
        </p>
      </div>

      <div className="mt-auto w-full pt-6">
        {phase === "ready" && (
          <button className="btn btn-primary" onClick={() => setPhase("in")}>
            Start breathing
          </button>
        )}
        {running && (
          <button className="btn btn-quiet" onClick={() => setPhase("done")}>
            Stop
          </button>
        )}
        {phase === "done" && (
          <div className="flex flex-col gap-2">
            <button className="btn btn-primary" onClick={onFinish}>
              {finishLabel}
            </button>
            <button
              className="btn btn-text self-center"
              onClick={() => {
                setBreath(1);
                setPhase("in");
              }}
            >
              Breathe again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
