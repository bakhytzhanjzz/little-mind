"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { DayStrip } from "@/components/DayStrip";
import { InstallHint } from "@/components/InstallHint";
import { MoodFace } from "@/components/MoodFace";
import { WeeklySummary } from "@/components/WeeklySummary";
import { FormError, Loading, Wordmark } from "@/components/ui";
import { api, pickChild, rememberChild, type Child, type Entry, type Me } from "@/lib/api";
import { whenLabel } from "@/lib/dates";
import { MOODS } from "@/lib/moods";
import { needsAdultAttention } from "@/lib/safety";

function greeting() {
  const h = new Date().getHours();
  return h < 5 ? "Good night" : h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

export default function Home() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [child, setChild] = useState<Child | undefined>();
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [hello, setHello] = useState("Hello");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const onAuthError = useCallback(
    (err: Error & { status?: number }) => {
      if (err.status === 401) router.replace("/login");
      else if (err.status === 403) router.replace("/child");
      else setError(err.message);
    },
    [router],
  );

  useEffect(() => {
    // Time of day is only known in the browser.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHello(greeting());
    api<Me>("/api/me")
      .then((m) => {
        if (!m.children.length) return router.replace("/setup");
        setMe(m);
        setChild(pickChild(m.children));
      })
      .catch(onAuthError);
  }, [router, onAuthError]);

  useEffect(() => {
    if (!child) return;
    api<{ entries: Entry[] }>(`/api/moods?childId=${child.id}&days=14`)
      .then((r) => setEntries(r.entries))
      .catch(onAuthError);
  }, [child, onAuthError]);

  const choose = (c: Child) => {
    rememberChild(c.id);
    setEntries(null);
    setChild(c);
  };

  const startChildMode = async () => {
    if (!child) return;
    setBusy(true);
    setError("");
    try {
      await api("/api/child-mode", { body: { childId: child.id } });
      router.replace("/child");
      setBusy(false);
    } catch (err) {
      const e = err as Error & { status?: number };
      if (e.status === 409 && !me?.parent.hasPin) return router.replace("/setup");
      setError(e.message);
      setBusy(false);
    }
  };

  const logOut = async () => {
    await api("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.replace("/");
  };

  if (!me || !child)
    return (
      <main className="screen">
        <Loading />
        <FormError message={error} />
      </main>
    );

  const last = entries?.[0];
  const concern = entries?.find((e) => needsAdultAttention(e.note));

  return (
    <main className="screen gap-8">
      <header className="flex h-11 items-center justify-between">
        <Wordmark />
        <button onClick={logOut} className="btn btn-text -mr-3">
          Log out
        </button>
      </header>

      <section>
        <h1 className="text-[28px] font-semibold tracking-tight">
          {hello}, {me.parent.name}
        </h1>
        {me.children.length > 1 && (
          <div className="-mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-1" role="radiogroup" aria-label="Child">
            {me.children.map((c) => (
              <button
                key={c.id}
                role="radio"
                aria-checked={c.id === child.id}
                onClick={() => choose(c)}
                className={`flex h-10 shrink-0 items-center gap-2 rounded-full pr-4 pl-1.5 text-[15px] font-medium transition-colors ${
                  c.id === child.id ? "bg-ink text-bg" : "bg-surface text-ink ring-1 ring-line"
                }`}
              >
                <MoodFace mood="good" tint={c.color} size={28} />
                {c.name}
              </button>
            ))}
          </div>
        )}
      </section>

      {concern && (
        <section className="rounded-3xl p-5 ring-2 ring-danger" role="alert">
          <h2 className="text-[17px] font-semibold">A note needs your attention</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-2">
            {whenLabel(new Date(concern.createdAt)).replace(/^\w/, (c) => c.toUpperCase())}, {child.name} wrote something
            about hurting themself or not wanting to live. Please talk with {child.name} today, calmly and without
            judgement, and contact the school psychologist or a doctor. If {child.name} is in danger right now, call 112.
          </p>
          <Link href="/history" className="mt-3 inline-block text-[15px] font-semibold underline underline-offset-4">
            Read the note
          </Link>
        </section>
      )}

      <section className="card flex flex-col items-center px-6 pt-8 pb-6 text-center">
        <MoodFace mood={last?.mood ?? "good"} tint={last ? undefined : child.color} size={120} />
        <p className="mt-4 text-[17px] text-ink-2" aria-live="polite">
          {entries === null ? (
            " "
          ) : last ? (
            <>
              {child.name} felt <span className="font-semibold text-ink">{MOODS[last.mood].label.toLowerCase()}</span>{" "}
              {whenLabel(new Date(last.createdAt))}
            </>
          ) : (
            <>No check-ins from {child.name} yet</>
          )}
        </p>
        <button className="btn btn-primary mt-6" onClick={startChildMode} disabled={busy}>
          {busy ? "Starting…" : `Hand the phone to ${child.name}`}
        </button>
        <p className="mt-3 text-[13px] text-ink-2">Parent screens lock until you enter your PIN.</p>
        {me.parent.isDemo && (
          <p className="mt-1 text-[13px] font-semibold text-ink">Demo account · the PIN is 1234</p>
        )}
        <div className="mt-2 w-full">
          <FormError message={error} />
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="eyebrow">Last 14 days</h2>
          <Link href="/history" className="text-[15px] font-semibold underline-offset-4 hover:underline">
            Full history
          </Link>
        </div>
        {entries ? <DayStrip entries={entries} /> : <div className="h-[120px]" />}
      </section>

      <section>
        <h2 className="eyebrow mb-4">This week</h2>
        <WeeklySummary child={child} refreshKey={entries?.[0]?.id ?? ""} />
      </section>

      <section className="flex flex-col gap-3">
        <Link href="/calm" className="card flex items-center gap-4 p-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-bg">
            <MoodFace mood="good" tint="okay" size={34} />
          </span>
          <span className="flex-1">
            <span className="block text-[16px] font-semibold">Calm corner</span>
            <span className="block text-[14px] text-ink-2">Breathing, grounding and squeeze-and-let-go</span>
          </span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ink-3" aria-hidden>
            <path d="m9 18 6-6-6-6" />
          </svg>
        </Link>
        <InstallHint />
        <Link href="/setup" className="btn btn-text self-center">
          Add another child
        </Link>
      </section>
    </main>
  );
}
