
import { ProjectsList } from "@/components/project-management/projects-list";
import db from '@/lib/db';
import type { Project } from "@/components/project-management/projects-list";
import { unstable_noStore as noStore } from 'next/cache';

async function getProjects(): Promise<Project[]> {
  noStore();
  try {
    const [rows] = await db.query('SELECT id, title, status, manager, DATE_FORMAT(deadline, \'%Y-%m-%d\') as deadline FROM projects');
    // The library returns a strange type, so we need to cast it
    return rows as Project[];
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    // In case of an error, return an empty array
    return [];
  }
}

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
       <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Projects</h1>
      </div>
      <ProjectsList data={projects} />
    </main>
  );
}
