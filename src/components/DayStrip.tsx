"use client";

import { useMemo, useState } from "react";
import type { Entry } from "@/lib/api";
import { dayKey, dayLabel, lastDays, timeLabel } from "@/lib/dates";
import { MOODS, MOOD_KEYS, moodColor, tagLabel } from "@/lib/moods";

const MAX_DOTS = 3;

/**
 * Last 14 days as columns of dots: one dot per check-in, oldest at the bottom.
 * Tap a day to read it.
 */
export function DayStrip({ entries, days = 14 }: { entries: Entry[]; days?: number }) {
  const cols = useMemo(() => {
    const byDay = new Map<string, Entry[]>();
    for (const e of entries) {
      const k = dayKey(new Date(e.createdAt));
      byDay.set(k, [...(byDay.get(k) ?? []), e]);
    }
    return lastDays(days).map((date) => ({
      date,
      key: dayKey(date),
      // API returns newest first; draw oldest at the bottom.
      entries: [...(byDay.get(dayKey(date)) ?? [])].reverse(),
    }));
  }, [entries, days]);

  const [selected, setSelected] = useState<string | null>(null);
  const sel = cols.find((c) => c.key === selected);

  return (
    <div>
      <div className="flex items-end justify-between" role="group" aria-label={`Check-ins over the last ${days} days`}>
        {cols.map((c, i) => {
          const isToday = i === cols.length - 1;
          const isSel = c.key === selected;
          const shown = c.entries.slice(-MAX_DOTS);
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => setSelected(isSel ? null : c.key)}
              aria-pressed={isSel}
              aria-label={`${dayLabel(c.date)}: ${
                c.entries.length ? c.entries.map((e) => MOODS[e.mood].label).join(", ") : "no check-in"
              }`}
              className={`group flex w-[min(7%,26px)] flex-col items-center gap-[3px] rounded-full pt-2 pb-1.5 transition-colors ${
                isSel ? "bg-line" : ""
              }`}
            >
              <span className="flex h-[38px] flex-col-reverse items-center gap-[3px]">
                {shown.length ? (
                  shown.map((e) => (
                    <span key={e.id} className="size-2.5 rounded-full" style={{ background: moodColor(e.mood) }} />
                  ))
                ) : (
                  <span className="size-2.5 rounded-full ring-[1.5px] ring-line ring-inset" />
                )}
              </span>
              <span
                className={`mt-1 text-[11px] leading-none tabular-nums ${
                  isToday ? "font-bold text-ink" : "text-ink-3"
                }`}
              >
                {c.date.toLocaleDateString("en-GB", { weekday: "narrow" })}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-3 min-h-10 text-[14px] leading-snug text-ink-2" aria-live="polite">
        {sel ? (
          <>
            <span className="font-semibold text-ink">{dayLabel(sel.date)}</span>
            {" · "}
            {sel.entries.length
              ? sel.entries
                  .map(
                    (e) =>
                      `${MOODS[e.mood].label} at ${timeLabel(new Date(e.createdAt))}${
                        e.tags.length ? ` (${e.tags.map(tagLabel).join(", ").toLowerCase()})` : ""
                      }`,
                  )
                  .join(" · ")
              : "No check-in"}
          </>
        ) : (
          "Tap a day to see its check-ins."
        )}
      </p>

      <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1.5" aria-label="Legend">
        {MOOD_KEYS.map((m) => (
          <li key={m} className="flex items-center gap-1.5 text-[13px] text-ink-2">
            <span className="size-2.5 rounded-full" style={{ background: moodColor(m) }} />
            {MOODS[m].label}
          </li>
        ))}
      </ul>
    </div>
  );
}
