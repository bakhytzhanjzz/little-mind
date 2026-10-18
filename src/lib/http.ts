import "server-only";
import { unstable_rethrow } from "next/navigation";
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, cookieOptions, readSession, signSession, type Session } from "./session";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export const fail = (status: number, message: string) => new HttpError(status, message);

/** Wraps a route handler so thrown HttpErrors become `{ error }` JSON responses. */
export function handler<Ctx>(fn: (req: NextRequest, ctx: Ctx) => Promise<Response>) {
  return async (req: NextRequest, ctx: Ctx) => {
    try {
      return await fn(req, ctx);
    } catch (err) {
      unstable_rethrow(err);
      if (err instanceof HttpError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      console.error(err);
      return NextResponse.json({ error: "Something went wrong on our side. Try again." }, { status: 500 });
    }
  };
}

export async function getSession(req: NextRequest) {
  return readSession(req.cookies.get(SESSION_COOKIE)?.value);
}

/** Any signed-in session, including Child mode. */
export async function requireSession(req: NextRequest): Promise<Session> {
  const s = await getSession(req);
  if (!s) throw fail(401, "Log in to continue.");
  return s;
}

/** Parent-only: refused while the phone is in Child mode. */
export async function requireParent(req: NextRequest): Promise<Session> {
  const s = await requireSession(req);
  if (s.child) throw fail(403, "Enter the parent PIN to leave Child mode first.");
  return s;
}

export async function body<T>(req: NextRequest): Promise<Partial<T>> {
  try {
    return (await req.json()) as Partial<T>;
  } catch {
    throw fail(400, "Request body must be JSON.");
  }
}

export async function withSession(res: NextResponse, session: Session) {
  res.cookies.set(SESSION_COOKIE, await signSession(session), cookieOptions);
  return res;
}

export function clearSession(res: NextResponse) {
  res.cookies.set(SESSION_COOKIE, "", { ...cookieOptions, maxAge: 0 });
  return res;
}
