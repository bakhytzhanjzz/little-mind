"use client";

import { useRouter } from "next/navigation";
import { Breathing } from "@/components/Breathing";
import { BackLink, Wash } from "@/components/ui";

export default function Breathe() {
  const router = useRouter();
  return (
    <main className="screen">
      <Wash mood="okay" strength={10} />
      <BackLink href="/home">Home</BackLink>
      <Breathing tint="okay" finishLabel="Back to Home" onFinish={() => router.push("/home")} />
    </main>
  );
}
