import type { Exercise, WorkoutType } from "@/types/exercise";

export const WORKOUT_TYPE_ORDER: WorkoutType[] = [
  "chest_arms",
  "legs_shoulders",
  "back_core",
];

export const WORKOUT_TYPE_META: Record<
  WorkoutType,
  { label: string; description: string }
> = {
  chest_arms: {
    label: "Груди, руки",
    description: "Груди, біцепс, трицепс",
  },
  legs_shoulders: {
    label: "Ноги, плечі",
    description: "Квадрицепс, задній ланцюг, дельти",
  },
  back_core: {
    label: "Спина, прес",
    description: "Тяги і корпус",
  },
};

export const exercises: Exercise[] = [
  {
    id: "incline-lever-chest-press",
    name: "Incline Lever Chest Press",
    nameUk: "жим у важільному тренажері під нахилом",
    workoutType: "chest_arms",
  },
  {
    id: "chest-fly-machine",
    name: "Chest Fly Machine",
    nameUk: "тренажер для зведення рук на груди",
    workoutType: "chest_arms",
  },
  {
    id: "seated-barbell-biceps-curl",
    name: "Seated Barbell Biceps Curl",
    nameUk: "підйом штанги на біцепс сидячи",
    workoutType: "chest_arms",
  },
  {
    id: "triceps-rope-pushdown",
    name: "Triceps Rope Pushdown",
    nameUk: "розгинання рук на трицепс із канатом у верхньому блоці",
    workoutType: "chest_arms",
  },
  {
    id: "captains-chair-leg-raise",
    name: "Captain’s Chair Leg Raise",
    nameUk: "підйом ніг у упорі на брусах",
    workoutType: "chest_arms",
  },
  {
    id: "push-ups",
    name: "Push-Ups",
    nameUk: "віджимання від підлоги",
    workoutType: "chest_arms",
  },
  {
    id: "standing-calf-raise-kettlebell",
    name: "Standing Calf Raise with Kettlebell",
    nameUk: "підйом на носки з гирею",
    workoutType: "chest_arms",
  },

  {
    id: "squat",
    name: "Squat",
    nameUk: "присідання",
    workoutType: "legs_shoulders",
  },
  {
    id: "romanian-deadlift",
    name: "Romanian Deadlift",
    nameUk: "румунська тяга",
    workoutType: "legs_shoulders",
  },
  {
    id: "leg-press",
    name: "Leg Press",
    nameUk: "жим ногами",
    workoutType: "legs_shoulders",
  },
  {
    id: "leg-curl",
    name: "Leg Curl",
    nameUk: "згинання ніг",
    workoutType: "legs_shoulders",
  },
  {
    id: "calf-raises",
    name: "Calf Raises",
    nameUk: "підйом на носки",
    workoutType: "legs_shoulders",
  },
  {
    id: "shoulder-press",
    name: "Shoulder Press",
    nameUk: "жим плечей",
    workoutType: "legs_shoulders",
  },
  {
    id: "lateral-raises",
    name: "Lateral Raises",
    nameUk: "розведення в сторони",
    workoutType: "legs_shoulders",
  },

  {
    id: "pull-ups",
    name: "Pull Ups",
    nameUk: "підтягування",
    workoutType: "back_core",
  },
  {
    id: "lat-pulldown",
    name: "Lat Pulldown",
    nameUk: "тяга верхнього блоку",
    workoutType: "back_core",
  },
  {
    id: "barbell-row",
    name: "Barbell Row",
    nameUk: "тяга штанги в нахилі",
    workoutType: "back_core",
  },
  {
    id: "seated-cable-row",
    name: "Seated Cable Row",
    nameUk: "тяга горизонтального блоку",
    workoutType: "back_core",
  },
  {
    id: "face-pull",
    name: "Face Pull",
    nameUk: "розведення на задню дельту",
    workoutType: "back_core",
  },
  {
    id: "hanging-leg-raise",
    name: "Hanging Leg Raise",
    nameUk: "підйом ніг у висі",
    workoutType: "back_core",
  },
  {
    id: "plank",
    name: "Plank",
    nameUk: "планка",
    workoutType: "back_core",
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

export function normalizeWorkoutType(value: unknown): WorkoutType | null {
  if (value === "full") return "chest_arms";
  if (value === "chest_arms" || value === "legs_shoulders" || value === "back_core") {
    return value;
  }
  return null;
}

export function isWorkoutType(value: unknown): value is WorkoutType {
  return normalizeWorkoutType(value) !== null;
}

export function getWorkoutTypeLabel(type: string): string {
  const normalized = normalizeWorkoutType(type);
  return normalized ? WORKOUT_TYPE_META[normalized].label : type;
}

export function getWorkoutTypeMeta(type: string) {
  const normalized = normalizeWorkoutType(type);
  return normalized ? WORKOUT_TYPE_META[normalized] : { label: type, description: "" };
}
