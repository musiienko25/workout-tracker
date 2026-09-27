import { isWorkoutType } from "@/lib/exercises";
import { seedWorkouts } from "@/lib/seed";
import type { WorkoutType } from "@/types/exercise";
import type { DraftWorkout, Workout, WorkoutSet } from "@/types/workout";

/**
 * Persistence boundary for the workout diary.
 * UI should read this through `useWorkoutStore` and write through these functions.
 * Replace this module to move storage to Supabase/PostgreSQL.
 */

const WORKOUTS_KEY = "workout-tracker:workouts";
const DRAFTS_KEY = "workout-tracker:drafts";
const SEED_FLAG_KEY = "workout-tracker:v4-seeded";

export type StoreSnapshot = {
  ready: boolean;
  workouts: Workout[];
  drafts: DraftWorkout[];
};

const SERVER_SNAPSHOT: StoreSnapshot = {
  ready: false,
  workouts: [],
  drafts: [],
};

let clientSnapshot: StoreSnapshot | null = null;
const listeners = new Set<() => void>();

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readJson(key: string): unknown {
  if (!canUseStorage()) return null;
  const raw = window.localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function isWorkoutSet(value: unknown): value is WorkoutSet {
  if (!value || typeof value !== "object") return false;
  const set = value as WorkoutSet;
  return (
    typeof set.id === "string" &&
    typeof set.weight === "number" &&
    Number.isFinite(set.weight) &&
    typeof set.reps === "number" &&
    Number.isFinite(set.reps)
  );
}

function isWorkout(value: unknown): value is Workout {
  if (!value || typeof value !== "object") return false;
  const workout = value as Workout;
  return (
    typeof workout.id === "string" &&
    typeof workout.date === "string" &&
    typeof workout.createdAt === "string" &&
    isWorkoutType(workout.type) &&
    typeof workout.completed === "boolean" &&
    Array.isArray(workout.exercises) &&
    workout.exercises.every(
      (exercise) =>
        exercise &&
        typeof exercise.exerciseId === "string" &&
        Array.isArray(exercise.sets) &&
        exercise.sets.every(isWorkoutSet),
    )
  );
}

function isDraft(value: unknown): value is DraftWorkout {
  if (!value || typeof value !== "object") return false;
  const draft = value as DraftWorkout;
  return (
    typeof draft.id === "string" &&
    typeof draft.date === "string" &&
    typeof draft.createdAt === "string" &&
    isWorkoutType(draft.type) &&
    Array.isArray(draft.exercises) &&
    draft.exercises.every(
      (exercise) =>
        exercise &&
        typeof exercise.exerciseId === "string" &&
        Array.isArray(exercise.sets) &&
        exercise.sets.every(
          (set) =>
            set &&
            typeof set.id === "string" &&
            typeof set.weight === "string" &&
            typeof set.reps === "string",
        ),
    )
  );
}

function parseWorkouts(value: unknown): Workout[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isWorkout);
}

function parseDrafts(value: unknown): DraftWorkout[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isDraft);
}

function ensureSeedData(): void {
  if (!canUseStorage()) return;
  const flagged = window.localStorage.getItem(SEED_FLAG_KEY) === "1";
  const stored = readJson(WORKOUTS_KEY);
  const allLegacy =
    Array.isArray(stored) &&
    stored.length > 0 &&
    stored.every((item) => !item || typeof item !== "object" || !isWorkoutType((item as Workout).type));

  if (flagged && !allLegacy) return;

  writeJson(WORKOUTS_KEY, seedWorkouts);
  writeJson(DRAFTS_KEY, []);
  window.localStorage.setItem(SEED_FLAG_KEY, "1");
  clientSnapshot = null;
  emitChange();
}

function emitChange(): void {
  for (const listener of listeners) listener();
}

function loadSnapshot(): StoreSnapshot {
  if (!canUseStorage()) return SERVER_SNAPSHOT;
  ensureSeedData();
  if (clientSnapshot?.ready) return clientSnapshot;
  clientSnapshot = {
    ready: true,
    workouts: parseWorkouts(readJson(WORKOUTS_KEY)),
    drafts: parseDrafts(readJson(DRAFTS_KEY)),
  };
  return clientSnapshot;
}

function commit(
  next: StoreSnapshot,
  keys: { workouts?: boolean; drafts?: boolean },
): void {
  clientSnapshot = next;
  if (keys.workouts) writeJson(WORKOUTS_KEY, next.workouts);
  if (keys.drafts) writeJson(DRAFTS_KEY, next.drafts);
  emitChange();
}

function requireSnapshot(): StoreSnapshot {
  const snapshot = loadSnapshot();
  if (!snapshot.ready) {
    throw new Error("Workout storage is only available in the browser.");
  }
  return snapshot;
}

export function subscribeToStore(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Cached client snapshot. Must return the same reference until storage changes. */
export function getClientSnapshot(): StoreSnapshot {
  return loadSnapshot();
}

export function getServerSnapshot(): StoreSnapshot {
  return SERVER_SNAPSHOT;
}

export function getWorkouts(): Workout[] {
  return loadSnapshot().workouts;
}

export function getWorkoutById(id: string): Workout | null {
  return getWorkouts().find((workout) => workout.id === id) ?? null;
}

export function saveWorkout(workout: Workout): void {
  const current = requireSnapshot();
  const index = current.workouts.findIndex((item) => item.id === workout.id);
  const workouts =
    index === -1
      ? [workout, ...current.workouts]
      : current.workouts.map((item) => (item.id === workout.id ? workout : item));
  commit({ ...current, workouts }, { workouts: true });
}

export function deleteWorkout(id: string): void {
  const current = requireSnapshot();
  commit(
    {
      ...current,
      workouts: current.workouts.filter((workout) => workout.id !== id),
    },
    { workouts: true },
  );
}

export function getLastWorkoutForExercise(exerciseId: string): {
  workout: Workout;
  sets: WorkoutSet[];
} | null {
  const workouts = getWorkouts()
    .filter((workout) => workout.completed)
    .sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1;
      if (a.createdAt !== b.createdAt) return a.createdAt < b.createdAt ? 1 : -1;
      return 0;
    });

  for (const workout of workouts) {
    const entry = workout.exercises.find(
      (exercise) => exercise.exerciseId === exerciseId && exercise.sets.length > 0,
    );
    if (entry) return { workout, sets: entry.sets };
  }

  return null;
}

export function getDrafts(): DraftWorkout[] {
  return loadSnapshot().drafts;
}

export function getDraftById(id: string): DraftWorkout | null {
  return getDrafts().find((draft) => draft.id === id) ?? null;
}

export function getDraftByType(type: WorkoutType): DraftWorkout | null {
  return (
    getDrafts()
      .filter((draft) => draft.type === type)
      .sort((a, b) => {
        if (a.date !== b.date) return a.date < b.date ? 1 : -1;
        if (a.createdAt !== b.createdAt) return a.createdAt < b.createdAt ? 1 : -1;
        return 0;
      })[0] ?? null
  );
}

export function saveDraft(draft: DraftWorkout): void {
  const current = requireSnapshot();
  const index = current.drafts.findIndex((item) => item.id === draft.id);
  const drafts =
    index === -1
      ? [draft, ...current.drafts]
      : current.drafts.map((item) => (item.id === draft.id ? draft : item));
  commit({ ...current, drafts }, { drafts: true });
}

export function deleteDraft(id: string): void {
  const current = requireSnapshot();
  commit(
    { ...current, drafts: current.drafts.filter((draft) => draft.id !== id) },
    { drafts: true },
  );
}
