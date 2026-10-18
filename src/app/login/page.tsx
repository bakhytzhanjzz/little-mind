"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BackLink, FormError } from "@/components/ui";
import { api } from "@/lib/api";

export default function Login() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    try {
      await api("/api/auth/login", { body: { email: f.get("email"), password: f.get("password") } });
      router.replace("/home");
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  return (
    <main className="screen">
      <BackLink href="/" />
      <h1 className="mt-6 text-[30px] font-semibold tracking-tight">Welcome back</h1>
      <p className="mt-2 text-[17px] text-ink-2">Log in to see check-ins and start a new one.</p>

      <form onSubmit={submit} className="mt-8 flex flex-1 flex-col gap-5">
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
          <input id="password" name="password" type="password" autoComplete="current-password" required className="field" />
        </div>
        <FormError message={error} />
        <div className="mt-auto flex flex-col gap-3 pt-6">
          <button className="btn btn-primary" disabled={busy}>
            {busy ? "Logging in…" : "Log in"}
          </button>
          <p className="text-center text-[15px] text-ink-2">
            New here?{" "}
            <Link href="/signup" className="font-semibold text-ink underline underline-offset-4">
              Create an account
            </Link>
          </p>
        </div>
      </form>
    </main>
  );
}
