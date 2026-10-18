import "server-only";
import { MOODS, type MoodKey, tagLabel } from "./moods";

export type SummaryEntry = { mood: MoodKey; tags: string[]; note: string | null; createdAt: Date };

export type Summary = {
  /** "ai" when written by the language model, "basic" when built from counts. */
  source: "ai" | "basic";
  summary: string;
  starters: string[];
  nextStep: string;
  /** Distinct days with at least one check-in, out of the 7. */
  days: number;
};

const HARD: MoodKey[] = ["low", "upset"];

const STARTERS: Record<string, string[]> = {
  school: [
    "What was the best and the hardest part of school today?",
    "Is there a subject that feels tricky right now?",
    "If you could change one thing about school this week, what would it be?",
  ],
  friends: [
    "Who did you hang out with at break today?",
    "Has anything happened with your friends lately that felt unfair?",
    "What's something fun you'd like to do with a friend this weekend?",
  ],
  family: [
    "What's something you liked doing together this week?",
    "Is there anything at home you'd like to be different?",
    "Want to plan something just for the two of us?",
  ],
  sleep: [
    "How have you been sleeping lately?",
    "Is anything on your mind when you go to bed?",
    "What would help bedtime feel calmer?",
  ],
  body: [
    "How has your body been feeling this week?",
    "Is anything hurting or bothering you?",
    "What helps you feel better when you don't feel well?",
  ],
  default: [
    "What was the best part of your day?",
    "Was anything hard this week?",
    "Is there something you'd like to talk about, now or later?",
  ],
};

function stats(entries: SummaryEntry[]) {
  const dayKey = (d: Date) => d.toISOString().slice(0, 10);
  const days = new Set(entries.map((e) => dayKey(e.createdAt))).size;
  const hardDays = new Set(entries.filter((e) => HARD.includes(e.mood)).map((e) => dayKey(e.createdAt))).size;
  const tagCount = new Map<string, number>();
  for (const e of entries) for (const t of e.tags) tagCount.set(t, (tagCount.get(t) ?? 0) + 1);
  const topTag = [...tagCount].sort((a, b) => b[1] - a[1])[0];
  return { days, hardDays, topTag };
}

/** Counts-only summary: no AI, always available. */
export function basicSummary(entries: SummaryEntry[]): Summary {
  const { days, hardDays, topTag } = stats(entries);
  const n = entries.length;
  const bright = entries.filter((e) => e.mood === "great" || e.mood === "good").length;
  const hard = entries.filter((e) => HARD.includes(e.mood)).length;
  const overall =
    bright >= n / 2 ? "most check-ins were good or great" : hard >= n / 2 ? "many check-ins were low or upset" : "the week was mixed";
  const topic = topTag ? ` "${tagLabel(topTag[0])}" came up most often (${topTag[1]}×).` : "";
  return {
    source: "basic",
    days,
    summary: `Your child checked in ${n} time${n === 1 ? "" : "s"} on ${days} of the last 7 days, and ${overall}.${topic}`,
    starters: STARTERS[topTag?.[0] ?? "default"] ?? STARTERS.default,
    nextStep:
      hardDays >= 3
        ? "Low or upset feelings showed up on several days. A calm one-to-one chat could help, and if it continues, consider talking to the school psychologist or a doctor."
        : "Keep it light: a short, relaxed chat after school or at dinner often works better than a big talk.",
  };
}

const SYSTEM = `You help a parent understand their child's week, using entries from a mood check-in app for children aged 8 to 14.

Rules:
- You are not a clinician. Never diagnose, name disorders, or guess at causes the entries don't show.
- Use only the entries given. Refer to the child as "your child".
- Write warmly and plainly for a parent, in English. No jargon, no lists inside strings.
- summary: 2 or 3 sentences on the week's overall pattern, notable days, and topics that recur.
- starters: exactly 3 open, non-leading questions the parent could ask, in a friendly voice a child would answer, each under 15 words. Connect them to what the entries mention.
- next_step: one sentence with a gentle, practical suggestion. If low or upset appear on 3 or more days, or a note suggests the child is struggling a lot, suggest talking with the school psychologist or a doctor.`;

const SCHEMA = {
  name: "weekly_summary",
  strict: true,
  schema: {
    type: "object",
    properties: {
      summary: { type: "string" },
      starters: { type: "array", items: { type: "string" } },
      next_step: { type: "string" },
    },
    required: ["summary", "starters", "next_step"],
    additionalProperties: false,
  },
};

function describe(entries: SummaryEntry[], tzOffset: number) {
  return entries
    .map((e) => {
      const local = new Date(e.createdAt.getTime() - tzOffset * 60_000);
      const when = local.toLocaleString("en-GB", { weekday: "short", hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
      const topics = e.tags.length ? e.tags.map(tagLabel).join(", ") : "none";
      const note = e.note ? ` | note: "${e.note.slice(0, 240).replace(/\s+/g, " ")}"` : "";
      return `${when} | ${MOODS[e.mood].label} | topics: ${topics}${note}`;
    })
    .join("\n");
}

/**
 * Asks Groq for a summary. Returns null when no key is configured or the
 * call fails, so the caller can fall back to the basic summary.
 */
export async function aiSummary(entries: SummaryEntry[], tzOffset: number): Promise<Summary | null> {
  const key = process.env.GROQ_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      signal: AbortSignal.timeout(25_000),
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
        temperature: 0.4,
        response_format: { type: "json_schema", json_schema: SCHEMA },
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: `Check-ins from the last 7 days, oldest first:\n${describe(entries, tzOffset)}` },
        ],
      }),
    });
    if (!res.ok) {
      console.error("Groq error", res.status, await res.text().catch(() => ""));
      return null;
    }
    const data = await res.json();
    const out = JSON.parse(data.choices?.[0]?.message?.content ?? "{}");
    const starters = Array.isArray(out.starters) ? out.starters.filter((s: unknown) => typeof s === "string").slice(0, 3) : [];
    if (typeof out.summary !== "string" || typeof out.next_step !== "string" || starters.length === 0) return null;
    return { source: "ai", days: stats(entries).days, summary: out.summary, starters, nextStep: out.next_step };
  } catch (err) {
    console.error("Groq request failed", err);
    return null;
  }
}
