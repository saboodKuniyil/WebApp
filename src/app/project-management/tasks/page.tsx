
import { TasksList } from "@/components/project-management/tasks-list";
import { db } from '@/lib/db';
import type { Task } from "@/components/project-management/tasks-list";
import type { Project } from "@/components/project-management/projects-list";
import { unstable_noStore as noStore } from 'next/cache';

async function getTasks(): Promise<Task[]> {
  noStore();
  try {
    const tasks = await db.getTasks();
    return tasks;
  } catch (error) {
    console.error('Failed to read database:', error);
    return [];
  }
}

async function getProjects(): Promise<Project[]> {
    noStore();
    try {
        const projects = await db.getProjects();
        return projects;
    } catch (error) {
        console.error('Failed to read database:', error);
        return [];
    }
}


export default async function TasksPage() {
  const tasks = await getTasks();
  const projects = await getProjects();

  return (
    <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
       <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Tasks</h1>
      </div>
      <TasksList data={tasks} projects={projects} />
    </main>
  );
}
