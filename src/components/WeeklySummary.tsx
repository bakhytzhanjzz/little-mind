"use client";

import { useEffect, useState } from "react";
import { api, type Child } from "@/lib/api";
import { FormError } from "./ui";

type Summary = { source: "ai" | "basic"; summary: string; starters: string[]; nextStep: string; days: number };
type Res = { summary: Summary | null; fresh: boolean; entries: number };

/** The AI writes about "your child"; names never leave the app, so put it back here. */
const named = (text: string, name: string) =>
  text.replace(/\b(Y|y)our child\b/g, name).replace(/\b(Y|y)our child's\b/g, `${name}'s`);

/**
 * "This week" card: a summary of the last 7 days plus conversation starters.
 * Nothing is sent to the AI until the parent taps the button.
 */
export function WeeklySummary({ child, refreshKey }: { child: Child; refreshKey: string }) {
  const [res, setRes] = useState<Res | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let live = true;
    api<Res>(`/api/summary?childId=${child.id}`)
      .then((r) => live && setRes(r))
      .catch(() => live && setRes({ summary: null, fresh: false, entries: 0 }));
    return () => {
      live = false;
    };
  }, [child.id, refreshKey]);

  const write = async () => {
    setBusy(true);
    setError("");
    try {
      setRes(await api<Res>("/api/summary", { body: { childId: child.id, tzOffset: new Date().getTimezoneOffset() } }));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (!res) return <div className="card h-[150px]" />;

  const s = res.summary;
  if (!res.entries)
    return (
      <div className="card p-5 text-[15px] text-ink-2">
        No check-ins in the last 7 days yet. A summary appears here once {child.name} has checked in.
      </div>
    );

  return (
    <div className="card p-5">
      {s ? (
        <>
          <p className="text-[17px] leading-relaxed">{named(s.summary, child.name)}</p>
          <h3 className="eyebrow mt-5 mb-2.5">Try asking</h3>
          <ul className="flex flex-col gap-2">
            {s.starters.map((q) => (
              <li key={q} className="font-display rounded-2xl bg-bg px-4 py-3 text-[17px] leading-snug">
                “{named(q, child.name)}”
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-2">{named(s.nextStep, child.name)}</p>
          <p className="mt-4 border-t border-line pt-3 text-[13px] leading-snug text-ink-2">
            {s.source === "ai"
              ? `Written by AI from ${child.name}'s last 7 days. It can be wrong, and you know ${child.name} best.`
              : "Made from simple counts of the last 7 days."}
          </p>
          {!res.fresh && (
            <button className="btn btn-quiet mt-4 h-12 text-[15px]" onClick={write} disabled={busy}>
              {busy ? "Updating…" : "Update with new check-ins"}
            </button>
          )}
        </>
      ) : (
        <>
          <p className="text-[17px] leading-relaxed">
            Get a short read on {child.name}&apos;s week and three questions to start a conversation.
          </p>
          <p className="mt-2 text-[13px] leading-snug text-ink-2">
            To write it, the last 7 days of moods, topics and notes are sent to an AI service (Groq). {child.name}&apos;s
            name isn&apos;t sent.
          </p>
          <button className="btn btn-primary mt-4 h-12 text-[15px]" onClick={write} disabled={busy}>
            {busy ? "Writing…" : "Write this week's summary"}
          </button>
        </>
      )}
      <div className="mt-2">
        <FormError message={error} />
      </div>
    </div>
  );
}
