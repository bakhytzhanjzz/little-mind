"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BackLink, FormError } from "@/components/ui";
import { api } from "@/lib/api";

export default function Signup() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    try {
      await api("/api/auth/signup", {
        body: {
          name: f.get("name"),
          email: f.get("email"),
          password: f.get("password"),
          consent: f.get("consent") === "on",
        },
      });
      router.replace("/setup");
      setBusy(false);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  return (
    <main className="screen">
      <BackLink href="/" />
      <h1 className="mt-6 text-[30px] font-semibold tracking-tight">Create a parent account</h1>
      <p className="mt-2 text-[17px] text-ink-2">Check-ins are saved to this account. Only you can see them.</p>

      <form onSubmit={submit} className="mt-8 flex flex-1 flex-col gap-5">
        <div>
          <label htmlFor="name" className="label">
            Your first name
          </label>
          <input id="name" name="name" autoComplete="given-name" required maxLength={40} className="field" />
        </div>
        <div>
          <label htmlFor="email" className="label">
            Email
          </label>
          <input id="email" name="email" type="email" autoComplete="email" required className="field" />
        </div>
        <div>
          <label htmlFor="password" className="label">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className="field"
            aria-describedby="password-hint"
          />
          <p id="password-hint" className="mt-2 text-[13px] text-ink-2">
            At least 8 characters.
          </p>
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-surface p-4 ring-1 ring-line">
          <input name="consent" type="checkbox" required className="mt-0.5 size-5 shrink-0 accent-[var(--ink)]" />
          <span className="text-[15px] leading-snug text-ink-2">
            I&apos;m the parent or guardian, and I agree to Little Mind+ storing my child&apos;s check-ins on this
            account.
          </span>
        </label>

        <FormError message={error} />
        <div className="mt-auto flex flex-col gap-3 pt-6">
          <button className="btn btn-primary" disabled={busy}>
            {busy ? "Creating account…" : "Create account"}
          </button>
          <p className="text-center text-[15px] text-ink-2">
            Already have one?{" "}
            <Link href="/login" className="font-semibold text-ink underline underline-offset-4">
              Log in
            </Link>
          </p>
        </div>
      </form>
    </main>
  );
}
