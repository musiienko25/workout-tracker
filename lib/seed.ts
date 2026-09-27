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
  type: Workout["type"],
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

const fullDay = (
  prefix: string,
  values: Record<string, Array<[number, number]>>,
): WorkoutExercise[] => [
  exercise("incline-lever-chest-press", prefix, values["incline-lever-chest-press"]),
  exercise("chest-fly-machine", prefix, values["chest-fly-machine"]),
  exercise("seated-barbell-biceps-curl", prefix, values["seated-barbell-biceps-curl"]),
  exercise("triceps-rope-pushdown", prefix, values["triceps-rope-pushdown"]),
  exercise("captains-chair-leg-raise", prefix, values["captains-chair-leg-raise"]),
  exercise("push-ups", prefix, values["push-ups"]),
  exercise("standing-calf-raise-kettlebell", prefix, values["standing-calf-raise-kettlebell"]),
];

/** Completed sessions so previous-set lookup works on first launch. */
export const seedWorkouts: Workout[] = [
  workout(
    "seed-full-2026-09-19",
    "2026-09-19",
    "full",
    fullDay("seed-full-0919", {
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
    "full",
    fullDay("seed-full-0923", {
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
];
