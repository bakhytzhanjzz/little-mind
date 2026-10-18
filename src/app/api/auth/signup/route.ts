import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { DEMO_EMAIL, cleanName, hash, normalizeEmail } from "@/lib/data";
import { body, fail, handler, withSession } from "@/lib/http";
import { parents } from "@/lib/schema";

export const POST = handler(async (req) => {
  const b = await body<{ name: string; email: string; password: string; consent: boolean }>(req);
  const name = cleanName(b.name, "your name");
  const email = normalizeEmail(b.email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw fail(400, "Enter a valid email address.");
  if (email === DEMO_EMAIL) throw fail(400, "That email is reserved for the demo. Use your own.");
  if (typeof b.password !== "string" || b.password.length < 8)
    throw fail(400, "Use a password with at least 8 characters.");
  if (b.consent !== true) throw fail(400, "Tick the consent box to create an account.");

  const db = await getDb();
  const [existing] = await db.select({ id: parents.id }).from(parents).where(eq(parents.email, email));
  if (existing) throw fail(409, "An account with this email already exists. Log in instead.");

  const [parent] = await db
    .insert(parents)
    .values({ name, email, passwordHash: await hash(b.password), consentAt: new Date() })
    .returning({ id: parents.id });

  return withSession(NextResponse.json({ ok: true }), { pid: parent.id });
});
