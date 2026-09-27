"use client";

import Link from "next/link";
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
        <p className="text-sm text-zinc-500">
          Обери програму. Список вправ на день можна змінити.
        </p>
        {WORKOUT_TYPE_ORDER.map((type) => {
          const meta = WORKOUT_TYPE_META[type];
          const inProgress = store.drafts.some((draft) => draft.type === type);
          return (
            <div
              key={type}
              className="flex items-stretch rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
            >
              <button
                type="button"
                onClick={() => start(type)}
                className="flex min-h-20 min-w-0 flex-1 flex-col items-start justify-center px-4 py-4 text-left active:bg-zinc-50 dark:active:bg-zinc-800"
              >
                <span className="text-lg font-semibold">{meta.label}</span>
                <span className="text-sm text-zinc-500">{meta.description}</span>
                {inProgress ? (
                  <span className="mt-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                    Продовжити незавершене
                  </span>
                ) : null}
              </button>
              <Link
                href={`/workout/plan/${type}`}
                aria-label={`Змінити план: ${meta.label}`}
                className="flex w-12 shrink-0 items-center justify-center text-zinc-400 active:text-emerald-700 dark:active:text-emerald-400"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
              </Link>
            </div>
          );
        })}
      </main>
    </div>
  );
}
