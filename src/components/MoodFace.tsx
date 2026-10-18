"use client";

import { motion, useReducedMotion } from "motion/react";
import { FACES, blobPath } from "@/lib/blob";
import { moodColor, type MoodKey } from "@/lib/moods";

// Features sit on the mood color; the deep violet needs light features.
const featureColor = (m: MoodKey | null) => (m === "low" ? "#f1eeff" : "#1b1e33");

/**
 * The Little Mind+ character: one blob whose outline and face morph between
 * moods. `mood = null` draws a neutral, waiting face.
 */
export function MoodFace({
  mood,
  size = 200,
  idle = false,
  tint,
  className,
  label,
}: {
  mood: MoodKey | null;
  size?: number;
  /** Gentle "breathing" while waiting for input. */
  idle?: boolean;
  /** Paints the face in another mood's hue (child profile colors). */
  tint?: MoodKey;
  className?: string;
  /** Accessible name; decorative when omitted. */
  label?: string;
}) {
  const reduce = useReducedMotion();
  const shape = mood ?? "okay";
  const face = FACES[shape];
  const hue = tint ?? mood;
  const fill = hue ? moodColor(hue) : "var(--ink-3)";
  const ink = featureColor(hue);
  const t = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 140, damping: 16 };

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <motion.g
        style={{ originX: "100px", originY: "100px" }}
        animate={idle && !reduce ? { scale: [1, 1.035, 1] } : { scale: 1 }}
        transition={idle && !reduce ? { duration: 4, repeat: Infinity, ease: "easeInOut" } : t}
      >
        {/* Colors live on plain elements: CSS transitions handle var() colors. */}
        <g style={{ fill, transition: "fill 500ms ease" }}>
          <motion.path initial={false} animate={{ d: blobPath(shape) }} transition={t} />
        </g>
        <g style={{ fill: ink, stroke: ink, transition: "fill 500ms ease, stroke 500ms ease" }}>
          <motion.circle initial={false} cx={80} r={6.5} animate={{ cy: face.eyeY }} transition={t} />
          <motion.circle initial={false} cx={120} r={6.5} animate={{ cy: face.eyeY }} transition={t} />
          <motion.path
            initial={false}
            animate={{ d: face.mouth }}
            transition={t}
            fill="none"
            strokeWidth={7}
            strokeLinecap="round"
          />
          <motion.path
            initial={false}
            animate={{ d: face.browL, opacity: face.brows }}
            transition={t}
            fill="none"
            strokeWidth={5.5}
            strokeLinecap="round"
          />
          <motion.path
            initial={false}
            animate={{ d: face.browR, opacity: face.brows }}
            transition={t}
            fill="none"
            strokeWidth={5.5}
            strokeLinecap="round"
          />
        </g>
      </motion.g>
    </svg>
  );
}
