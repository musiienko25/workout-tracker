"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { WORKOUT_TYPE_ORDER } from "@/lib/exercises";
import { getDraftByType, saveDraft } from "@/lib/storage";
import { useWorkoutStore } from "@/lib/use-workout-store";
import { createDraft } from "@/lib/workout-utils";

export function StartWorkout() {
  const router = useRouter();
  const store = useWorkoutStore();
  const started = useRef(false);

  useEffect(() => {
    if (!store.ready || started.current) return;
    started.current = true;
    const type = WORKOUT_TYPE_ORDER[0];
    const existing = getDraftByType(type);
    if (existing) {
      router.replace(`/workout/${existing.id}`);
      return;
    }
    const draft = createDraft(type);
    saveDraft(draft);
    router.replace(`/workout/${draft.id}`);
  }, [router, store.ready]);

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader title="Start Workout" backHref="/" backLabel="Home" />
      <p className="px-4 py-6 text-sm text-zinc-500">Opening today’s workout…</p>
    </div>
  );
}
