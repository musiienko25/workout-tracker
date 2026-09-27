"use client";

import { resolveExercise } from "@/lib/exercises";
import { useWorkoutStore } from "@/lib/use-workout-store";

export function ExerciseName({
  id,
  name,
  nameUk,
  titleClassName = "text-base font-semibold tracking-tight",
}: {
  id?: string;
  name?: string;
  nameUk?: string;
  titleClassName?: string;
}) {
  const store = useWorkoutStore();
  const exercise = id ? resolveExercise(id, store.customExercises) : undefined;
  const title = name ?? exercise?.name ?? "Unknown exercise";
  const translation = nameUk ?? exercise?.nameUk;

  return (
    <span className="flex min-w-0 flex-col">
      <span className={titleClassName}>{title}</span>
      {translation ? (
        <span className="mt-0.5 text-xs leading-snug text-zinc-500">{translation}</span>
      ) : null}
    </span>
  );
}
