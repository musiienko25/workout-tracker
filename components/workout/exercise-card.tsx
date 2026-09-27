"use client";

import { ExerciseName } from "@/components/exercises/exercise-name";
import {
  emptyDraftSet,
  formatSets,
  formatShortDate,
  formatWeight,
  type FieldError,
  type PreviousPerformance,
} from "@/lib/workout-utils";
import type { DraftSet } from "@/types/workout";

const inputClass =
  "h-12 w-full rounded-lg border bg-white px-3 text-base tabular-nums text-zinc-950 outline-none focus:border-emerald-600 dark:bg-zinc-950 dark:text-zinc-50";

export function ExerciseCard({
  exerciseId,
  previous,
  sets,
  fieldErrors,
  onChange,
  onRemove,
}: {
  exerciseId: string;
  previous: PreviousPerformance | null;
  sets: DraftSet[];
  fieldErrors: Record<string, FieldError>;
  onChange: (sets: DraftSet[]) => void;
  onRemove?: () => void;
}) {
  function update(setId: string, field: "weight" | "reps", value: string) {
    onChange(
      sets.map((set) => (set.id === setId ? { ...set, [field]: value } : set)),
    );
  }

  function addSet() {
    const last = sets[sets.length - 1];
    const previousLast = previous?.sets[previous.sets.length - 1];
    const template =
      last && (last.weight.trim() || last.reps.trim())
        ? { weight: last.weight, reps: last.reps }
        : previousLast
          ? {
              weight: formatWeight(previousLast.weight),
              reps: String(previousLast.reps),
            }
          : undefined;
    onChange([...sets, emptyDraftSet(template)]);
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-2">
        <h2>
          <ExerciseName id={exerciseId} titleClassName="text-lg font-semibold tracking-tight" />
        </h2>
        {onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="h-10 shrink-0 px-1 text-sm font-medium text-zinc-500"
          >
            Прибрати
          </button>
        ) : null}
      </div>

      <div className="mt-3 rounded-lg bg-zinc-100 px-3 py-2 dark:bg-zinc-800">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Previous{previous ? ` · ${formatShortDate(previous.date)}` : ""}
        </p>
        <p className="mt-1 font-mono text-sm text-zinc-700 dark:text-zinc-200">
          {previous ? formatSets(previous.sets) : "No history yet"}
        </p>
      </div>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-zinc-500">
        Today
      </p>

      <div className="mt-2 grid grid-cols-[1.25rem_1fr_1fr_2.75rem] gap-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
        <span />
        <span>Weight (kg)</span>
        <span>Reps</span>
        <span className="sr-only">Remove</span>
      </div>

      <div className="mt-2 flex flex-col gap-2">
        {sets.map((set, index) => {
          const error = fieldErrors[set.id];
          return (
            <div
              key={set.id}
              id={`set-${set.id}`}
              className="grid grid-cols-[1.25rem_1fr_1fr_2.75rem] items-center gap-2"
            >
              <span className="text-sm tabular-nums text-zinc-500">{index + 1}</span>
              <input
                aria-label={`Set ${index + 1} weight`}
                aria-invalid={error === "weight" || error === "both"}
                inputMode="decimal"
                autoComplete="off"
                enterKeyHint="next"
                value={set.weight}
                onChange={(event) => update(set.id, "weight", event.target.value)}
                onFocus={(event) => event.currentTarget.select()}
                className={`${inputClass} ${
                  error === "weight" || error === "both"
                    ? "border-red-500"
                    : "border-zinc-200 dark:border-zinc-700"
                }`}
              />
              <input
                aria-label={`Set ${index + 1} reps`}
                aria-invalid={error === "reps" || error === "both"}
                inputMode="numeric"
                autoComplete="off"
                enterKeyHint="done"
                value={set.reps}
                onChange={(event) => update(set.id, "reps", event.target.value)}
                onFocus={(event) => event.currentTarget.select()}
                className={`${inputClass} ${
                  error === "reps" || error === "both"
                    ? "border-red-500"
                    : "border-zinc-200 dark:border-zinc-700"
                }`}
              />
              <button
                type="button"
                aria-label={`Remove set ${index + 1}`}
                onClick={() => onChange(sets.filter((item) => item.id !== set.id))}
                className="flex h-12 w-11 items-center justify-center rounded-lg text-lg text-zinc-500 active:bg-zinc-100 dark:active:bg-zinc-800"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={addSet}
        className="mt-3 flex h-12 w-full items-center justify-center rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-800 active:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-100 dark:active:bg-zinc-800"
      >
        + Add set
      </button>
    </section>
  );
}
