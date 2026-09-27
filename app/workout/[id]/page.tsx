import { WorkoutSession } from "@/components/workout/workout-session";

export default async function WorkoutSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <WorkoutSession id={id} />;
}
