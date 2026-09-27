"use client";

import { useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { getExerciseById } from "@/lib/exercises";
import { useWorkoutStore } from "@/lib/use-workout-store";
import { formatSets, formatShortDate, getExerciseHistory } from "@/lib/workout-utils";

export function ExerciseHistory({ id }: { id: string }) {
  const store = useWorkoutStore();
  const exercise = getExerciseById(id);
  const entries = store.ready ? getExerciseHistory(store.workouts, id) : [];

  useEffect(() => {
    document.title = exercise ? `${exercise.name} · Workout` : "Exercise · Workout";
  }, [exercise]);

  if (!exercise) {
    return (
      <div>
        <PageHeader title="Exercise" backHref="/exercises" backLabel="Exercises" />
        <p className="px-4 py-6 text-sm text-zinc-500">Exercise not found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader title={exercise.name} backHref="/exercises" backLabel="Exercises" />
      <main className="flex flex-col gap-3 px-4 py-5">
        {!store.ready ? (
          <p className="text-sm text-zinc-500">Loading…</p>
        ) : entries.length === 0 ? (
          <p className="text-sm text-zinc-500">No completed sets yet.</p>
        ) : (
          entries.map((entry) => (
            <Link
              key={entry.workoutId}
              href={`/history/${entry.workoutId}`}
              className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 active:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:active:bg-zinc-800"
            >
              <p className="text-sm font-medium text-zinc-500">{formatShortDate(entry.date)}</p>
              <p className="mt-1 font-mono text-sm text-zinc-800 dark:text-zinc-100">
                {formatSets(entry.sets, " / ")}
              </p>
            </Link>
          ))
        )}
      </main>
    </div>
  );
}
