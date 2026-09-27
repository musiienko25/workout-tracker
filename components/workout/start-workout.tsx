"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { WORKOUT_TYPE_META, WORKOUT_TYPE_ORDER } from "@/lib/exercises";
import { getDraftByType, saveDraft } from "@/lib/storage";
import { useWorkoutStore } from "@/lib/use-workout-store";
import { createDraft } from "@/lib/workout-utils";
import type { WorkoutType } from "@/types/exercise";

export function StartWorkout() {
  const router = useRouter();
  const store = useWorkoutStore();

  function start(type: WorkoutType) {
    const existing = getDraftByType(type);
    if (existing) {
      router.push(`/workout/${existing.id}`);
      return;
    }
    const draft = createDraft(type);
    saveDraft(draft);
    router.push(`/workout/${draft.id}`);
  }

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader title="Start Workout" backHref="/" backLabel="Home" />
      <main className="flex flex-col gap-3 px-4 py-5">
        <p className="text-sm text-zinc-500">Обери програму. Минулі сети будуть на екрані тренування.</p>
        {WORKOUT_TYPE_ORDER.map((type) => {
          const meta = WORKOUT_TYPE_META[type];
          const inProgress = store.drafts.some((draft) => draft.type === type);
          return (
            <button
              key={type}
              type="button"
              onClick={() => start(type)}
              className="flex min-h-20 w-full flex-col items-start justify-center rounded-2xl border border-zinc-200 bg-white px-4 py-4 text-left active:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:active:bg-zinc-800"
            >
              <span className="text-lg font-semibold">{meta.label}</span>
              <span className="text-sm text-zinc-500">{meta.description}</span>
              {inProgress ? (
                <span className="mt-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  Продовжити незавершене
                </span>
              ) : null}
            </button>
          );
        })}
      </main>
    </div>
  );
}
