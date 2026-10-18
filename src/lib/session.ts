import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "lm_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/**
 * `pid` is the signed-in parent. `child` is set while the phone is handed to a
 * child (Child mode): parent screens and mood history stay locked until the
 * parent PIN is entered.
 */
export type Session = { pid: string; child?: string };

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s && process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET is not set");
  }
  return new TextEncoder().encode(s ?? "little-mind-local-dev-secret-change-me");
}

export async function signSession(session: Session): Promise<string> {
  return new SignJWT({ ...session })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
}

export async function readSession(token: string | undefined): Promise<Session | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (typeof payload.pid !== "string") return null;
    return {
      pid: payload.pid,
      child: typeof payload.child === "string" ? payload.child : undefined,
    };
  } catch {
    return null;
  }
}

export const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE,
};
