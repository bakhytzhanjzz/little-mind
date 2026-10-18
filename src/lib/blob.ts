import type { MoodKey } from "./moods";

/**
 * Every mood is drawn as the same kind of path — 10 points joined by 10 cubic
 * curves — so one shape can morph smoothly into another.
 */
const POINTS = 10;
const C = 100; // centre of the 200×200 viewBox
const R = 72;

type Shape = { radius: (angle: number, i: number) => number; tension: number };

const SHAPES: Record<MoodKey, Shape> = {
  // A soft five-petal sun.
  great: { radius: (_, i) => (i % 2 ? 0.9 : 1.04), tension: 1 },
  // Round and settled.
  good: { radius: () => 1, tension: 1 },
  // A little wider than tall.
  okay: {
    radius: (a) => 1 / Math.hypot(Math.cos(a) / 1.1, Math.sin(a) / 0.86),
    tension: 1,
  },
  // Heavy at the bottom, like it's sagging.
  low: { radius: (a) => 0.9 + 0.13 * Math.sin(a) + 0.03 * Math.cos(2 * a), tension: 1 },
  // Uneven and prickly.
  upset: {
    radius: (_, i) => [1.06, 0.8, 1.0, 0.78, 1.08, 0.82, 0.98, 0.79, 1.04, 0.84][i],
    tension: 0.55,
  },
};

const r1 = (n: number) => Math.round(n * 10) / 10;

export function blobPath(mood: MoodKey): string {
  const { radius, tension } = SHAPES[mood];
  const pts = Array.from({ length: POINTS }, (_, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / POINTS;
    const r = R * radius(a, i);
    return [C + r * Math.cos(a), C + r * Math.sin(a)] as const;
  });
  // Catmull-Rom → cubic Bézier, closed loop.
  const k = tension / 6;
  let d = `M${r1(pts[0][0])} ${r1(pts[0][1])}`;
  for (let i = 0; i < POINTS; i++) {
    const p0 = pts[(i - 1 + POINTS) % POINTS];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % POINTS];
    const p3 = pts[(i + 2) % POINTS];
    d += `C${r1(p1[0] + (p2[0] - p0[0]) * k)} ${r1(p1[1] + (p2[1] - p0[1]) * k)} ${r1(
      p2[0] - (p3[0] - p1[0]) * k,
    )} ${r1(p2[1] - (p3[1] - p1[1]) * k)} ${r1(p2[0])} ${r1(p2[1])}`;
  }
  return d + "Z";
}

/** Face features. Same command structure for every mood so they morph too. */
export const FACES: Record<MoodKey, { mouth: string; browL: string; browR: string; brows: number; eyeY: number }> = {
  great: { mouth: "M76 110Q100 138 124 110", browL: "M70 70L86 68", browR: "M114 68L130 70", brows: 0, eyeY: 86 },
  good: { mouth: "M82 112Q100 128 118 112", browL: "M70 70L86 68", browR: "M114 68L130 70", brows: 0, eyeY: 88 },
  okay: { mouth: "M84 118Q100 118 116 118", browL: "M70 72L86 72", browR: "M114 72L130 72", brows: 0, eyeY: 90 },
  low: { mouth: "M84 126Q100 112 116 126", browL: "M70 80L86 74", browR: "M114 74L130 80", brows: 1, eyeY: 96 },
  upset: { mouth: "M80 126Q100 106 120 126", browL: "M70 72L88 80", browR: "M112 80L130 72", brows: 1, eyeY: 94 },
};
