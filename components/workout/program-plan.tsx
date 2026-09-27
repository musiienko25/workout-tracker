"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AddExerciseForm } from "@/components/exercises/add-exercise-form";
import { ExerciseName } from "@/components/exercises/exercise-name";
import { PageHeader } from "@/components/ui/page-header";
import {
  WORKOUT_TYPE_META,
  WORKOUT_TYPE_ORDER,
  getDefaultTemplateIds,
  getTemplateIds,
  mergeExercises,
} from "@/lib/exercises";
import { setProgramTemplate } from "@/lib/storage";
import { useWorkoutStore } from "@/lib/use-workout-store";
import type { WorkoutType } from "@/types/exercise";

export function ProgramPlan({ type }: { type: WorkoutType }) {
  const router = useRouter();
  const store = useWorkoutStore();
  const meta = WORKOUT_TYPE_META[type];
  const templateIds = getTemplateIds(type, store.templates);
  const all = mergeExercises(store.customExercises);
  const inPlan = templateIds
    .map((id) => all.find((exercise) => exercise.id === id))
    .filter((exercise): exercise is NonNullable<typeof exercise> => Boolean(exercise));
  const inPlanIds = new Set(inPlan.map((exercise) => exercise.id));
  const available = all.filter((exercise) => !inPlanIds.has(exercise.id));

  useEffect(() => {
    document.title = `${meta.label} · План`;
  }, [meta.label]);

  function remove(id: string) {
    if (inPlan.length <= 1) return;
    setProgramTemplate(
      type,
      templateIds.filter((exerciseId) => exerciseId !== id),
    );
  }

  function add(id: string) {
    if (inPlanIds.has(id)) return;
    setProgramTemplate(type, [...templateIds, id]);
  }

  function reset() {
    setProgramTemplate(type, getDefaultTemplateIds(type));
  }

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader title={meta.label} subtitle="Шаблон дня" backHref="/workout" backLabel="Програми" />
      <main className="flex flex-col gap-5 px-4 py-5">
        <p className="text-sm text-zinc-500">
          Цей список відкривається, коли стартуєш {meta.label.toLowerCase()}. Можна прибрати вправу
          або додати зі списку чи свою.
        </p>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">У плані</h2>
          <ul className="mt-2 flex flex-col gap-2">
            {inPlan.map((exercise) => (
              <li
                key={exercise.id}
                className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-2.5 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <ExerciseName id={exercise.id} titleClassName="text-base font-medium" />
                <button
                  type="button"
                  onClick={() => remove(exercise.id)}
                  disabled={inPlan.length <= 1}
                  className="ml-auto h-11 shrink-0 px-2 text-sm font-medium text-red-600 disabled:opacity-40"
                >
                  Прибрати
                </button>
              </li>
            ))}
          </ul>
        </section>

        <AddExerciseForm defaultType={type} onCreated={add} />

        {available.length > 0 ? (
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Додати зі списку
            </h2>
            <ul className="mt-2 flex flex-col gap-2">
              {available.map((exercise) => (
                <li key={exercise.id}>
                  <button
                    type="button"
                    onClick={() => add(exercise.id)}
                    className="flex min-h-14 w-full items-center justify-between rounded-2xl border border-zinc-200 bg-white px-4 py-2.5 text-left active:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:active:bg-zinc-800"
                  >
                    <ExerciseName id={exercise.id} titleClassName="text-base font-medium" />
                    <span className="ml-3 shrink-0 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                      {WORKOUT_TYPE_META[exercise.workoutType].label} · Додати
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <button type="button" onClick={reset} className="h-12 text-sm font-medium text-zinc-500">
          Повернути стандартний план
        </button>
        <button
          type="button"
          onClick={() => router.push("/workout")}
          className="h-12 text-sm font-medium text-emerald-700 dark:text-emerald-400"
        >
          Готово
        </button>
      </main>
    </div>
  );
}

export function ProgramPlanFallback() {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader title="План" backHref="/workout" backLabel="Програми" />
      <p className="px-4 py-6 text-sm text-zinc-500">Такої програми немає.</p>
      <p className="px-4 text-sm text-zinc-500">
        Доступні: {WORKOUT_TYPE_ORDER.map((type) => WORKOUT_TYPE_META[type].label).join(", ")}.
      </p>
    </div>
  );
}
