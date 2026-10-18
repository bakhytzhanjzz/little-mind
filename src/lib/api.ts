import type { MoodKey } from "./moods";

export type Child = { id: string; name: string; color: MoodKey };
export type Me = {
  parent: { name: string; email: string; hasPin: boolean; isDemo: boolean };
  children: Child[];
};
export type Entry = { id: string; mood: MoodKey; tags: string[]; createdAt: string };

/** JSON fetch against our API. Throws an Error carrying the server's message. */
export async function api<T = { ok: true }>(
  path: string,
  init?: { method?: string; body?: unknown },
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      method: init?.method ?? (init?.body ? "POST" : "GET"),
      headers: init?.body ? { "Content-Type": "application/json" } : undefined,
      body: init?.body ? JSON.stringify(init.body) : undefined,
      cache: "no-store",
    });
  } catch {
    throw new Error("You seem to be offline. Check your connection and try again.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error ?? "Something went wrong. Try again.") as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return data as T;
}

const CHILD_KEY = "lm:selectedChild";

export function rememberChild(id: string) {
  try {
    localStorage.setItem(CHILD_KEY, id);
  } catch {}
}

export function pickChild(children: Child[]): Child | undefined {
  let saved: string | null = null;
  try {
    saved = localStorage.getItem(CHILD_KEY);
  } catch {}
  return children.find((c) => c.id === saved) ?? children[0];
}
