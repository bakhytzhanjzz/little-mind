import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getParent, verify } from "@/lib/data";
import { body, fail, handler, requireSession, withSession } from "@/lib/http";

export const POST = handler(async (req) => {
  const { pid } = await requireSession(req);
  const { pin } = await body<{ pin: string }>(req);
  const db = await getDb();
  const parent = await getParent(db, pid);
  const ok = parent.pinHash && typeof pin === "string" && (await verify(pin, parent.pinHash));
  if (!ok) throw fail(403, "That PIN isn't right. Try again.");
  return withSession(NextResponse.json({ ok: true }), { pid });
});
