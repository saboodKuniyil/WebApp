
import { TasksList } from "@/components/project-management/tasks-list";

export default function TasksPage() {
  return (
    <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
       <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Tasks</h1>
      </div>
      <TasksList />
    </main>
  );
}
