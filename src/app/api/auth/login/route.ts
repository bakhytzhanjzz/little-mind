import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { normalizeEmail, verify } from "@/lib/data";
import { body, fail, handler, withSession } from "@/lib/http";
import { parents } from "@/lib/schema";

export const POST = handler(async (req) => {
  const b = await body<{ email: string; password: string }>(req);
  const email = normalizeEmail(b.email);
  const db = await getDb();
  const [parent] = await db.select().from(parents).where(eq(parents.email, email));
  const ok = parent && typeof b.password === "string" && (await verify(b.password, parent.passwordHash));
  if (!ok) throw fail(401, "That email and password don't match. Check them and try again.");
  return withSession(NextResponse.json({ ok: true }), { pid: parent.id });
});
