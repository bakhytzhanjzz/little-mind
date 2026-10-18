import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, readSession } from "@/lib/session";

const PUBLIC_ONLY = ["/", "/login", "/signup"];
const PARENT_ONLY = ["/home", "/history", "/setup"];

/**
 * Page-level routing by session state. The API routes enforce the same rules
 * on their own; this keeps people on the right screen.
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await readSession(req.cookies.get(SESSION_COOKIE)?.value);
  const go = (path: string) => NextResponse.redirect(new URL(path, req.url));

  if (PUBLIC_ONLY.includes(pathname)) {
    if (session) return go(session.child ? "/child" : "/home");
  } else if (PARENT_ONLY.includes(pathname)) {
    if (!session) return go("/login");
    if (session.child) return go("/child");
  } else if (pathname === "/child") {
    if (!session) return go("/login");
    if (!session.child) return go("/home");
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/signup", "/home", "/history", "/setup", "/child"],
};
