
import { ProjectsList } from "@/components/project-management/projects-list";
import db from '@/lib/db';
import type { Project } from "@/components/project-management/projects-list";
import { unstable_noStore as noStore } from 'next/cache';

async function getProjects(): Promise<Project[]> {
  noStore();
  try {
    // Attempt to connect to the database and fetch projects
    const [rows] = await db.query("SELECT id, title, description, status, manager, customer, DATE_FORMAT(startDate, '%Y-%m-%d') as startDate, DATE_FORMAT(endDate, '%Y-%m-%d') as endDate FROM projects");
    // The library returns a strange type, so we need to cast it
    return rows as Project[];
  } catch (error) {
    // Log the error for debugging, but don't let it crash the page
    console.error('Database connection failed:', error);
    // In case of an error (like ECONNREFUSED), return an empty array
    // This allows the page to render without a database connection.
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
