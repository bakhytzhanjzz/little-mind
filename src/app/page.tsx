"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MoodFace } from "@/components/MoodFace";
import { FormError, Wash, Wordmark } from "@/components/ui";
import { api } from "@/lib/api";
import { MOODS, MOOD_KEYS } from "@/lib/moods";

export default function Welcome() {
  const router = useRouter();
  const [i, setI] = useState(1);
  const [demoBusy, setDemoBusy] = useState(false);
  const [error, setError] = useState("");
  const mood = MOOD_KEYS[i];

  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % MOOD_KEYS.length), 2400);
    return () => clearInterval(id);
  }, []);

  const tryDemo = async () => {
    setDemoBusy(true);
    setError("");
    try {
      await api("/api/demo", { body: { tzOffset: new Date().getTimezoneOffset() } });
      router.replace("/home");
    } catch (e) {
      setError((e as Error).message);
      setDemoBusy(false);
    }
  };

  return (
    <main className="screen">
      <Wash mood={mood} strength={12} />
      <header className="flex h-11 items-center">
        <Wordmark />
      </header>

      <section className="flex flex-1 flex-col items-center justify-center py-6 text-center">
        <MoodFace mood={mood} size={220} />
        <p className="font-display mt-3 h-8 text-[22px] text-ink-2" aria-hidden>
          {MOODS[mood].label}
        </p>
        <h1 className="font-display mt-6 text-[34px] leading-[1.1] text-balance">
          A small daily check&#8209;in for big feelings
        </h1>
        <p className="mt-4 max-w-[34ch] text-[17px] leading-relaxed text-ink-2 text-pretty">
          Your child picks how they feel in under two minutes. You see how their week is going, privately, on your
          phone.
        </p>
      </section>

      <div className="flex flex-col gap-3">
        <Link href="/signup" className="btn btn-primary">
          Create a parent account
        </Link>
        <Link href="/login" className="btn btn-quiet">
          Log in
        </Link>
        <button className="btn btn-text self-center" onClick={tryDemo} disabled={demoBusy}>
          {demoBusy ? "Opening the demo…" : "Try a demo with sample data"}
        </button>
        <FormError message={error} />
        <p className="mt-2 text-center text-[13px] leading-snug text-ink-2">
          Little Mind+ helps families talk about feelings. It isn&apos;t a medical or diagnostic tool.
        </p>
      </div>
    </main>
  );
}
