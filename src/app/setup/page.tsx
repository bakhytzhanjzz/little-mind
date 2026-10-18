"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MoodFace } from "@/components/MoodFace";
import { PinPad } from "@/components/PinPad";
import { BackLink, FormError, Loading } from "@/components/ui";
import { api, rememberChild, type Child, type Me } from "@/lib/api";
import { CHILD_COLORS, COLOR_NAMES, type MoodKey } from "@/lib/moods";

type Step = "loading" | "child" | "pin" | "confirm";

/** First run: add a child, then set the parent PIN. Also used to add another child. */
export default function Setup() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("loading");
  const [me, setMe] = useState<Me | null>(null);
  const [color, setColor] = useState<MoodKey>("okay");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [firstPin, setFirstPin] = useState("");

  useEffect(() => {
    api<Me>("/api/me")
      .then((m) => {
        setMe(m);
        // Has a child but no PIN yet (setup was interrupted) → finish the PIN.
        setStep(m.children.length && !m.parent.hasPin ? "pin" : "child");
      })
      .catch(() => router.replace("/login"));
  }, [router]);

  const addChild = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { child } = await api<{ child: Child }>("/api/children", { body: { name, color } });
      rememberChild(child.id);
      if (me?.parent.hasPin) router.replace("/home");
      else {
        setBusy(false);
        setStep("pin");
      }
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  if (step === "loading")
    return (
      <main className="screen">
        <Loading />
      </main>
    );

  if (step === "pin" || step === "confirm")
    return (
      <main className="screen">
        <p className="eyebrow mt-4 text-center">Step 2 of 2</p>
        <div className="mt-8">
          {step === "pin" ? (
            <PinPad
              key="pin"
              title="Set a parent PIN"
              hint="You'll use it to leave Child mode, so the history stays with you."
              onComplete={async (pin) => {
                setFirstPin(pin);
                setStep("confirm");
              }}
            />
          ) : (
            <PinPad
              key="confirm"
              title="Enter the PIN again"
              hint="Just to be sure."
              onComplete={async (pin) => {
                if (pin !== firstPin) return "Those PINs don't match. Enter the same 4 digits again.";
                try {
                  await api("/api/pin", { method: "PUT", body: { pin } });
                  router.replace("/home");
                } catch (err) {
                  return (err as Error).message;
                }
              }}
            />
          )}
        </div>
        {step === "confirm" && (
          <button className="btn btn-text mt-6 self-center" onClick={() => setStep("pin")}>
            Start over
          </button>
        )}
      </main>
    );

  const first = !me?.children.length;
  return (
    <main className="screen">
      {first ? <p className="eyebrow mt-4">Step 1 of 2</p> : <BackLink href="/home">Home</BackLink>}
      <h1 className="mt-4 text-[30px] font-semibold tracking-tight">Who will be checking in?</h1>
      <p className="mt-2 text-[17px] text-ink-2">They&apos;ll use your phone in Child mode. No account needed.</p>

      <form onSubmit={addChild} className="mt-8 flex flex-1 flex-col gap-6">
        <div>
          <label htmlFor="name" className="label">
            Child&apos;s first name
          </label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={40}
            autoComplete="off"
            className="field"
          />
        </div>

        <fieldset>
          <legend className="label">Their color</legend>
          <div className="flex justify-between">
            {CHILD_COLORS.map((c) => (
              <label key={c} className="relative cursor-pointer">
                <input
                  type="radio"
                  name="color"
                  value={c}
                  checked={color === c}
                  onChange={() => setColor(c)}
                  className="peer sr-only"
                />
                <span className="sr-only">{COLOR_NAMES[c]}</span>
                <span className="block rounded-full p-1 ring-2 ring-transparent transition peer-checked:ring-ink peer-focus-visible:ring-ink-2">
                  <MoodFace mood="good" tint={c} size={52} />
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <FormError message={error} />
        <div className="mt-auto pt-6">
          <button className="btn btn-primary" disabled={busy || !name.trim()}>
            {busy ? "Adding…" : first ? "Continue" : "Add child"}
          </button>
        </div>
      </form>
    </main>
  );
}
