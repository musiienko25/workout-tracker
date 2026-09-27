export type WorkoutType = "push" | "pull" | "legs";

export type Exercise = {
  id: string;
  name: string;
  workoutType: WorkoutType;
};
