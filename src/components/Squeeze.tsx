"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import type { MoodKey } from "@/lib/moods";
import { MoodFace } from "./MoodFace";

const PARTS = [
  { squeeze: "Make two tight fists", release: "Let your hands go floppy" },
  { squeeze: "Lift your shoulders up to your ears", release: "Drop them down and let go" },
  { squeeze: "Scrunch your face like you bit a lemon", release: "Let your face go soft" },
  { squeeze: "Curl your toes and push your feet down", release: "Relax your feet and legs" },
];
const HOLD = 5; // seconds per squeeze and per release

type Phase = "ready" | "squeeze" | "release" | "done";

/** "Squeeze and let go": a child-sized progressive muscle relaxation. */
export function Squeeze({
  tint = "great",
  finishLabel,
  onFinish,
}: {
  tint?: MoodKey;
  finishLabel: string;
  onFinish: () => void;
}) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("ready");
  const [part, setPart] = useState(0);
  const [left, setLeft] = useState(HOLD);

  useEffect(() => {
    if (phase !== "squeeze" && phase !== "release") return;
    const id = setTimeout(() => {
      if (left > 1) return setLeft(left - 1);
      setLeft(HOLD);
      if (phase === "squeeze") return setPhase("release");
      if (part >= PARTS.length - 1) return setPhase("done");
      setPart(part + 1);
      setPhase("squeeze");
    }, 1000);
    return () => clearTimeout(id);
  }, [phase, part, left]);

  const running = phase === "squeeze" || phase === "release";
  const squeezing = phase === "squeeze";

  return (
    <div className="flex flex-1 flex-col items-center text-center">
      <div className="flex flex-1 flex-col items-center justify-center">
        <motion.div
          animate={reduce ? {} : squeezing ? { scaleX: 0.78, scaleY: 0.86 } : { scaleX: 1, scaleY: 1 }}
          transition={{ type: "spring", stiffness: squeezing ? 120 : 60, damping: squeezing ? 8 : 10 }}
        >
          <MoodFace mood={squeezing ? "upset" : phase === "ready" ? "okay" : "great"} tint={tint} size={200} />
        </motion.div>
        <div className="mt-8 min-h-[150px]" aria-live="polite">
          {phase === "ready" && (
            <>
              <h1 className="font-display text-[32px] leading-tight">Squeeze and let go</h1>
              <p className="mx-auto mt-3 max-w-[30ch] text-[17px] text-ink-2 text-pretty">
                Squeeze one part of your body for 5 seconds, then let it go. Four parts, about a minute.
              </p>
            </>
          )}
          {running && (
            <>
              <p className="eyebrow">
                {squeezing ? "Squeeze" : "Let go"} · {part + 1} of {PARTS.length}
              </p>
              <h1 className="font-display mt-2 max-w-[18ch] text-[30px] leading-tight text-balance">
                {squeezing ? PARTS[part].squeeze : PARTS[part].release}
              </h1>
              <p className="font-display mt-3 text-[40px] tabular-nums text-ink-2" aria-hidden>
                {left}
              </p>
            </>
          )}
          {phase === "done" && (
            <>
              <h1 className="font-display text-[32px] leading-tight">Soft and calm</h1>
              <p className="mx-auto mt-3 max-w-[30ch] text-[17px] text-ink-2">Notice how your body feels now.</p>
            </>
          )}
        </div>
      </div>
      <div className="flex w-full flex-col gap-2 pt-6">
        {phase === "ready" && (
          <button className="btn btn-primary" onClick={() => setPhase("squeeze")}>
            Start
          </button>
        )}
        {running && (
          <button className="btn btn-quiet" onClick={() => setPhase("done")}>
            Stop
          </button>
        )}
        {phase === "done" && (
          <>
            <button className="btn btn-primary" onClick={onFinish}>
              {finishLabel}
            </button>
            <button
              className="btn btn-text self-center"
              onClick={() => {
                setPart(0);
                setLeft(HOLD);
                setPhase("squeeze");
              }}
            >
              Do it again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
