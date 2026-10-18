import "server-only";
import { sql } from "drizzle-orm";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export type DB = NeonHttpDatabase<typeof schema>;

const g = globalThis as unknown as { __lmDb?: Promise<DB> };

/**
 * DATABASE_URL set (Vercel + Neon) → Neon over HTTP.
 * Not set (local dev) → embedded Postgres (PGlite) stored in ./.pglite.
 * Both speak the same Drizzle query API.
 */
export function getDb(): Promise<DB> {
  g.__lmDb ??= connect().catch((err) => {
    g.__lmDb = undefined;
    throw err;
  });
  return g.__lmDb;
}

async function connect(): Promise<DB> {
  let db: DB;
  const url = process.env.DATABASE_URL;
  if (url) {
    const { neon } = await import("@neondatabase/serverless");
    const { drizzle } = await import("drizzle-orm/neon-http");
    db = drizzle(neon(url), { schema });
  } else {
    const { PGlite } = await import("@electric-sql/pglite");
    const { drizzle } = await import("drizzle-orm/pglite");
    db = drizzle(new PGlite("./.pglite"), { schema }) as unknown as DB;
  }
  for (const stmt of schema.SCHEMA_SQL) await db.execute(sql.raw(stmt));
  return db;
}
