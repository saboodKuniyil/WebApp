
import { ProjectsList } from "@/components/project-management/projects-list";
import { getProjects as fetchProjects, getTasks as fetchTasks, getTaskBlueprints as fetchTaskBlueprints } from '@/lib/db';
import type { Project } from "@/components/project-management/projects-list";
import type { Task } from "@/components/project-management/tasks-list";
import type { TaskBlueprint } from "@/components/project-management/task-blueprints-list";

async function getProjects(): Promise<Project[]> {
  const projects = await fetchProjects();
  return projects;
}

async function getTasks(): Promise<Task[]> {
  const tasks = await fetchTasks();
  return tasks;
}

async function getTaskBlueprints(): Promise<TaskBlueprint[]> {
  const blueprints = await fetchTaskBlueprints();
  return blueprints;
}


export default async function ProjectsPage() {
  const projects = await getProjects();
  const tasks = await getTasks();
  const taskBlueprints = await getTaskBlueprints();

  return (
    <main className="flex-1 space-y-4 p-2 md:p-4 pt-4">
       <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Projects</h1>
      </div>
      <ProjectsList data={projects} tasks={tasks} taskBlueprints={taskBlueprints} />
    </main>
  );
}
