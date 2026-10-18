import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const parents = pgTable("parents", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  pinHash: text("pin_hash"),
  consentAt: timestamp("consent_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const children = pgTable("children", {
  id: uuid("id").primaryKey().defaultRandom(),
  parentId: uuid("parent_id")
    .notNull()
    .references(() => parents.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  color: text("color").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const moodEntries = pgTable("mood_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  childId: uuid("child_id")
    .notNull()
    .references(() => children.id, { onDelete: "cascade" }),
  mood: text("mood").notNull(),
  tags: text("tags").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Applied on first connection, so a fresh database needs no migration step. */
export const SCHEMA_SQL = [
  `create table if not exists parents (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    email text not null unique,
    password_hash text not null,
    pin_hash text,
    consent_at timestamptz not null,
    created_at timestamptz not null default now()
  )`,
  `create table if not exists children (
    id uuid primary key default gen_random_uuid(),
    parent_id uuid not null references parents(id) on delete cascade,
    name text not null,
    color text not null,
    created_at timestamptz not null default now()
  )`,
  `create table if not exists mood_entries (
    id uuid primary key default gen_random_uuid(),
    child_id uuid not null references children(id) on delete cascade,
    mood text not null,
    tags text[] not null default '{}',
    created_at timestamptz not null default now()
  )`,
  `create index if not exists mood_entries_child_created on mood_entries (child_id, created_at desc)`,
];
