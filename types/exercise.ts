export type WorkoutType = "chest_arms" | "legs_shoulders" | "back_core";

export type Exercise = {
  id: string;
  name: string;
  nameUk: string;
  workoutType: WorkoutType;
  custom?: boolean;
};

export type ProgramTemplates = Partial<Record<WorkoutType, string[]>>;
