import { getTemplateExercises } from "@/lib/exercises";
import { getClientSnapshot, getLastWorkoutForExercise } from "@/lib/storage";
import type { WorkoutType } from "@/types/exercise";
import type {
  DraftSet,
  DraftWorkout,
  Workout,
  WorkoutSet,
} from "@/types/workout";

export function createId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function todayDateString(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateOnly(isoDate: string): Date {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function formatShortDate(isoDate: string): string {
  return parseDateOnly(isoDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function formatLongDate(isoDate: string): string {
  const date = parseDateOnly(isoDate);
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: sameYear ? undefined : "numeric",
  });
}

export function formatWeight(weight: number): string {
  return Number.isInteger(weight) ? String(weight) : String(weight);
}

export function formatSet(set: WorkoutSet): string {
  return `${formatWeight(set.weight)} × ${set.reps}`;
}

export function formatSets(sets: WorkoutSet[], separator = " · "): string {
  return sets.map(formatSet).join(separator);
}

export function compareWorkoutsNewest(
  a: { date: string; createdAt: string },
  b: { date: string; createdAt: string },
): number {
  if (a.date !== b.date) return a.date < b.date ? 1 : -1;
  if (a.createdAt !== b.createdAt) return a.createdAt < b.createdAt ? 1 : -1;
  return 0;
}

export function listCompletedWorkouts(workouts: Workout[]): Workout[] {
  return workouts.filter((workout) => workout.completed).sort(compareWorkoutsNewest);
}

export function getLatestCompletedWorkout(workouts: Workout[]): Workout | null {
  return listCompletedWorkouts(workouts)[0] ?? null;
}

export type PreviousPerformance = {
  date: string;
  sets: WorkoutSet[];
};

export function getPreviousPerformance(
  workouts: Workout[],
  exerciseId: string,
): PreviousPerformance | null {
  for (const workout of listCompletedWorkouts(workouts)) {
    const entry = workout.exercises.find(
      (exercise) => exercise.exerciseId === exerciseId && exercise.sets.length > 0,
    );
    if (entry) return { date: workout.date, sets: entry.sets };
  }
  return null;
}

export function emptyDraftSet(template?: Pick<DraftSet, "weight" | "reps">): DraftSet {
  return {
    id: createId(),
    weight: template?.weight ?? "",
    reps: template?.reps ?? "",
  };
}

export function draftExerciseFromId(exerciseId: string) {
  const previous = getLastWorkoutForExercise(exerciseId);
  return {
    exerciseId,
    sets: previous
      ? previous.sets.map((set) => ({
          id: createId(),
          weight: formatWeight(set.weight),
          reps: String(set.reps),
        }))
      : [emptyDraftSet()],
  };
}

export function createDraft(type: WorkoutType): DraftWorkout {
  const now = new Date();
  const { customExercises, templates } = getClientSnapshot();
  return {
    id: createId(),
    date: todayDateString(now),
    createdAt: now.toISOString(),
    type,
    exercises: getTemplateExercises(type, customExercises, templates).map((exercise) =>
      draftExerciseFromId(exercise.id),
    ),
  };
}

export type FieldError = "weight" | "reps" | "both";

export type DraftValidation =
  | { ok: true; workout: Workout }
  | { ok: false; message: string; fieldErrors: Record<string, FieldError> };

function parseWeight(value: string): number | null {
  const trimmed = value.trim().replace(",", ".");
  if (!trimmed) return null;
  if (!/^\d+(\.\d+)?$/.test(trimmed)) return null;
  const weight = Number(trimmed);
  if (!Number.isFinite(weight) || weight < 0 || weight > 2000) return null;
  return weight;
}

function parseReps(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!/^\d+$/.test(trimmed)) return null;
  const reps = Number(trimmed);
  if (!Number.isInteger(reps) || reps < 1 || reps > 100) return null;
  return reps;
}

export function validateDraft(draft: DraftWorkout): DraftValidation {
  const fieldErrors: Record<string, FieldError> = {};
  const exercises: Workout["exercises"] = [];

  for (const exercise of draft.exercises) {
    const sets: WorkoutSet[] = [];

    for (const set of exercise.sets) {
      const weightEmpty = set.weight.trim() === "";
      const repsEmpty = set.reps.trim() === "";
      if (weightEmpty && repsEmpty) continue;

      const weight = parseWeight(set.weight);
      const reps = parseReps(set.reps);
      if (weight === null || reps === null) {
        fieldErrors[set.id] =
          weight === null && reps === null ? "both" : weight === null ? "weight" : "reps";
        continue;
      }

      sets.push({ id: set.id, weight, reps });
    }

    if (sets.length > 0) {
      exercises.push({ exerciseId: exercise.exerciseId, sets });
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      message: "Enter both weight and reps for every set you started.",
      fieldErrors,
    };
  }

  if (exercises.length === 0) {
    return {
      ok: false,
      message: "Log at least one set before finishing.",
      fieldErrors,
    };
  }

  return {
    ok: true,
    workout: {
      id: draft.id,
      date: draft.date,
      createdAt: draft.createdAt,
      type: draft.type,
      exercises,
      completed: true,
    },
  };
}

export function groupWorkoutsByDate(workouts: Workout[]): Array<{
  date: string;
  label: string;
  workouts: Workout[];
}> {
  const groups: Array<{ date: string; label: string; workouts: Workout[] }> = [];

  for (const workout of workouts) {
    const current = groups[groups.length - 1];
    if (current && current.date === workout.date) {
      current.workouts.push(workout);
    } else {
      groups.push({
        date: workout.date,
        label: formatLongDate(workout.date),
        workouts: [workout],
      });
    }
  }

  return groups;
}

export type ExerciseHistoryEntry = {
  workoutId: string;
  date: string;
  sets: WorkoutSet[];
};

export function getExerciseHistory(
  workouts: Workout[],
  exerciseId: string,
): ExerciseHistoryEntry[] {
  return listCompletedWorkouts(workouts).flatMap((workout) => {
    const entry = workout.exercises.find(
      (exercise) => exercise.exerciseId === exerciseId && exercise.sets.length > 0,
    );
    if (!entry) return [];
    return [{ workoutId: workout.id, date: workout.date, sets: entry.sets }];
  });
}
