export const MOOD_KEYS = ["great", "good", "okay", "low", "upset"] as const;
export type MoodKey = (typeof MOOD_KEYS)[number];

export const MOODS: Record<MoodKey, { label: string; reply: string }> = {
  great: { label: "Great", reply: "Love that. What made today shine?" },
  good: { label: "Good", reply: "Nice. What's helping today?" },
  okay: { label: "Okay", reply: "Okay is okay. What's on your mind?" },
  low: { label: "Low", reply: "Thanks for telling me. What's it about?" },
  upset: { label: "Upset", reply: "That sounds hard. What's it about?" },
};

export const TAGS = [
  { key: "school", label: "School" },
  { key: "friends", label: "Friends" },
  { key: "family", label: "Family" },
  { key: "sleep", label: "Sleep" },
  { key: "body", label: "My body" },
  { key: "other", label: "Something else" },
] as const;
export type TagKey = (typeof TAGS)[number]["key"];
export const TAG_KEYS = TAGS.map((t) => t.key) as readonly string[];

export const NOTE_MAX = 500;

export const tagLabel = (key: string) =>
  TAGS.find((t) => t.key === key)?.label ?? key;

export const isMood = (v: unknown): v is MoodKey =>
  typeof v === "string" && (MOOD_KEYS as readonly string[]).includes(v);

/** CSS custom property holding a mood's color (light/dark aware). */
export const moodColor = (m: MoodKey) => `var(--mood-${m})`;

/** Colors a parent can give a child's profile — reuses the mood hues. */
export const CHILD_COLORS = MOOD_KEYS;

export const COLOR_NAMES: Record<MoodKey, string> = {
  great: "Amber",
  good: "Green",
  okay: "Sky blue",
  low: "Violet",
  upset: "Coral",
};
