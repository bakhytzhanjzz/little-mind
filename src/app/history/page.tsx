"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MoodFace } from "@/components/MoodFace";
import { BackLink, FormError, Loading } from "@/components/ui";
import { api, pickChild, type Child, type Entry, type Me } from "@/lib/api";
import { dayLabel, groupByDay, timeLabel } from "@/lib/dates";
import { MOODS, tagLabel } from "@/lib/moods";

const DAYS = 90;

export default function History() {
  const router = useRouter();
  const [child, setChild] = useState<Child | undefined>();
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const me = await api<Me>("/api/me");
        const c = pickChild(me.children);
        if (!c) return router.replace("/setup");
        setChild(c);
        setEntries((await api<{ entries: Entry[] }>(`/api/moods?childId=${c.id}&days=${DAYS}`)).entries);
      } catch (err) {
        const e = err as Error & { status?: number };
        if (e.status === 401) router.replace("/login");
        else if (e.status === 403) router.replace("/child");
        else setError(e.message);
      }
    })();
  }, [router]);

  return (
    <main className="screen">
      <BackLink href="/home">Home</BackLink>
      <h1 className="mt-4 text-[30px] font-semibold tracking-tight">{child ? `${child.name}'s check-ins` : "Check-ins"}</h1>
      <p className="mt-1 text-[15px] text-ink-2">Last {DAYS} days · only visible to you</p>
      <FormError message={error} />

      {entries === null ? (
        !error && <Loading />
      ) : entries.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <MoodFace mood={null} size={96} />
          <p className="mt-5 max-w-[30ch] text-[17px] text-ink-2">
            No check-ins yet. Hand the phone to {child?.name} from Home to record the first one.
          </p>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-7">
          {groupByDay(entries).map((g) => (
            <section key={g.date.toISOString()}>
              <h2 className="eyebrow mb-2">{dayLabel(g.date)}</h2>
              <ul className="card divide-y divide-line">
                {g.items.map((e) => (
                  <li key={e.id} className="px-4 py-3">
                    <div className="flex items-center gap-3.5">
                      <MoodFace mood={e.mood} size={40} />
                      <div className="min-w-0 flex-1">
                        <p className="text-[16px] font-semibold">{MOODS[e.mood].label}</p>
                        <p className="truncate text-[14px] text-ink-2">
                          {e.tags.length ? e.tags.map(tagLabel).join(" · ") : "No topic picked"}
                        </p>
                      </div>
                      <time className="text-[14px] text-ink-2 tabular-nums" dateTime={e.createdAt}>
                        {timeLabel(new Date(e.createdAt))}
                      </time>
                    </div>
                    {e.note && (
                      <p className="font-display mt-2.5 ml-[54px] rounded-2xl bg-bg px-3.5 py-2.5 text-[16px] leading-snug whitespace-pre-line text-ink">
                        {e.note}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
