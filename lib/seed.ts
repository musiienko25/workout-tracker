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

/** Completed sessions so previous-set lookup works on first launch. */
export const seedWorkouts: Workout[] = [
  workout("seed-push-2026-09-19", "2026-09-19", "push", [
    exercise("bench-press", "seed-push-0919", [
      [77.5, 8],
      [77.5, 8],
      [75, 9],
    ]),
    exercise("incline-dumbbell-press", "seed-push-0919", [
      [26, 10],
      [26, 8],
      [24, 10],
    ]),
    exercise("shoulder-press", "seed-push-0919", [
      [40, 8],
      [40, 7],
      [37.5, 8],
    ]),
    exercise("lateral-raises", "seed-push-0919", [
      [8, 12],
      [8, 12],
      [8, 12],
    ]),
    exercise("triceps-pushdown", "seed-push-0919", [
      [25, 12],
      [25, 10],
      [22.5, 12],
    ]),
  ]),
  workout("seed-push-2026-09-23", "2026-09-23", "push", [
    exercise("bench-press", "seed-push-0923", [
      [80, 8],
      [80, 8],
      [75, 10],
    ]),
    exercise("incline-dumbbell-press", "seed-push-0923", [
      [28, 10],
      [28, 8],
      [26, 10],
    ]),
    exercise("shoulder-press", "seed-push-0923", [
      [40, 8],
      [40, 8],
      [37.5, 10],
    ]),
    exercise("lateral-raises", "seed-push-0923", [
      [10, 12],
      [10, 12],
      [8, 15],
    ]),
    exercise("triceps-pushdown", "seed-push-0923", [
      [27.5, 12],
      [25, 12],
      [25, 10],
    ]),
  ]),
  workout("seed-pull-2026-09-18", "2026-09-18", "pull", [
    exercise("pull-ups", "seed-pull-0918", [
      [5, 6],
      [5, 5],
      [5, 4],
    ]),
    exercise("lat-pulldown", "seed-pull-0918", [
      [50, 10],
      [50, 8],
      [45, 10],
    ]),
    exercise("barbell-row", "seed-pull-0918", [
      [60, 8],
      [60, 8],
      [55, 10],
    ]),
    exercise("seated-cable-row", "seed-pull-0918", [
      [45, 10],
      [45, 10],
      [40, 12],
    ]),
    exercise("biceps-curl", "seed-pull-0918", [
      [12.5, 10],
      [12.5, 8],
      [10, 12],
    ]),
  ]),
  workout("seed-pull-2026-09-24", "2026-09-24", "pull", [
    exercise("pull-ups", "seed-pull-0924", [
      [5, 8],
      [5, 6],
      [5, 5],
    ]),
    exercise("lat-pulldown", "seed-pull-0924", [
      [55, 10],
      [50, 8],
      [50, 8],
    ]),
    exercise("barbell-row", "seed-pull-0924", [
      [65, 8],
      [60, 8],
      [60, 8],
    ]),
    exercise("seated-cable-row", "seed-pull-0924", [
      [50, 10],
      [45, 10],
      [45, 12],
    ]),
    exercise("biceps-curl", "seed-pull-0924", [
      [14, 10],
      [12.5, 8],
      [12.5, 10],
    ]),
  ]),
  workout("seed-legs-2026-09-20", "2026-09-20", "legs", [
    exercise("squat", "seed-legs-0920", [
      [90, 6],
      [90, 6],
      [85, 8],
    ]),
    exercise("romanian-deadlift", "seed-legs-0920", [
      [80, 8],
      [80, 8],
      [75, 10],
    ]),
    exercise("leg-press", "seed-legs-0920", [
      [140, 10],
      [140, 10],
      [130, 12],
    ]),
    exercise("leg-curl", "seed-legs-0920", [
      [35, 12],
      [35, 10],
      [30, 12],
    ]),
    exercise("calf-raises", "seed-legs-0920", [
      [60, 12],
      [60, 12],
      [55, 15],
    ]),
  ]),
  workout("seed-legs-2026-09-25", "2026-09-25", "legs", [
    exercise("squat", "seed-legs-0925", [
      [95, 5],
      [90, 6],
      [90, 6],
    ]),
    exercise("romanian-deadlift", "seed-legs-0925", [
      [85, 8],
      [80, 8],
      [80, 8],
    ]),
    exercise("leg-press", "seed-legs-0925", [
      [150, 10],
      [140, 10],
      [140, 12],
    ]),
    exercise("leg-curl", "seed-legs-0925", [
      [40, 10],
      [35, 12],
      [35, 10],
    ]),
    exercise("calf-raises", "seed-legs-0925", [
      [70, 12],
      [60, 12],
      [60, 15],
    ]),
  ]),
];
