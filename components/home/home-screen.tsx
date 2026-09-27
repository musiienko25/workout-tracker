"use client";

import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { WORKOUT_TYPE_META } from "@/lib/exercises";
import { useWorkoutStore } from "@/lib/use-workout-store";
import {
  compareWorkoutsNewest,
  formatShortDate,
  getLatestCompletedWorkout,
} from "@/lib/workout-utils";

export function HomeScreen() {
  const store = useWorkoutStore();
  const latest = store.ready ? getLatestCompletedWorkout(store.workouts) : null;
  const drafts = store.ready ? [...store.drafts].sort(compareWorkoutsNewest) : [];

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader title="Workout" />
      <main className="flex flex-1 flex-col gap-4 px-4 py-5">
        {!store.ready ? (
          <p className="text-sm text-zinc-500">Loading…</p>
        ) : (
          <>
            {latest ? (
              <Link
                href={`/history/${latest.id}`}
                className="flex flex-col items-start gap-1 rounded-2xl border border-zinc-200 bg-white px-4 py-4 active:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:active:bg-zinc-800"
              >
                <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Last workout
                </span>
                <span className="text-base font-semibold">
                  {WORKOUT_TYPE_META[latest.type].label} — {formatShortDate(latest.date)}
                </span>
              </Link>
            ) : (
              <p className="rounded-2xl border border-dashed border-zinc-300 px-4 py-4 text-sm text-zinc-500 dark:border-zinc-700">
                No workouts yet.
              </p>
            )}

            <ButtonLink href="/workout" size="lg" className="w-full">
              Start Workout
            </ButtonLink>

            {drafts.length > 0 ? (
              <div className="flex flex-col gap-2">
                {drafts.map((draft) => (
                  <ButtonLink
                    key={draft.id}
                    href={`/workout/${draft.id}`}
                    variant="secondary"
                    className="w-full"
                  >
                    Continue {WORKOUT_TYPE_META[draft.type].label}
                  </ButtonLink>
                ))}
              </div>
            ) : null}

            <div className="mt-2 flex flex-col gap-2">
              <ButtonLink href="/history" variant="secondary" className="w-full">
                Workout History
              </ButtonLink>
              <ButtonLink href="/exercises" variant="secondary" className="w-full">
                Exercises
              </ButtonLink>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
