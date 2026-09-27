"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { signInWithGoogle, signInWithPassword, signUpWithPassword } from "@/lib/auth";
import { bindAuthToStore } from "@/lib/storage";
import { useWorkoutStore } from "@/lib/use-workout-store";

const SCHEMA_SQL = `create table if not exists public.workouts (
  user_id uuid not null references auth.users (id) on delete cascade,
  id text not null,
  date date not null,
  created_at timestamptz not null default timezone('utc', now()),
  type text not null,
  completed boolean not null default false,
  exercises jsonb not null default '[]'::jsonb,
  primary key (user_id, id)
);

create index if not exists workouts_user_date_idx
  on public.workouts (user_id, date desc, created_at desc);

alter table public.workouts enable row level security;

drop policy if exists "Users manage their own workouts" on public.workouts;

create policy "Users manage their own workouts"
  on public.workouts
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);`;

export function AuthGate({ children }: { children: ReactNode }) {
  const store = useWorkoutStore();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    return bindAuthToStore();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const error =
      params.get("error_description") ??
      params.get("error") ??
      hash.get("error_description") ??
      hash.get("error");
    if (error) setMessage(error.replace(/\+/g, " "));
  }, []);

  async function startGoogle() {
    setMessage(null);
    setPending(true);
    const { error } = await signInWithGoogle();
    setPending(false);
    if (error) setMessage(error.message);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setMessage(null);
    setPending(true);
    const action = mode === "signin" ? signInWithPassword : signUpWithPassword;
    const { data, error } = await action(email.trim(), password);
    setPending(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    if (mode === "signup" && data.user && !data.session) {
      setMessage("Check your email to confirm the account, then sign in.");
    }
  }

  if (!store.ready && !store.userId) {
    return (
      <div className="flex flex-1 flex-col">
        <PageHeader title="Workout" />
        <p className="px-4 py-6 text-sm text-zinc-500">Loading…</p>
      </div>
    );
  }

  if (!store.userId) {
    return (
      <div className="flex flex-1 flex-col">
        <PageHeader title="Workout" />
        <main className="flex flex-col gap-4 px-4 py-5">
          <p className="text-sm text-zinc-500">
            Sign in to save workouts to your account.
          </p>
          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="w-full"
            disabled={pending}
            onClick={() => void startGoogle()}
          >
            Continue with Google
          </Button>
          <p className="text-center text-xs font-medium uppercase tracking-wide text-zinc-400">
            or email
          </p>
          <form className="flex flex-col gap-3" onSubmit={submit}>
            <label className="flex flex-col gap-1 text-sm font-medium">
              Email
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-12 rounded-xl border border-zinc-200 bg-white px-3 text-base dark:border-zinc-700 dark:bg-zinc-900"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium">
              Password
              <input
                type="password"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                required
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-12 rounded-xl border border-zinc-200 bg-white px-3 text-base dark:border-zinc-700 dark:bg-zinc-900"
              />
            </label>
            {message ? (
              <p className="text-sm font-medium text-red-600" role="alert">
                {message}
              </p>
            ) : null}
            <Button type="submit" size="lg" className="w-full" disabled={pending}>
              {mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>
          <button
            type="button"
            className="h-12 text-sm font-medium text-zinc-500"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setMessage(null);
            }}
          >
            {mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
          </button>
        </main>
      </div>
    );
  }

  if (store.setupNeeded) {
    return (
      <div className="flex flex-1 flex-col">
        <PageHeader title="Workout" />
        <main className="flex flex-col gap-3 px-4 py-5">
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            The workouts table is missing. In Supabase open SQL Editor, paste this, run it, then
            refresh.
          </p>
          <pre className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white p-3 text-xs dark:border-zinc-800 dark:bg-zinc-900">
            {SCHEMA_SQL}
          </pre>
          <Button
            variant="secondary"
            className="w-full"
            onClick={async () => {
              await navigator.clipboard.writeText(SCHEMA_SQL);
              setCopied(true);
            }}
          >
            {copied ? "Copied" : "Copy SQL"}
          </Button>
        </main>
      </div>
    );
  }

  return <>{children}</>;
}
