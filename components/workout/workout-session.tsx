"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ExerciseCard } from "@/components/workout/exercise-card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { WORKOUT_TYPE_META } from "@/lib/exercises";
import { deleteDraft, saveDraft, saveWorkout } from "@/lib/storage";
import { useWorkoutStore } from "@/lib/use-workout-store";
import {
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

  useEffect(() => {
    if (!draft) return;
    document.title = `${WORKOUT_TYPE_META[draft.type].label} · Workout`;
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

  const meta = WORKOUT_TYPE_META[draft.type];

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title={meta.label}
        eyebrow={formatShortDate(draft.date)}
        backHref="/"
        backLabel="Home"
      />
      <main className="flex flex-col gap-4 px-4 py-4 pb-40">
        <p className="text-sm text-zinc-500">
          Today starts from your last session. Finishing saves a new workout.
        </p>
        {draft.exercises.map((exercise) => (
          <ExerciseCard
            key={exercise.exerciseId}
            exerciseId={exercise.exerciseId}
            previous={getPreviousPerformance(store.workouts, exercise.exerciseId)}
            sets={exercise.sets}
            fieldErrors={fieldErrors}
            onChange={(sets) => updateExercise(exercise.exerciseId, sets)}
          />
        ))}
        <button
          type="button"
          onClick={discard}
          className="h-12 text-sm font-medium text-zinc-500"
        >
          Discard workout
        </button>
      </main>
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto w-full max-w-lg px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {message ? (
            <p className="mb-2 text-sm font-medium text-red-600" role="alert">
              {message}
            </p>
          ) : null}
          <Button size="lg" className="w-full" onClick={finish}>
            Finish Workout
          </Button>
        </div>
      </div>
    </div>
  );
}
