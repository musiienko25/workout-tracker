"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { WORKOUT_TYPE_META, WORKOUT_TYPE_ORDER } from "@/lib/exercises";
import { addCustomExercise } from "@/lib/storage";
import { createId } from "@/lib/workout-utils";
import type { WorkoutType } from "@/types/exercise";

export function AddExerciseForm({
  defaultType,
  onCreated,
}: {
  defaultType?: WorkoutType;
  onCreated?: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [nameUk, setNameUk] = useState("");
  const [type, setType] = useState<WorkoutType>(defaultType ?? "chest_arms");
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setName("");
    setNameUk("");
    setType(defaultType ?? "chest_arms");
    setError(null);
    setOpen(false);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError("Введи назву вправи.");
      return;
    }
    const created = addCustomExercise({
      id: `custom-${createId()}`,
      name: trimmed,
      nameUk: nameUk.trim(),
      workoutType: type,
    });
    onCreated?.(created.id);
    reset();
  }

  if (!open) {
    return (
      <Button variant="secondary" className="w-full" onClick={() => setOpen(true)}>
        + Своя вправа
      </Button>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <label className="flex flex-col gap-1 text-sm font-medium">
        Назва
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          className="h-12 rounded-xl border border-zinc-200 bg-white px-3 text-base dark:border-zinc-700 dark:bg-zinc-950"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Українською (необовʼязково)
        <input
          value={nameUk}
          onChange={(event) => setNameUk(event.target.value)}
          className="h-12 rounded-xl border border-zinc-200 bg-white px-3 text-base dark:border-zinc-700 dark:bg-zinc-950"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Програма
        <select
          value={type}
          onChange={(event) => setType(event.target.value as WorkoutType)}
          className="h-12 rounded-xl border border-zinc-200 bg-white px-3 text-base dark:border-zinc-700 dark:bg-zinc-950"
        >
          {WORKOUT_TYPE_ORDER.map((item) => (
            <option key={item} value={item}>
              {WORKOUT_TYPE_META[item].label}
            </option>
          ))}
        </select>
      </label>
      {error ? (
        <p className="text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex gap-2">
        <Button type="submit" className="flex-1">
          Додати
        </Button>
        <Button type="button" variant="secondary" className="flex-1" onClick={reset}>
          Скасувати
        </Button>
      </div>
    </form>
  );
}
