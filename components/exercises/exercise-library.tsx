"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AddExerciseForm } from "@/components/exercises/add-exercise-form";
import { ExerciseName } from "@/components/exercises/exercise-name";
import { PageHeader } from "@/components/ui/page-header";
import {
  WORKOUT_TYPE_META,
  WORKOUT_TYPE_ORDER,
  getTemplateExercises,
} from "@/lib/exercises";
import { removeCustomExercise } from "@/lib/storage";
import { useWorkoutStore } from "@/lib/use-workout-store";

export function ExerciseLibrary() {
  const store = useWorkoutStore();

  useEffect(() => {
    document.title = "Exercises · Workout";
  }, []);

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader title="Exercises" backHref="/" backLabel="Home" />
      <main className="flex flex-col gap-6 px-4 py-5">
        <p className="text-sm text-zinc-500">
          Тут список вправ кожного дня. Можна додати свою і змінити шаблон програми.
        </p>
        <AddExerciseForm />
        {WORKOUT_TYPE_ORDER.map((type) => {
          const exercises = getTemplateExercises(type, store.customExercises, store.templates);
          return (
            <section key={type}>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                  {WORKOUT_TYPE_META[type].label}
                </h2>
                <Link
                  href={`/workout/plan/${type}`}
                  className="text-sm font-medium text-emerald-700 dark:text-emerald-400"
                >
                  Змінити план
                </Link>
              </div>
              <ul className="mt-2 flex flex-col gap-2">
                {exercises.map((exercise) => (
                  <li key={exercise.id} className="flex items-center gap-2">
                    <Link
                      href={`/exercises/${exercise.id}`}
                      className="flex min-h-14 min-w-0 flex-1 items-center rounded-2xl border border-zinc-200 bg-white px-4 py-2.5 active:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:active:bg-zinc-800"
                    >
                      <ExerciseName
                        name={exercise.name}
                        nameUk={exercise.nameUk}
                        titleClassName="text-base font-medium"
                      />
                    </Link>
                    {exercise.custom ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm("Видалити цю вправу зі списку?")) {
                            removeCustomExercise(exercise.id);
                          }
                        }}
                        className="h-11 shrink-0 px-2 text-sm font-medium text-red-600"
                      >
                        Видалити
                      </button>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </main>
    </div>
  );
}
