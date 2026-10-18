"use client";

import type { MoodKey } from "@/lib/moods";
import { Breathing } from "./Breathing";
import { Grounding } from "./Grounding";
import { MoodFace } from "./MoodFace";
import { Squeeze } from "./Squeeze";

export const EXERCISES = [
  { key: "breathe", title: "Balloon breathing", detail: "Breathe with a growing shape", time: "1 min", face: "good", tint: "okay" },
  { key: "ground", title: "5 · 4 · 3 · 2 · 1", detail: "Notice what's around you", time: "2 min", face: "great", tint: "good" },
  { key: "squeeze", title: "Squeeze and let go", detail: "Relax your body, part by part", time: "1 min", face: "okay", tint: "great" },
] as const satisfies readonly { key: string; title: string; detail: string; time: string; face: MoodKey; tint: MoodKey }[];

export type ExerciseKey = (typeof EXERCISES)[number]["key"];

export function CalmMenu({ onPick }: { onPick: (key: ExerciseKey) => void }) {
  return (
    <ul className="flex flex-col gap-3">
      {EXERCISES.map((x) => (
        <li key={x.key}>
          <button onClick={() => onPick(x.key)} className="card flex w-full items-center gap-4 p-4 text-left transition-transform active:scale-[0.99]">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-bg">
              <MoodFace mood={x.face} tint={x.tint} size={40} />
            </span>
            <span className="flex-1">
              <span className="flex items-baseline justify-between gap-2">
                <span className="text-[17px] font-semibold">{x.title}</span>
                <span className="shrink-0 text-[13px] text-ink-2">{x.time}</span>
              </span>
              <span className="block text-[14px] text-ink-2">{x.detail}</span>
            </span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ink-3" aria-hidden>
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </li>
      ))}
    </ul>
  );
}

export function Exercise({
  which,
  tint,
  finishLabel,
  onFinish,
}: {
  which: ExerciseKey;
  tint?: MoodKey;
  finishLabel: string;
  onFinish: () => void;
}) {
  const props = { finishLabel, onFinish };
  if (which === "breathe") return <Breathing tint={tint ?? "okay"} {...props} />;
  if (which === "ground") return <Grounding tint={tint ?? "good"} {...props} />;
  return <Squeeze tint={tint ?? "great"} {...props} />;
}
