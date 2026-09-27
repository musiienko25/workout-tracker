import type { Exercise, WorkoutType } from "@/types/exercise";

export const WORKOUT_TYPE_ORDER: WorkoutType[] = ["push", "pull", "legs"];

export const WORKOUT_TYPE_META: Record<
  WorkoutType,
  { label: string; description: string }
> = {
  push: {
    label: "Push",
    description: "Chest, shoulders, triceps",
  },
  pull: {
    label: "Pull",
    description: "Back and biceps",
  },
  legs: {
    label: "Legs",
    description: "Quads, hamstrings, calves",
  },
};

export const exercises: Exercise[] = [
  { id: "bench-press", name: "Bench Press", workoutType: "push" },
  {
    id: "incline-dumbbell-press",
    name: "Incline Dumbbell Press",
    workoutType: "push",
  },
  { id: "shoulder-press", name: "Shoulder Press", workoutType: "push" },
  { id: "lateral-raises", name: "Lateral Raises", workoutType: "push" },
  { id: "triceps-pushdown", name: "Triceps Pushdown", workoutType: "push" },

  { id: "pull-ups", name: "Pull Ups", workoutType: "pull" },
  { id: "lat-pulldown", name: "Lat Pulldown", workoutType: "pull" },
  { id: "barbell-row", name: "Barbell Row", workoutType: "pull" },
  { id: "seated-cable-row", name: "Seated Cable Row", workoutType: "pull" },
  { id: "biceps-curl", name: "Biceps Curl", workoutType: "pull" },

  { id: "squat", name: "Squat", workoutType: "legs" },
  { id: "romanian-deadlift", name: "Romanian Deadlift", workoutType: "legs" },
  { id: "leg-press", name: "Leg Press", workoutType: "legs" },
  { id: "leg-curl", name: "Leg Curl", workoutType: "legs" },
  { id: "calf-raises", name: "Calf Raises", workoutType: "legs" },
];

const exercisesById = new Map(exercises.map((exercise) => [exercise.id, exercise]));

export function getExerciseById(id: string): Exercise | undefined {
  return exercisesById.get(id);
}

export function getExerciseName(id: string): string {
  return exercisesById.get(id)?.name ?? "Unknown exercise";
}

export function getExercisesByType(type: WorkoutType): Exercise[] {
  return exercises.filter((exercise) => exercise.workoutType === type);
}
