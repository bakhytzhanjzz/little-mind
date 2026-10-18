import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { cleanPin, hash } from "@/lib/data";
import { body, handler, requireParent } from "@/lib/http";
import { parents } from "@/lib/schema";

export const PUT = handler(async (req) => {
  const { pid } = await requireParent(req);
  const pin = cleanPin((await body<{ pin: string }>(req)).pin);
  const db = await getDb();
  await db.update(parents).set({ pinHash: await hash(pin) }).where(eq(parents.id, pid));
  return NextResponse.json({ ok: true });
});
