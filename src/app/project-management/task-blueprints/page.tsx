
import { getTaskBlueprints as fetchTaskBlueprints } from '@/lib/db';
import { TaskBlueprintsList } from "@/components/project-management/task-blueprints-list";
import { unstable_noStore as noStore } from 'next/cache';
import type { TaskBlueprint } from '@/components/project-management/task-blueprints-list';

async function getTaskBlueprints(): Promise<TaskBlueprint[]> {
  noStore();
  return fetchTaskBlueprints();
}

export default async function TaskBlueprintsPage() {
  const blueprints = await getTaskBlueprints();
  
  return (
    <main className="flex-1 space-y-4 p-2 md:p-4 pt-4">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Task Blueprints</h1>
      </div>
      <TaskBlueprintsList data={blueprints} />
    </main>
  );
}
