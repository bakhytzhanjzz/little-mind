"use client";

import { useState } from "react";
import { CalmMenu, Exercise, type ExerciseKey } from "@/components/Calm";
import { BackLink, Wash } from "@/components/ui";

/** Calm corner for parents (and kids sitting with them). */
export default function Calm() {
  const [which, setWhich] = useState<ExerciseKey | null>(null);
  return (
    <main className="screen">
      <Wash mood="okay" strength={10} />
      {which ? (
        <>
          <button onClick={() => setWhich(null)} className="-ml-2 inline-flex h-11 items-center gap-1 self-start px-2 text-[15px] font-medium text-ink-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="m15 18-6-6 6-6" />
            </svg>
            Calm corner
          </button>
          <Exercise which={which} finishLabel="Back to the calm corner" onFinish={() => setWhich(null)} />
        </>
      ) : (
        <>
          <BackLink href="/home">Home</BackLink>
          <h1 className="font-display mt-4 text-[34px] leading-tight">Calm corner</h1>
          <p className="mt-2 mb-7 text-[17px] text-ink-2">Short exercises to do alone or together when feelings get big.</p>
          <CalmMenu onPick={setWhich} />
        </>
      )}
    </main>
  );
}
