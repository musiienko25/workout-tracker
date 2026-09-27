import { ProgramPlan, ProgramPlanFallback } from "@/components/workout/program-plan";
import { isWorkoutType } from "@/lib/exercises";

export default async function ProgramPlanPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  if (!isWorkoutType(type)) return <ProgramPlanFallback />;
  return <ProgramPlan type={type} />;
}
