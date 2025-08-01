
import { TasksList } from "@/components/project-management/tasks-list";
import { getTasks as fetchTasks, getProjects as fetchProjects, getTaskBlueprints as fetchTaskBlueprints } from '@/lib/db';
import type { Task } from "@/components/project-management/tasks-list";
import type { Project } from "@/components/project-management/projects-list";
import type { TaskBlueprint } from "@/components/project-management/task-blueprints-list";

async function getTasks(): Promise<Task[]> {
    const tasks = await fetchTasks();
    return tasks;
}

async function getProjects(): Promise<Project[]> {
    const projects = await fetchProjects();
    return projects;
}

async function getTaskBlueprints(): Promise<TaskBlueprint[]> {
    const blueprints = await fetchTaskBlueprints();
    return blueprints;
}


export default async function TasksPage() {
  const tasks = await getTasks();
  const projects = await getProjects();
  const taskBlueprints = await getTaskBlueprints();

  return (
    <main className="flex-1 space-y-4 p-2 md:p-4 pt-4">
       <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Tasks</h1>
      </div>
      <TasksList data={tasks} projects={projects} taskBlueprints={taskBlueprints} />
    </main>
  );
}
