import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { DEMO_EMAIL, DEMO_PIN, hash } from "@/lib/data";
import { body, handler, withSession } from "@/lib/http";
import type { MoodKey, TagKey } from "@/lib/moods";
import { children, moodEntries, parents } from "@/lib/schema";

// Two weeks of believable check-ins: [days ago, local hour, mood, tags].
const SAMPLE: [number, number, MoodKey, TagKey[]][] = [
  [15, 18.4, "good", ["friends"]],
  [14, 17.9, "great", ["friends", "family"]],
  [13, 19.2, "okay", ["school"]],
  [12, 18.1, "good", []],
  [11, 20.3, "low", ["school", "sleep"]],
  [10, 18.6, "okay", ["school"]],
  [9, 17.5, "good", ["family"]],
  [8, 16.8, "great", ["friends"]],
  [7, 18.9, "good", []],
  [6, 19.6, "okay", ["sleep"]],
  [5, 8.2, "low", ["school"]],
  [5, 20.1, "okay", ["family"]],
  [4, 16.4, "upset", ["friends"]],
  [4, 20.5, "good", ["family"]],
  [3, 18.2, "okay", ["school"]],
  [2, 17.7, "good", ["friends"]],
  [1, 18.8, "great", ["family"]],
];

/**
 * Resets the shared demo account (parent "Dana", child "Aru") with sample data
 * and signs in. `tzOffset` is the browser's getTimezoneOffset(), so sample
 * times land at sensible local hours.
 */
export const POST = handler(async (req) => {
  const { tzOffset } = await body<{ tzOffset: number }>(req);
  const offsetMs = (Number.isFinite(tzOffset) ? Number(tzOffset) : 0) * 60_000;
  const db = await getDb();

  let [demo] = await db.select().from(parents).where(eq(parents.email, DEMO_EMAIL));
  if (!demo) {
    [demo] = await db
      .insert(parents)
      .values({
        name: "Dana",
        email: DEMO_EMAIL,
        passwordHash: await hash(crypto.randomUUID()),
        pinHash: await hash(DEMO_PIN),
        consentAt: new Date(),
      })
      .returning();
  } else {
    await db.update(parents).set({ pinHash: await hash(DEMO_PIN) }).where(eq(parents.id, demo.id));
  }
  await db.delete(children).where(eq(children.parentId, demo.id));
  const [child] = await db
    .insert(children)
    .values({ parentId: demo.id, name: "Aru", color: "okay" })
    .returning({ id: children.id });

  // Local midnight today, expressed in UTC.
  const now = Date.now();
  const localMidnight = Math.floor((now - offsetMs) / 86_400_000) * 86_400_000 + offsetMs;
  await db.insert(moodEntries).values(
    SAMPLE.map(([daysAgo, hour, mood, tags]) => ({
      childId: child.id,
      mood,
      tags,
      createdAt: new Date(localMidnight - daysAgo * 86_400_000 + hour * 3_600_000),
    })),
  );

  return withSession(NextResponse.json({ ok: true }), { pid: demo.id });
});
