"use client";

import { useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { WORKOUT_TYPE_META, WORKOUT_TYPE_ORDER, getExercisesByType } from "@/lib/exercises";

export function ExerciseLibrary() {
  useEffect(() => {
    document.title = "Exercises · Workout";
  }, []);

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader title="Exercises" backHref="/" backLabel="Home" />
      <main className="flex flex-col gap-6 px-4 py-5">
        {WORKOUT_TYPE_ORDER.map((type) => (
          <section key={type}>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              {WORKOUT_TYPE_META[type].label}
            </h2>
            <ul className="mt-2 flex flex-col gap-2">
              {getExercisesByType(type).map((exercise) => (
                <li key={exercise.id}>
                  <Link
                    href={`/exercises/${exercise.id}`}
                    className="flex h-14 items-center rounded-2xl border border-zinc-200 bg-white px-4 font-medium active:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:active:bg-zinc-800"
                  >
                    {exercise.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>
    </div>
  );
}
