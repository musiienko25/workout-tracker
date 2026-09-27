"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AddExerciseForm } from "@/components/exercises/add-exercise-form";
import { ExerciseName } from "@/components/exercises/exercise-name";
import { ExerciseCard } from "@/components/workout/exercise-card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { getWorkoutTypeMeta, mergeExercises } from "@/lib/exercises";
import { deleteDraft, saveDraft, saveWorkout, setProgramTemplate } from "@/lib/storage";
import { useWorkoutStore } from "@/lib/use-workout-store";
import {
  draftExerciseFromId,
  formatShortDate,
  getPreviousPerformance,
  validateDraft,
  type FieldError,
} from "@/lib/workout-utils";
import type { DraftSet } from "@/types/workout";

export function WorkoutSession({ id }: { id: string }) {
  const router = useRouter();
  const store = useWorkoutStore();
  const draft = store.drafts.find((item) => item.id === id) ?? null;
  const [message, setMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, FieldError>>({});
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!draft) return;
    document.title = `${getWorkoutTypeMeta(draft.type).label} · Workout`;
  }, [draft]);

  function updateExercise(exerciseId: string, sets: DraftSet[]) {
    if (!draft) return;
    setMessage(null);
    const touchedIds = new Set([
      ...draft.exercises
        .find((exercise) => exercise.exerciseId === exerciseId)
        ?.sets.map((set) => set.id) ?? [],
      ...sets.map((set) => set.id),
    ]);
    setFieldErrors((current) => {
      const next = { ...current };
      for (const setId of touchedIds) delete next[setId];
      return next;
    });
    saveDraft({
      ...draft,
      exercises: draft.exercises.map((exercise) =>
        exercise.exerciseId === exerciseId ? { ...exercise, sets } : exercise,
      ),
    });
  }

  function addExercise(exerciseId: string) {
    if (!draft || draft.exercises.some((exercise) => exercise.exerciseId === exerciseId)) return;
    saveDraft({
      ...draft,
      exercises: [...draft.exercises, draftExerciseFromId(exerciseId)],
    });
    setAdding(false);
  }

  function removeExercise(exerciseId: string) {
    if (!draft || draft.exercises.length <= 1) return;
    saveDraft({
      ...draft,
      exercises: draft.exercises.filter((exercise) => exercise.exerciseId !== exerciseId),
    });
  }

  function saveAsTemplate() {
    if (!draft) return;
    setProgramTemplate(
      draft.type,
      draft.exercises.map((exercise) => exercise.exerciseId),
    );
    setMessage("Шаблон дня збережено.");
  }

  function finish() {
    if (!draft) return;
    const result = validateDraft(draft);
    if (!result.ok) {
      setMessage(result.message);
      setFieldErrors(result.fieldErrors);
      const firstId = Object.keys(result.fieldErrors)[0];
      if (firstId) {
        document.getElementById(`set-${firstId}`)?.scrollIntoView({ block: "center" });
      }
      return;
    }
    saveWorkout(result.workout);
    deleteDraft(draft.id);
    router.push("/");
  }

  function discard() {
    if (!draft) return;
    const confirmed = window.confirm("Discard this workout? Entered sets will be deleted.");
    if (!confirmed) return;
    deleteDraft(draft.id);
    router.push("/");
  }

  if (!store.ready) {
    return (
      <div>
        <PageHeader title="Workout" backHref="/" backLabel="Home" />
        <p className="px-4 py-6 text-sm text-zinc-500">Loading…</p>
      </div>
    );
  }

  if (!draft) {
    return (
      <div>
        <PageHeader title="Workout" backHref="/" backLabel="Home" />
        <p className="px-4 py-6 text-sm text-zinc-500">
          This workout is no longer in progress.
        </p>
      </div>
    );
  }

  const meta = getWorkoutTypeMeta(draft.type);
  const inSession = new Set(draft.exercises.map((exercise) => exercise.exerciseId));
  const available = mergeExercises(store.customExercises).filter(
    (exercise) => !inSession.has(exercise.id),
  );

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title={meta.label}
        eyebrow={formatShortDate(draft.date)}
        backHref="/"
        backLabel="Home"
      />
      <main className="flex flex-col gap-4 px-4 py-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <p className="text-sm text-zinc-500">
          Today starts from your last session. Можна додати або прибрати вправи лише для цього дня.
        </p>
        {draft.exercises.map((exercise) => (
          <ExerciseCard
            key={exercise.exerciseId}
            exerciseId={exercise.exerciseId}
            previous={getPreviousPerformance(store.workouts, exercise.exerciseId)}
            sets={exercise.sets}
            fieldErrors={fieldErrors}
            onChange={(sets) => updateExercise(exercise.exerciseId, sets)}
            onRemove={
              draft.exercises.length > 1 ? () => removeExercise(exercise.exerciseId) : undefined
            }
          />
        ))}
        {adding ? (
          <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm font-semibold">Додати вправу</p>
            <AddExerciseForm defaultType={draft.type} onCreated={addExercise} />
            {available.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {available.map((exercise) => (
                  <li key={exercise.id}>
                    <button
                      type="button"
                      onClick={() => addExercise(exercise.id)}
                      className="flex min-h-12 w-full items-center rounded-xl border border-zinc-200 px-3 text-left active:bg-zinc-50 dark:border-zinc-700 dark:active:bg-zinc-800"
                    >
                      <ExerciseName id={exercise.id} titleClassName="text-sm font-medium" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="h-11 text-sm font-medium text-zinc-500"
            >
              Закрити
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex h-12 w-full items-center justify-center rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-800 active:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-100 dark:active:bg-zinc-800"
          >
            + Додати вправу
          </button>
        )}
        <button type="button" onClick={saveAsTemplate} className="h-12 text-sm font-medium text-zinc-500">
          Зберегти цей список як шаблон дня
        </button>
        <button
          type="button"
          onClick={discard}
          className="h-12 text-sm font-medium text-zinc-500"
        >
          Discard workout
        </button>
        {message ? (
          <p
            className={`text-sm font-medium ${
              message.startsWith("Шаблон") ? "text-emerald-700 dark:text-emerald-400" : "text-red-600"
            }`}
            role="alert"
          >
            {message}
          </p>
        ) : null}
        <Button size="lg" className="w-full" onClick={finish}>
          Finish Workout
        </Button>
      </main>
    </div>
  );
}
