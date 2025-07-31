
import { getTaskById, getProjects as fetchProjects, getIssuesByTaskId, getTaskBlueprints as fetchTaskBlueprints } from '@/lib/db';
import type { Task } from "@/components/project-management/tasks-list";
import type { Project } from "@/components/project-management/projects-list";
import type { Issue } from "@/components/project-management/issues-list";
import type { TaskBlueprint } from '@/components/project-management/task-blueprints-list';
import { unstable_noStore as noStore } from 'next/cache';
import { notFound } from 'next/navigation';
import { TaskDetailView } from '@/components/project-management/task-detail-view';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

async function getTask(id: string): Promise<Task | undefined> {
  noStore();
  return await getTaskById(id);
}

async function getProjects(): Promise<Project[]> {
    noStore();
    return await fetchProjects();
}

async function getIssues(taskId: string): Promise<Issue[]> {
    noStore();
    return await getIssuesByTaskId(taskId);
}

async function getTaskBlueprints(): Promise<TaskBlueprint[]> {
    noStore();
    return await fetchTaskBlueprints();
}

export default async function TaskDetailPage({ params }: { params: { id: string } }) {
  const task = await getTask(params.id);
  
  if (!task) {
    notFound();
  }
  
  const projects = await getProjects();
  const project = projects.find(p => p.id === task.projectId);
  const issues = await getIssues(task.id);
  const taskBlueprints = await getTaskBlueprints();

  return (
    <main className="flex-1 space-y-4 p-2 md:p-4 pt-4">
      <div className="flex items-center justify-between space-y-2">
         <Button asChild variant="outline" size="sm">
            <Link href="/project-management/tasks">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Tasks
            </Link>
        </Button>
      </div>
      <TaskDetailView task={task} project={project} issues={issues} projects={projects} taskBlueprints={taskBlueprints} />
    </main>
  );
}
