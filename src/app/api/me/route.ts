import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { DEMO_EMAIL, getParent, listChildren } from "@/lib/data";
import { handler, requireParent } from "@/lib/http";

export const GET = handler(async (req) => {
  const { pid } = await requireParent(req);
  const db = await getDb();
  const parent = await getParent(db, pid);
  return NextResponse.json({
    parent: {
      name: parent.name,
      email: parent.email,
      hasPin: Boolean(parent.pinHash),
      isDemo: parent.email === DEMO_EMAIL,
    },
    children: await listChildren(db, pid),
  });
});
