import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { cleanColor, cleanName, listChildren } from "@/lib/data";
import { body, fail, handler, requireParent } from "@/lib/http";
import { children } from "@/lib/schema";

export const POST = handler(async (req) => {
  const { pid } = await requireParent(req);
  const b = await body<{ name: string; color: string }>(req);
  const name = cleanName(b.name, "your child's name");
  const db = await getDb();
  if ((await listChildren(db, pid)).length >= 6) throw fail(400, "You can add up to 6 children.");
  const [child] = await db
    .insert(children)
    .values({ parentId: pid, name, color: cleanColor(b.color) })
    .returning({ id: children.id, name: children.name, color: children.color });
  return NextResponse.json({ child });
});
