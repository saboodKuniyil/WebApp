
import { getProjectById, getTasksByProjectId, getTaskBlueprints as fetchTaskBlueprints } from '@/lib/db';
import type { Project } from "@/components/project-management/projects-list";
import type { Task } from "@/components/project-management/tasks-list";
import type { TaskBlueprint } from '@/components/project-management/task-blueprints-list';
import { notFound } from 'next/navigation';
import { ProjectDetailView } from '@/components/project-management/project-detail-view';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

async function getProject(id: string): Promise<Project | undefined> {
  return await getProjectById(id);
}

async function getProjectTasks(projectId: string): Promise<Task[]> {
  return await getTasksByProjectId(projectId);
}

async function getTaskBlueprints(): Promise<TaskBlueprint[]> {
  return await fetchTaskBlueprints();
}

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const project = await getProject(params.id);
  
  if (!project) {
    notFound();
  }

  const tasks = await getProjectTasks(project.id);
  const taskBlueprints = await getTaskBlueprints();

  return (
    <main className="flex-1 space-y-4 p-2 md:p-4 pt-4">
      <div className="flex items-center justify-between space-y-2">
         <Button asChild variant="outline" size="sm">
            <Link href="/project-management/projects">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Projects
            </Link>
        </Button>
      </div>
      <ProjectDetailView project={project} tasks={tasks} taskBlueprints={taskBlueprints} />
    </main>
  );
}
