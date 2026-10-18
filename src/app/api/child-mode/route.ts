import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getParent, ownedChild } from "@/lib/data";
import { body, fail, handler, requireParent, requireSession, withSession } from "@/lib/http";

/** The child currently checking in (Child mode only). */
export const GET = handler(async (req) => {
  const s = await requireSession(req);
  if (!s.child) throw fail(409, "Child mode is not on.");
  const db = await getDb();
  const c = await ownedChild(db, s.pid, s.child);
  return NextResponse.json({ child: { id: c.id, name: c.name, color: c.color } });
});

/** Hand the phone to a child: locks parent screens until the PIN is entered. */
export const POST = handler(async (req) => {
  const { pid } = await requireParent(req);
  const { childId } = await body<{ childId: string }>(req);
  const db = await getDb();
  const child = await ownedChild(db, pid, childId);
  if (!(await getParent(db, pid)).pinHash) throw fail(409, "Set a parent PIN before starting Child mode.");
  return withSession(NextResponse.json({ ok: true }), { pid, child: child.id });
});
