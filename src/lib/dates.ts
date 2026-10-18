/** Local-calendar day key, e.g. "2026-10-18". */
export function dayKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** The last `n` local days, oldest first, ending today. */
export function lastDays(n: number): Date[] {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (n - 1 - i));
    return d;
  });
}

export function dayLabel(d: Date) {
  const key = dayKey(d);
  const [today, yesterday] = lastDays(2).reverse().map(dayKey);
  if (key === today) return "Today";
  if (key === yesterday) return "Yesterday";
  return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" });
}

export const timeLabel = (d: Date) =>
  d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

export function groupByDay<T extends { createdAt: string }>(items: T[]) {
  const groups = new Map<string, { date: Date; items: T[] }>();
  for (const item of items) {
    const date = new Date(item.createdAt);
    const key = dayKey(date);
    if (!groups.has(key)) groups.set(key, { date, items: [] });
    groups.get(key)!.items.push(item);
  }
  return [...groups.values()];
}

/** "today at 18:40", "yesterday at 09:05", "on Mon 12 Oct at 18:40" */
export function whenLabel(d: Date) {
  const day = dayLabel(d);
  const on =
    day === "Today" || day === "Yesterday"
      ? day.toLowerCase()
      : `on ${d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}`;
  return `${on} at ${timeLabel(d)}`;
}
