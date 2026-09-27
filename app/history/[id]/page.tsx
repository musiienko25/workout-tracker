import { WorkoutDetail } from "@/components/history/workout-detail";

export default async function HistoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <WorkoutDetail id={id} />;
}
