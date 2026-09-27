import type { Exercise, WorkoutType } from "@/types/exercise";

export const WORKOUT_TYPE_ORDER: WorkoutType[] = ["full"];

export const WORKOUT_TYPE_META: Record<
  WorkoutType,
  { label: string; description: string }
> = {
  full: {
    label: "Груди, біцепс, трицепс",
    description: "Повний день",
  },
};

export const exercises: Exercise[] = [
  {
    id: "incline-lever-chest-press",
    name: "Incline Lever Chest Press",
    nameUk: "жим у важільному тренажері під нахилом",
    workoutType: "full",
  },
  {
    id: "chest-fly-machine",
    name: "Chest Fly Machine",
    nameUk: "тренажер для зведення рук на груди",
    workoutType: "full",
  },
  {
    id: "seated-barbell-biceps-curl",
    name: "Seated Barbell Biceps Curl",
    nameUk: "підйом штанги на біцепс сидячи",
    workoutType: "full",
  },
  {
    id: "triceps-rope-pushdown",
    name: "Triceps Rope Pushdown",
    nameUk: "розгинання рук на трицепс із канатом у верхньому блоці",
    workoutType: "full",
  },
  {
    id: "captains-chair-leg-raise",
    name: "Captain’s Chair Leg Raise",
    nameUk: "підйом ніг у упорі на брусах",
    workoutType: "full",
  },
  {
    id: "push-ups",
    name: "Push-Ups",
    nameUk: "віджимання від підлоги",
    workoutType: "full",
  },
  {
    id: "standing-calf-raise-kettlebell",
    name: "Standing Calf Raise with Kettlebell",
    nameUk: "підйом на носки з гирею",
    workoutType: "full",
  },
];

const exercisesById = new Map(exercises.map((exercise) => [exercise.id, exercise]));

export function getExerciseById(id: string): Exercise | undefined {
  return exercisesById.get(id);
}

export function getExerciseName(id: string): string {
  return exercisesById.get(id)?.name ?? "Unknown exercise";
}

export function getExerciseNameUk(id: string): string | undefined {
  return exercisesById.get(id)?.nameUk;
}

export function getExercisesByType(type: WorkoutType): Exercise[] {
  return exercises.filter((exercise) => exercise.workoutType === type);
}

export function isWorkoutType(value: unknown): value is WorkoutType {
  return value === "full";
}
