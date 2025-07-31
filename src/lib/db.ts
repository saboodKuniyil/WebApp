import fs from 'fs/promises';
import path from 'path';
import type { Project } from '@/components/project-management/projects-list';

const dbPath = path.join(process.cwd(), 'src', 'lib', 'db.json');

type DbData = {
  projects: Project[];
};

async function readDb(): Promise<DbData> {
  try {
    const data = await fs.readFile(dbPath, 'utf-8');
    return JSON.parse(data) as DbData;
  } catch (error) {
    if (error.code === 'ENOENT') {
      // If the file doesn't exist, return a default structure
      return { projects: [] };
    }
    throw error;
  }
}

async function writeDb(data: DbData): Promise<void> {
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf-8');
}

export const db = {
  getProjects: async (): Promise<Project[]> => {
    const data = await readDb();
    return data.projects || [];
  },
  createProject: async (newProject: Project): Promise<void> => {
    const data = await readDb();
    data.projects.push(newProject);
    await writeDb(data);
  },
};

export default db;
