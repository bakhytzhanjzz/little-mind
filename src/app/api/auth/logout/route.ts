import { NextResponse } from "next/server";
import { clearSession, handler, requireParent } from "@/lib/http";

export const POST = handler(async (req) => {
  await requireParent(req);
  return clearSession(NextResponse.json({ ok: true }));
});
