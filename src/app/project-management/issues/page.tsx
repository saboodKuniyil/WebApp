
import { IssuesList } from "@/components/project-management/issues-list";
import { getIssues, getTasks } from '@/lib/db';
import type { Issue } from "@/components/project-management/issues-list";
import type { Task } from "@/components/project-management/tasks-list";

async function fetchIssues(): Promise<Issue[]> {
    return getIssues();
}

async function fetchTasks(): Promise<Task[]> {
    return getTasks();
}

export default async function IssuesPage() {
  const issues = await fetchIssues();
  const tasks = await fetchTasks();

  return (
    <main className="flex-1 space-y-4 p-2 md:p-4 pt-4">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Issues</h1>
      </div>
      <IssuesList data={issues} tasks={tasks} />
    </main>
  );
}
