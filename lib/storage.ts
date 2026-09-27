import {
  getDefaultTemplateIds,
  isExerciseRecord,
  normalizeWorkoutType,
} from "@/lib/exercises";
import { seedWorkouts } from "@/lib/seed";
import { supabase } from "@/lib/supabase";
import type { Exercise, ProgramTemplates, WorkoutType } from "@/types/exercise";
import type { DraftWorkout, Workout, WorkoutSet } from "@/types/workout";

export const LIBRARY_ROW_ID = "__library__";

/**
 * Persistence boundary for the workout diary.
 * UI reads this through `useWorkoutStore` and writes through these functions.
 */

export type StoreSnapshot = {
  ready: boolean;
  userId: string | null;
  setupNeeded: boolean;
  error: string | null;
  workouts: Workout[];
  drafts: DraftWorkout[];
  customExercises: Exercise[];
  templates: ProgramTemplates;
};

type WorkoutRow = {
  user_id: string;
  id: string;
  date: string;
  created_at: string;
  type: string;
  completed: boolean;
  exercises: unknown;
};

const SERVER_SNAPSHOT: StoreSnapshot = {
  ready: false,
  userId: null,
  setupNeeded: false,
  error: null,
  workouts: [],
  drafts: [],
  customExercises: [],
  templates: {},
};

let clientSnapshot: StoreSnapshot = SERVER_SNAPSHOT;
const listeners = new Set<() => void>();
let authBound = false;
let hydrateToken = 0;

function emitChange(): void {
  for (const listener of listeners) listener();
}

function setSnapshot(next: StoreSnapshot): void {
  clientSnapshot = next;
  emitChange();
}

function isWorkoutSet(value: unknown): value is WorkoutSet {
  if (!value || typeof value !== "object") return false;
  const set = value as WorkoutSet;
  return (
    typeof set.id === "string" &&
    typeof set.weight === "number" &&
    Number.isFinite(set.weight) &&
    typeof set.reps === "number" &&
    Number.isFinite(set.reps)
  );
}

function isWorkout(value: unknown): value is Workout {
  if (!value || typeof value !== "object") return false;
  const workout = value as Workout;
  return (
    typeof workout.id === "string" &&
    typeof workout.date === "string" &&
    typeof workout.createdAt === "string" &&
    normalizeWorkoutType(workout.type) !== null &&
    typeof workout.completed === "boolean" &&
    Array.isArray(workout.exercises) &&
    workout.exercises.every(
      (exercise) =>
        exercise &&
        typeof exercise.exerciseId === "string" &&
        Array.isArray(exercise.sets) &&
        exercise.sets.every(isWorkoutSet),
    )
  );
}

function isDraft(value: unknown): value is DraftWorkout {
  if (!value || typeof value !== "object") return false;
  const draft = value as DraftWorkout;
  return (
    typeof draft.id === "string" &&
    typeof draft.date === "string" &&
    typeof draft.createdAt === "string" &&
    normalizeWorkoutType(draft.type) !== null &&
    Array.isArray(draft.exercises) &&
    draft.exercises.every(
      (exercise) =>
        exercise &&
        typeof exercise.exerciseId === "string" &&
        Array.isArray(exercise.sets) &&
        exercise.sets.every(
          (set) =>
            set &&
            typeof set.id === "string" &&
            typeof set.weight === "string" &&
            typeof set.reps === "string",
        ),
    )
  );
}

function rowToWorkout(row: WorkoutRow): Workout | null {
  const type = normalizeWorkoutType(row.type);
  if (!type) return null;
  const workout = {
    id: row.id,
    date: row.date,
    createdAt: row.created_at,
    type,
    completed: true,
    exercises: row.exercises,
  };
  return isWorkout(workout) ? workout : null;
}

function rowToDraft(row: WorkoutRow): DraftWorkout | null {
  const type = normalizeWorkoutType(row.type);
  if (!type) return null;
  const draft = {
    id: row.id,
    date: row.date,
    createdAt: row.created_at,
    type,
    exercises: row.exercises,
  };
  return isDraft(draft) ? draft : null;
}

function splitRows(rows: WorkoutRow[]): { workouts: Workout[]; drafts: DraftWorkout[] } {
  const workouts: Workout[] = [];
  const drafts: DraftWorkout[] = [];
  for (const row of rows) {
    if (row.id === LIBRARY_ROW_ID) continue;
    if (row.completed) {
      const workout = rowToWorkout(row);
      if (workout) workouts.push(workout);
    } else {
      const draft = rowToDraft(row);
      if (draft) drafts.push(draft);
    }
  }
  return { workouts, drafts };
}

function parseTemplates(value: unknown): ProgramTemplates {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const templates: ProgramTemplates = {};
  for (const type of ["chest_arms", "legs_shoulders", "back_core"] as const) {
    const ids = (value as ProgramTemplates)[type];
    if (Array.isArray(ids) && ids.every((id) => typeof id === "string")) {
      templates[type] = ids.filter((id) => id.length > 0);
    }
  }
  return templates;
}

function parseLibrary(rows: WorkoutRow[]): Pick<StoreSnapshot, "customExercises" | "templates"> {
  const row = rows.find((item) => item.id === LIBRARY_ROW_ID);
  if (!row || !row.exercises || typeof row.exercises !== "object" || Array.isArray(row.exercises)) {
    return { customExercises: [], templates: {} };
  }
  const payload = row.exercises as { customExercises?: unknown; templates?: unknown };
  const customExercises = Array.isArray(payload.customExercises)
    ? payload.customExercises.filter(isExerciseRecord).map((exercise) => ({
        ...exercise,
        custom: true,
        nameUk: exercise.nameUk ?? "",
      }))
    : [];
  return { customExercises, templates: parseTemplates(payload.templates) };
}

function isMissingTable(error: { message?: string; code?: string } | null): boolean {
  if (!error) return false;
  const message = error.message ?? "";
  return (
    error.code === "PGRST205" ||
    error.code === "42P01" ||
    message.includes("Could not find the table") ||
    message.includes("does not exist")
  );
}

function requireUserId(): string {
  if (!clientSnapshot.userId) {
    throw new Error("Sign in to save workouts.");
  }
  return clientSnapshot.userId;
}

function workoutToRow(userId: string, workout: Workout): WorkoutRow {
  return {
    user_id: userId,
    id: workout.id,
    date: workout.date,
    created_at: workout.createdAt,
    type: workout.type,
    completed: true,
    exercises: workout.exercises,
  };
}

function draftToRow(userId: string, draft: DraftWorkout): WorkoutRow {
  return {
    user_id: userId,
    id: draft.id,
    date: draft.date,
    created_at: draft.createdAt,
    type: draft.type,
    completed: false,
    exercises: draft.exercises,
  };
}

async function upsertRow(row: WorkoutRow): Promise<void> {
  const { error } = await supabase.from("workouts").upsert(row, { onConflict: "user_id,id" });
  if (error) {
    console.error(error);
    setSnapshot({ ...clientSnapshot, error: error.message, setupNeeded: isMissingTable(error) });
  }
}

async function seedIfEmpty(userId: string, rows: WorkoutRow[]): Promise<WorkoutRow[]> {
  const existingIds = new Set(rows.map((row) => row.id));
  const missing = seedWorkouts.filter(
    (workout) => workout.id !== LIBRARY_ROW_ID && !existingIds.has(workout.id),
  );
  if (missing.length === 0) return rows;
  const seeded = missing.map((workout) => workoutToRow(userId, workout));
  const { error } = await supabase.from("workouts").upsert(seeded, { onConflict: "user_id,id" });
  if (error) {
    console.error(error);
    return rows;
  }
  return [...seeded, ...rows];
}

async function hydrate(userId: string | null): Promise<void> {
  const token = ++hydrateToken;
  if (!userId) {
    setSnapshot({
      ready: true,
      userId: null,
      setupNeeded: false,
      error: null,
      workouts: [],
      drafts: [],
      customExercises: [],
      templates: {},
    });
    return;
  }

  setSnapshot({
    ...clientSnapshot,
    ready: false,
    userId,
    error: null,
  });

  const { data, error } = await supabase
    .from("workouts")
    .select("user_id,id,date,created_at,type,completed,exercises")
    .eq("user_id", userId);

  if (token !== hydrateToken) return;

  if (error) {
    setSnapshot({
      ready: true,
      userId,
      setupNeeded: isMissingTable(error),
      error: error.message,
      workouts: [],
      drafts: [],
      customExercises: [],
      templates: {},
    });
    return;
  }

  const rows = await seedIfEmpty(userId, (data ?? []) as WorkoutRow[]);
  if (token !== hydrateToken) return;
  const { workouts, drafts } = splitRows(rows);
  const library = parseLibrary(rows);
  setSnapshot({
    ready: true,
    userId,
    setupNeeded: false,
    error: null,
    workouts,
    drafts,
    customExercises: library.customExercises,
    templates: library.templates,
  });
}

export function bindAuthToStore(): () => void {
  if (authBound) return () => undefined;
  authBound = true;

  void supabase.auth.getSession().then(
    ({ data }) => {
      void hydrate(data.session?.user.id ?? null);
    },
    () => {
      void hydrate(null);
    },
  );

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === "INITIAL_SESSION") return;
    void hydrate(session?.user.id ?? null);
  });

  return () => {
    subscription.unsubscribe();
    authBound = false;
  };
}

export function subscribeToStore(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getClientSnapshot(): StoreSnapshot {
  return clientSnapshot;
}

export function getServerSnapshot(): StoreSnapshot {
  return SERVER_SNAPSHOT;
}

export function getWorkouts(): Workout[] {
  return clientSnapshot.workouts;
}

export function getWorkoutById(id: string): Workout | null {
  return getWorkouts().find((workout) => workout.id === id) ?? null;
}

export function saveWorkout(workout: Workout): void {
  const userId = requireUserId();
  const workouts = [
    workout,
    ...clientSnapshot.workouts.filter((item) => item.id !== workout.id),
  ];
  const drafts = clientSnapshot.drafts.filter((item) => item.id !== workout.id);
  setSnapshot({ ...clientSnapshot, workouts, drafts, error: null });
  void upsertRow(workoutToRow(userId, workout));
}

export function saveLibrary(next: {
  customExercises?: Exercise[];
  templates?: ProgramTemplates;
}): void {
  const userId = requireUserId();
  const customExercises = next.customExercises ?? clientSnapshot.customExercises;
  const templates = next.templates ?? clientSnapshot.templates;
  setSnapshot({ ...clientSnapshot, customExercises, templates, error: null });
  void upsertRow({
    user_id: userId,
    id: LIBRARY_ROW_ID,
    date: "1970-01-01",
    created_at: new Date().toISOString(),
    type: "library",
    completed: true,
    exercises: { customExercises, templates },
  });
}

function templateIdsFor(type: WorkoutType): string[] {
  return clientSnapshot.templates[type] ?? getDefaultTemplateIds(type);
}

export function addCustomExercise(exercise: Omit<Exercise, "custom">): Exercise {
  const created: Exercise = { ...exercise, custom: true, nameUk: exercise.nameUk.trim() };
  const customExercises = [
    created,
    ...clientSnapshot.customExercises.filter((item) => item.id !== created.id),
  ];
  const currentIds = templateIdsFor(created.workoutType);
  const templates: ProgramTemplates = {
    ...clientSnapshot.templates,
    [created.workoutType]: currentIds.includes(created.id)
      ? currentIds
      : [...currentIds, created.id],
  };
  saveLibrary({ customExercises, templates });
  return created;
}

export function removeCustomExercise(id: string): void {
  const customExercises = clientSnapshot.customExercises.filter((exercise) => exercise.id !== id);
  const templates: ProgramTemplates = { ...clientSnapshot.templates };
  for (const type of ["chest_arms", "legs_shoulders", "back_core"] as const) {
    const ids = templateIdsFor(type).filter((exerciseId) => exerciseId !== id);
    templates[type] = ids;
  }
  saveLibrary({ customExercises, templates });
}

export function setProgramTemplate(type: WorkoutType, ids: string[]): void {
  saveLibrary({
    templates: {
      ...clientSnapshot.templates,
      [type]: ids,
    },
  });
}

export function deleteWorkout(id: string): void {
  if (id === LIBRARY_ROW_ID) return;
  const userId = requireUserId();
  setSnapshot({
    ...clientSnapshot,
    workouts: clientSnapshot.workouts.filter((workout) => workout.id !== id),
    error: null,
  });
  void supabase.from("workouts").delete().eq("user_id", userId).eq("id", id).then(({ error }) => {
    if (error) {
      console.error(error);
      setSnapshot({ ...clientSnapshot, error: error.message });
    }
  });
}

export function getLastWorkoutForExercise(exerciseId: string): {
  workout: Workout;
  sets: WorkoutSet[];
} | null {
  const workouts = [...getWorkouts()].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    if (a.createdAt !== b.createdAt) return a.createdAt < b.createdAt ? 1 : -1;
    return 0;
  });

  for (const workout of workouts) {
    const entry = workout.exercises.find(
      (exercise) => exercise.exerciseId === exerciseId && exercise.sets.length > 0,
    );
    if (entry) return { workout, sets: entry.sets };
  }

  return null;
}

export function getDrafts(): DraftWorkout[] {
  return clientSnapshot.drafts;
}

export function getDraftById(id: string): DraftWorkout | null {
  return getDrafts().find((draft) => draft.id === id) ?? null;
}

export function getDraftByType(type: WorkoutType): DraftWorkout | null {
  return (
    getDrafts()
      .filter((draft) => draft.type === type)
      .sort((a, b) => {
        if (a.date !== b.date) return a.date < b.date ? 1 : -1;
        if (a.createdAt !== b.createdAt) return a.createdAt < b.createdAt ? 1 : -1;
        return 0;
      })[0] ?? null
  );
}

export function saveDraft(draft: DraftWorkout): void {
  const userId = requireUserId();
  const drafts = [draft, ...clientSnapshot.drafts.filter((item) => item.id !== draft.id)];
  setSnapshot({ ...clientSnapshot, drafts, error: null });
  void upsertRow(draftToRow(userId, draft));
}

export function deleteDraft(id: string): void {
  const userId = requireUserId();
  setSnapshot({
    ...clientSnapshot,
    drafts: clientSnapshot.drafts.filter((draft) => draft.id !== id),
    error: null,
  });
  void supabase
    .from("workouts")
    .delete()
    .eq("user_id", userId)
    .eq("id", id)
    .eq("completed", false)
    .then(({ error }) => {
      if (error) {
        console.error(error);
        setSnapshot({ ...clientSnapshot, error: error.message });
      }
    });
}
