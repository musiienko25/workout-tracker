import { getExerciseById, getExerciseName } from "@/lib/exercises";

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
  const exercise = id ? getExerciseById(id) : undefined;
  const title = name ?? exercise?.name ?? (id ? getExerciseName(id) : "Unknown exercise");
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
