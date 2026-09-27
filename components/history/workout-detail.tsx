"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { ExerciseName } from "@/components/exercises/exercise-name";
import { WORKOUT_TYPE_META } from "@/lib/exercises";
import { deleteWorkout } from "@/lib/storage";
import { useWorkoutStore } from "@/lib/use-workout-store";
import { formatLongDate, formatSet } from "@/lib/workout-utils";

export function WorkoutDetail({ id }: { id: string }) {
  const router = useRouter();
  const store = useWorkoutStore();
  const workout = store.workouts.find((item) => item.id === id) ?? null;

  useEffect(() => {
    if (!workout) return;
    document.title = `${WORKOUT_TYPE_META[workout.type].label} · History`;
  }, [workout]);

  function remove() {
    if (!workout) return;
    const confirmed = window.confirm("Delete this workout?");
    if (!confirmed) return;
    deleteWorkout(workout.id);
    router.push("/history");
  }

  if (!store.ready) {
    return (
      <div>
        <PageHeader title="Workout" backHref="/history" backLabel="History" />
        <p className="px-4 py-6 text-sm text-zinc-500">Loading…</p>
      </div>
    );
  }

  if (!workout) {
    return (
      <div>
        <PageHeader title="Workout" backHref="/history" backLabel="History" />
        <p className="px-4 py-6 text-sm text-zinc-500">Workout not found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title={WORKOUT_TYPE_META[workout.type].label}
        eyebrow={formatLongDate(workout.date)}
        backHref="/history"
        backLabel="History"
      />
      <main className="flex flex-col gap-4 px-4 py-5">
        {workout.exercises.map((exercise) => (
          <section key={exercise.exerciseId}>
            <Link href={`/exercises/${exercise.exerciseId}`} className="inline-block">
              <ExerciseName id={exercise.exerciseId} />
            </Link>
            <ul className="mt-1">
              {exercise.sets.map((set) => (
                <li key={set.id} className="font-mono text-sm text-zinc-600 dark:text-zinc-300">
                  {formatSet(set)}
                </li>
              ))}
            </ul>
          </section>
        ))}
        <button type="button" onClick={remove} className="mt-4 h-12 text-sm font-medium text-red-600">
          Delete workout
        </button>
      </main>
    </div>
  );
}
