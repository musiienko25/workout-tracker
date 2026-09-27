import type { WorkoutType } from "@/types/exercise";

export type WorkoutSet = {
  id: string;
  weight: number;
  reps: number;
};

export type WorkoutExercise = {
  exerciseId: string;
  sets: WorkoutSet[];
};

export type Workout = {
  id: string;
  /** Calendar day the workout belongs to, YYYY-MM-DD in local time. */
  date: string;
  /** ISO timestamp used to order workouts that share a date. */
  createdAt: string;
  type: WorkoutType;
  exercises: WorkoutExercise[];
  completed: boolean;
};

/** In-progress logging state. Weight and reps stay strings so inputs can be empty. */
export type DraftSet = {
  id: string;
  weight: string;
  reps: string;
};

export type DraftExercise = {
  exerciseId: string;
  sets: DraftSet[];
};

export type DraftWorkout = {
  id: string;
  date: string;
  createdAt: string;
  type: WorkoutType;
  exercises: DraftExercise[];
};
