import { NextResponse } from "next/server";
import { and, desc, eq, gte } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { ownedChild } from "@/lib/data";
import { body, fail, handler, requireParent, requireSession } from "@/lib/http";
import { TAG_KEYS, isMood } from "@/lib/moods";
import { moodEntries } from "@/lib/schema";

/** Mood history — parent only, and only for their own children. */
export const GET = handler(async (req) => {
  const { pid } = await requireParent(req);
  const params = req.nextUrl.searchParams;
  const days = Math.min(Math.max(Number(params.get("days")) || 60, 1), 365);
  const db = await getDb();
  const child = await ownedChild(db, pid, params.get("childId"));
  const since = new Date(Date.now() - days * 86_400_000);
  const entries = await db
    .select({ id: moodEntries.id, mood: moodEntries.mood, tags: moodEntries.tags, createdAt: moodEntries.createdAt })
    .from(moodEntries)
    .where(and(eq(moodEntries.childId, child.id), gte(moodEntries.createdAt, since)))
    .orderBy(desc(moodEntries.createdAt));
  return NextResponse.json({ entries });
});

/** A check-in — recorded for the child whose Child mode is on. */
export const POST = handler(async (req) => {
  const s = await requireSession(req);
  if (!s.child) throw fail(409, "Start Child mode to record a check-in.");
  const b = await body<{ mood: string; tags: string[] }>(req);
  if (!isMood(b.mood)) throw fail(400, "Pick a mood.");
  const tags = Array.isArray(b.tags) ? [...new Set(b.tags.filter((t) => TAG_KEYS.includes(t)))] : [];
  const db = await getDb();
  const child = await ownedChild(db, s.pid, s.child);
  const [entry] = await db
    .insert(moodEntries)
    .values({ childId: child.id, mood: b.mood, tags })
    .returning({ id: moodEntries.id });
  return NextResponse.json({ entry });
});
