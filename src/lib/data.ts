import "server-only";
import bcrypt from "bcryptjs";
import { and, asc, eq } from "drizzle-orm";
import type { DB } from "./db";
import { fail } from "./http";
import { CHILD_COLORS } from "./moods";
import { children, parents } from "./schema";

export const hash = (plain: string) => bcrypt.hash(plain, 10);
export const verify = (plain: string, hashed: string) => bcrypt.compare(plain, hashed);

export const normalizeEmail = (v: unknown) => (typeof v === "string" ? v.trim().toLowerCase() : "");

export function cleanName(v: unknown, what: string) {
  const name = typeof v === "string" ? v.trim().replace(/\s+/g, " ") : "";
  if (!name) throw fail(400, `Enter ${what}.`);
  if (name.length > 40) throw fail(400, `Keep ${what} under 40 characters.`);
  return name;
}

export function cleanColor(v: unknown) {
  return (CHILD_COLORS as readonly string[]).includes(v as string) ? (v as string) : CHILD_COLORS[1];
}

export function cleanPin(v: unknown) {
  if (typeof v !== "string" || !/^\d{4}$/.test(v)) throw fail(400, "The PIN must be 4 digits.");
  return v;
}

export async function getParent(db: DB, pid: string) {
  const [p] = await db.select().from(parents).where(eq(parents.id, pid));
  if (!p) throw fail(401, "Your session has ended. Log in again.");
  return p;
}

export async function ownedChild(db: DB, pid: string, childId: unknown) {
  if (typeof childId !== "string" || !/^[0-9a-f-]{36}$/i.test(childId)) throw fail(404, "Child not found.");
  const [c] = await db
    .select()
    .from(children)
    .where(and(eq(children.id, childId), eq(children.parentId, pid)));
  if (!c) throw fail(404, "Child not found.");
  return c;
}

export async function listChildren(db: DB, pid: string) {
  return db
    .select({ id: children.id, name: children.name, color: children.color })
    .from(children)
    .where(eq(children.parentId, pid))
    .orderBy(asc(children.createdAt));
}

export const DEMO_EMAIL = "demo@littlemind.app";
export const DEMO_PIN = "1234";
