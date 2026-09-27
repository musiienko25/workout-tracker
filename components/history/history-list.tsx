"use client";

import { useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { ExerciseName } from "@/components/exercises/exercise-name";
import { WORKOUT_TYPE_META } from "@/lib/exercises";
import { useWorkoutStore } from "@/lib/use-workout-store";
import { formatSet, groupWorkoutsByDate, listCompletedWorkouts } from "@/lib/workout-utils";

export function HistoryList() {
  const store = useWorkoutStore();
  const groups = store.ready ? groupWorkoutsByDate(listCompletedWorkouts(store.workouts)) : [];

  useEffect(() => {
    document.title = "History · Workout";
  }, []);

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader title="History" backHref="/" backLabel="Home" />
      <main className="flex flex-col gap-6 px-4 py-5">
        {!store.ready ? (
          <p className="text-sm text-zinc-500">Loading…</p>
        ) : groups.length === 0 ? (
          <p className="text-sm text-zinc-500">No completed workouts yet.</p>
        ) : (
          groups.map((group) => (
            <section key={group.date} className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold text-zinc-500">{group.label}</h2>
              {group.workouts.map((workout) => (
                <Link
                  key={workout.id}
                  href={`/history/${workout.id}`}
                  className="rounded-2xl border border-zinc-200 bg-white p-4 active:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:active:bg-zinc-800"
                >
                  <p className="text-base font-semibold">
                    {WORKOUT_TYPE_META[workout.type].label}
                  </p>
                  <ul className="mt-3 flex flex-col gap-3">
                    {workout.exercises.map((exercise) => (
                      <li key={exercise.exerciseId}>
                        <ExerciseName
                          id={exercise.exerciseId}
                          titleClassName="text-sm font-medium"
                        />
                        {exercise.sets.map((set) => (
                          <p
                            key={set.id}
                            className="font-mono text-sm text-zinc-600 dark:text-zinc-300"
                          >
                            {formatSet(set)}
                          </p>
                        ))}
                      </li>
                    ))}
                  </ul>
                </Link>
              ))}
            </section>
          ))
        )}
      </main>
    </div>
  );
}
