import { NextResponse } from "next/server";
import { and, asc, eq, gte } from "drizzle-orm";
import type { DB } from "@/lib/db";
import { getDb } from "@/lib/db";
import { ownedChild } from "@/lib/data";
import { body, handler, requireParent } from "@/lib/http";
import type { MoodKey } from "@/lib/moods";
import { moodEntries, summaries } from "@/lib/schema";
import { aiSummary, basicSummary, type Summary, type SummaryEntry } from "@/lib/summary";

const WEEK = 7 * 86_400_000;

async function lastWeek(db: DB, childId: string) {
  const rows = await db
    .select({ id: moodEntries.id, mood: moodEntries.mood, tags: moodEntries.tags, note: moodEntries.note, createdAt: moodEntries.createdAt })
    .from(moodEntries)
    .where(and(eq(moodEntries.childId, childId), gte(moodEntries.createdAt, new Date(Date.now() - WEEK))))
    .orderBy(asc(moodEntries.createdAt));
  // Same check-ins → same key → reuse the stored summary instead of calling the AI again.
  const key = rows.length ? `${rows.length}:${rows[0].id}:${rows[rows.length - 1].id}` : "empty";
  return { rows: rows.map((r) => ({ ...r, mood: r.mood as MoodKey })) as (SummaryEntry & { id: string })[], key };
}

/** The stored summary, and whether newer check-ins have arrived since. */
export const GET = handler(async (req) => {
  const { pid } = await requireParent(req);
  const db = await getDb();
  const child = await ownedChild(db, pid, req.nextUrl.searchParams.get("childId"));
  const [saved] = await db.select().from(summaries).where(eq(summaries.childId, child.id));
  const { rows, key } = await lastWeek(db, child.id);
  return NextResponse.json({
    summary: saved ? (saved.content as Summary) : null,
    createdAt: saved?.createdAt ?? null,
    fresh: saved?.sourceKey === key,
    entries: rows.length,
  });
});

/** Writes (or reuses) this week's summary. Only runs when the parent asks. */
export const POST = handler(async (req) => {
  const { pid } = await requireParent(req);
  const b = await body<{ childId: string; tzOffset: number }>(req);
  const db = await getDb();
  const child = await ownedChild(db, pid, b.childId);
  const { rows, key } = await lastWeek(db, child.id);
  if (!rows.length) return NextResponse.json({ summary: null, fresh: true, entries: 0 });

  const [saved] = await db.select().from(summaries).where(eq(summaries.childId, child.id));
  if (saved?.sourceKey === key && (saved.content as Summary).source === "ai") {
    return NextResponse.json({ summary: saved.content, createdAt: saved.createdAt, fresh: true, entries: rows.length });
  }

  const tz = Number.isFinite(b.tzOffset) ? Number(b.tzOffset) : 0;
  const summary = (await aiSummary(rows, tz)) ?? basicSummary(rows);
  const createdAt = new Date();
  await db
    .insert(summaries)
    .values({ childId: child.id, sourceKey: key, content: summary, createdAt })
    .onConflictDoUpdate({ target: summaries.childId, set: { sourceKey: key, content: summary, createdAt } });
  return NextResponse.json({ summary, createdAt, fresh: true, entries: rows.length });
});
