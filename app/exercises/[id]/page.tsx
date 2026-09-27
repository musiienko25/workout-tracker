import { ExerciseHistory } from "@/components/exercises/exercise-history";

export default async function ExerciseHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ExerciseHistory id={id} />;
}
