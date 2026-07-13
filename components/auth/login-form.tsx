"use client";

import { ArrowRight, KeyRound, LockKeyhole, UserRound } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function LoginForm({ setupMode }: { setupMode: boolean }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(setupMode ? "Create your first manual user from Manual Users to enable login." : "");

  const signIn = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    if (!username.trim() || !password) {
      setStatus("Enter username and password.");
      return;
    }
    setLoading(true);
    setStatus("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setStatus(payload.message ?? "Unable to sign in.");
        return;
      }
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setStatus("Unable to reach login service.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-ink text-text lg:grid lg:grid-cols-[0.95fr_1.05fr]">
      <section className="relative hidden overflow-hidden border-r border-line/20 bg-panel lg:block">
        <Image src="/brand/globe-logo.png" alt="Globe by Namahmi Labs Pvt. Ltd." fill priority className="object-cover opacity-35" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(222,172,65,0.34),transparent_34%),linear-gradient(135deg,rgba(5,8,14,0.52),rgba(5,8,14,0.96))]" />
        <div className="absolute inset-x-10 bottom-10">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Namahmi Labs Pvt. Ltd.</p>
          <h1 className="mt-4 max-w-xl text-5xl font-semibold leading-tight">Internal lead operations, guarded by your manual team users.</h1>
          <p className="mt-5 max-w-lg text-base text-muted">Sign in with the username and password created from Manual Users. No external auth service required.</p>
        </div>
      </section>
      <section className="flex min-h-screen items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3">
            <Image className="rounded-lg border border-gold/40 object-cover" src="/brand/globe-logo.png" alt="Globe" width={58} height={58} priority />
            <div>
              <p className="text-2xl font-bold">Globe</p>
              <p className="text-sm text-muted">Powered by Namahmi Labs Pvt. Ltd.</p>
            </div>
          </div>
          <div className="rounded-lg border border-line/20 bg-panel/88 p-6 shadow-glow backdrop-blur-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">Team Login</p>
                <h2 className="mt-2 text-3xl font-semibold">Welcome back</h2>
              </div>
              <div className="rounded-md border border-line/20 bg-ink/50 p-3 text-gold">
                <LockKeyhole className="h-5 w-5" />
              </div>
            </div>
            <form onSubmit={signIn} className="mt-6 space-y-3">
              <label className="block">
                <span className="mb-2 block text-sm text-muted">Username</span>
                <span className="flex items-center gap-2 rounded-md border border-line/20 bg-ink px-3 py-2.5 focus-within:border-gold">
                  <UserRound className="h-4 w-4 text-muted" />
                  <input value={username} onChange={(event) => setUsername(event.target.value)} className="w-full bg-transparent outline-none" autoComplete="username" />
                </span>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-muted">Password</span>
                <span className="flex items-center gap-2 rounded-md border border-line/20 bg-ink px-3 py-2.5 focus-within:border-gold">
                  <KeyRound className="h-4 w-4 text-muted" />
                  <input value={password} onChange={(event) => setPassword(event.target.value)} className="w-full bg-transparent outline-none" type="password" autoComplete="current-password" />
                </span>
              </label>
              <button disabled={loading || setupMode} className="flex w-full items-center justify-center gap-2 rounded-md bg-gold px-4 py-3 font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50" type="submit">
                {loading ? "Signing in..." : "Sign In"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
            {setupMode && (
              <a href="/team" className="mt-3 flex w-full items-center justify-center rounded-md border border-line/20 px-4 py-3 text-sm text-text hover:bg-ink/40">
                Open Manual Users Setup
              </a>
            )}
            {status && <p className="mt-4 rounded-md border border-line/20 bg-ink/50 px-3 py-2 text-sm text-muted">{status}</p>}
          </div>
        </div>
      </section>
    </main>
  );
}
