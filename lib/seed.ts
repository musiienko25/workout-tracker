import type { WorkoutType } from "@/types/exercise";
import type { Workout, WorkoutExercise, WorkoutSet } from "@/types/workout";

function sets(prefix: string, pairs: Array<[number, number]>): WorkoutSet[] {
  return pairs.map(([weight, reps], index) => ({
    id: `${prefix}-${index + 1}`,
    weight,
    reps,
  }));
}

function exercise(
  exerciseId: string,
  prefix: string,
  pairs: Array<[number, number]>,
): WorkoutExercise {
  return {
    exerciseId,
    sets: sets(`${prefix}-${exerciseId}`, pairs),
  };
}

function workout(
  id: string,
  date: string,
  type: WorkoutType,
  exercises: WorkoutExercise[],
): Workout {
  return {
    id,
    date,
    createdAt: `${date}T17:00:00.000Z`,
    type,
    exercises,
    completed: true,
  };
}

function day(
  prefix: string,
  order: string[],
  values: Record<string, Array<[number, number]>>,
): WorkoutExercise[] {
  return order.map((exerciseId) => exercise(exerciseId, prefix, values[exerciseId]));
}

const chestArms = [
  "incline-lever-chest-press",
  "chest-fly-machine",
  "seated-barbell-biceps-curl",
  "triceps-rope-pushdown",
  "captains-chair-leg-raise",
  "push-ups",
  "standing-calf-raise-kettlebell",
];

const legsShoulders = [
  "squat",
  "romanian-deadlift",
  "leg-press",
  "leg-curl",
  "calf-raises",
  "shoulder-press",
  "lateral-raises",
];

const backCore = [
  "pull-ups",
  "lat-pulldown",
  "barbell-row",
  "seated-cable-row",
  "face-pull",
  "hanging-leg-raise",
  "plank",
];

/** Completed sessions so previous-set lookup works on first launch. */
export const seedWorkouts: Workout[] = [
  workout(
    "seed-full-2026-09-19",
    "2026-09-19",
    "chest_arms",
    day("seed-full-0919", chestArms, {
      "incline-lever-chest-press": [
        [55, 10],
        [55, 8],
        [50, 10],
      ],
      "chest-fly-machine": [
        [35, 12],
        [35, 10],
        [30, 12],
      ],
      "seated-barbell-biceps-curl": [
        [22.5, 10],
        [20, 8],
        [20, 10],
      ],
      "triceps-rope-pushdown": [
        [22.5, 12],
        [20, 12],
        [20, 10],
      ],
      "captains-chair-leg-raise": [
        [0, 12],
        [0, 10],
        [0, 10],
      ],
      "push-ups": [
        [0, 15],
        [0, 12],
        [0, 10],
      ],
      "standing-calf-raise-kettlebell": [
        [16, 15],
        [16, 12],
        [12, 15],
      ],
    }),
  ),
  workout(
    "seed-full-2026-09-23",
    "2026-09-23",
    "chest_arms",
    day("seed-full-0923", chestArms, {
      "incline-lever-chest-press": [
        [60, 10],
        [55, 8],
        [55, 8],
      ],
      "chest-fly-machine": [
        [40, 12],
        [35, 12],
        [35, 10],
      ],
      "seated-barbell-biceps-curl": [
        [25, 10],
        [22.5, 8],
        [20, 10],
      ],
      "triceps-rope-pushdown": [
        [25, 12],
        [22.5, 12],
        [20, 12],
      ],
      "captains-chair-leg-raise": [
        [0, 15],
        [0, 12],
        [0, 12],
      ],
      "push-ups": [
        [0, 18],
        [0, 15],
        [0, 12],
      ],
      "standing-calf-raise-kettlebell": [
        [16, 15],
        [16, 15],
        [16, 12],
      ],
    }),
  ),
  workout(
    "seed-legs-2026-09-20",
    "2026-09-20",
    "legs_shoulders",
    day("seed-legs-0920", legsShoulders, {
      squat: [
        [80, 6],
        [80, 6],
        [70, 8],
      ],
      "romanian-deadlift": [
        [70, 8],
        [70, 8],
        [60, 10],
      ],
      "leg-press": [
        [140, 10],
        [140, 10],
        [120, 12],
      ],
      "leg-curl": [
        [35, 12],
        [35, 10],
        [30, 12],
      ],
      "calf-raises": [
        [40, 15],
        [40, 12],
        [30, 15],
      ],
      "shoulder-press": [
        [30, 8],
        [30, 8],
        [25, 10],
      ],
      "lateral-raises": [
        [8, 12],
        [8, 12],
        [6, 15],
      ],
    }),
  ),
  workout(
    "seed-legs-2026-09-25",
    "2026-09-25",
    "legs_shoulders",
    day("seed-legs-0925", legsShoulders, {
      squat: [
        [85, 5],
        [80, 6],
        [75, 8],
      ],
      "romanian-deadlift": [
        [75, 8],
        [70, 8],
        [70, 8],
      ],
      "leg-press": [
        [150, 10],
        [140, 10],
        [140, 12],
      ],
      "leg-curl": [
        [40, 10],
        [35, 12],
        [35, 10],
      ],
      "calf-raises": [
        [45, 15],
        [40, 12],
        [40, 12],
      ],
      "shoulder-press": [
        [32.5, 8],
        [30, 8],
        [30, 8],
      ],
      "lateral-raises": [
        [10, 12],
        [8, 12],
        [8, 12],
      ],
    }),
  ),
  workout(
    "seed-back-2026-09-18",
    "2026-09-18",
    "back_core",
    day("seed-back-0918", backCore, {
      "pull-ups": [
        [0, 6],
        [0, 5],
        [0, 4],
      ],
      "lat-pulldown": [
        [50, 10],
        [50, 8],
        [45, 10],
      ],
      "barbell-row": [
        [50, 8],
        [50, 8],
        [45, 10],
      ],
      "seated-cable-row": [
        [45, 10],
        [45, 10],
        [40, 12],
      ],
      "face-pull": [
        [15, 15],
        [15, 12],
        [12.5, 15],
      ],
      "hanging-leg-raise": [
        [0, 10],
        [0, 8],
        [0, 8],
      ],
      plank: [
        [0, 40],
        [0, 30],
        [0, 30],
      ],
    }),
  ),
  workout(
    "seed-back-2026-09-24",
    "2026-09-24",
    "back_core",
    day("seed-back-0924", backCore, {
      "pull-ups": [
        [0, 8],
        [0, 6],
        [0, 5],
      ],
      "lat-pulldown": [
        [55, 10],
        [50, 8],
        [50, 8],
      ],
      "barbell-row": [
        [55, 8],
        [50, 8],
        [50, 8],
      ],
      "seated-cable-row": [
        [50, 10],
        [45, 10],
        [45, 12],
      ],
      "face-pull": [
        [17.5, 15],
        [15, 12],
        [15, 12],
      ],
      "hanging-leg-raise": [
        [0, 12],
        [0, 10],
        [0, 8],
      ],
      plank: [
        [0, 45],
        [0, 40],
        [0, 30],
      ],
    }),
  ),
];
