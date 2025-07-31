
'use server';

import fs from 'fs/promises';
import path from 'path';
import type { Project } from '@/components/project-management/projects-list';
import type { Task } from '@/components/project-management/tasks-list';
import type { Issue } from '@/components/project-management/issues-list';
import type { TaskBlueprint } from '@/components/project-management/task-blueprints-list';

const dbPath = path.join(process.cwd(), 'src', 'lib', 'db.json');

type DbData = {
  projects: Project[];
  tasks: Task[];
  issues: Issue[];
  taskBlueprints: TaskBlueprint[];
};

async function readDb(): Promise<DbData> {
  try {
    const data = await fs.readFile(dbPath, 'utf-8');
    return JSON.parse(data) as DbData;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // If the file doesn't exist, return a default structure
      return { projects: [], tasks: [], issues: [], taskBlueprints: [] };
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
  getProjectById: async (id: string): Promise<Project | undefined> => {
    const data = await readDb();
    return data.projects.find(p => p.id === id);
  },
  createProject: async (newProject: Project): Promise<void> => {
    const data = await readDb();
    data.projects.push(newProject);
    await writeDb(data);
  },
  updateProject: async (updatedProject: Project): Promise<void> => {
    const data = await readDb();
    const projectIndex = data.projects.findIndex(p => p.id === updatedProject.id);
    if (projectIndex !== -1) {
      data.projects[projectIndex] = updatedProject;
      await writeDb(data);
    } else {
      throw new Error(`Project with id ${updatedProject.id} not found.`);
    }
  },
  deleteProject: async (projectId: string): Promise<void> => {
    const data = await readDb();
    const projectIndex = data.projects.findIndex(p => p.id === projectId);
    if (projectIndex !== -1) {
      data.projects.splice(projectIndex, 1);
      // Optional: also delete tasks associated with this project
      data.tasks = data.tasks.filter(t => t.projectId !== projectId);
      await writeDb(data);
    } else {
      throw new Error(`Project with id ${projectId} not found.`);
    }
  },
  getTasks: async (): Promise<Task[]> => {
    const data = await readDb();
    return data.tasks || [];
  },
   getTaskById: async (id: string): Promise<Task | undefined> => {
    const data = await readDb();
    return (data.tasks || []).find(t => t.id === id);
  },
  getTasksByProjectId: async (projectId: string): Promise<Task[]> => {
    const data = await readDb();
    return (data.tasks || []).filter(t => t.projectId === projectId);
  },
  createTask: async (newTask: Task): Promise<void> => {
    const data = await readDb();
    if (!data.tasks) {
        data.tasks = [];
    }
    data.tasks.push(newTask);
    await writeDb(data);
  },
  updateTask: async (updatedTask: Partial<Task> & { id: string }): Promise<void> => {
    const data = await readDb();
    const taskIndex = data.tasks.findIndex(t => t.id === updatedTask.id);
    if (taskIndex !== -1) {
      data.tasks[taskIndex] = { ...data.tasks[taskIndex], ...updatedTask };
      await writeDb(data);
    } else {
      throw new Error(`Task with id ${updatedTask.id} not found.`);
    }
  },
  deleteTask: async (taskId: string): Promise<void> => {
    const data = await readDb();
    const taskIndex = data.tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      data.tasks.splice(taskIndex, 1);
      // Optional: also delete issues associated with this task
      data.issues = data.issues.filter(i => i.taskId !== taskId);
      await writeDb(data);
    } else {
      throw new Error(`Task with id ${taskId} not found.`);
    }
  },
  getIssues: async (): Promise<Issue[]> => {
    const data = await readDb();
    return data.issues || [];
  },
  getIssueById: async (id: string): Promise<Issue | undefined> => {
    const data = await readDb();
    return (data.issues || []).find(i => i.id === id);
  },
  getIssuesByTaskId: async (taskId: string): Promise<Issue[]> => {
    const data = await readDb();
    return (data.issues || []).filter(i => i.taskId === taskId);
  },
  createIssue: async (newIssue: Issue): Promise<void> => {
    const data = await readDb();
    if (!data.issues) {
      data.issues = [];
    }
    data.issues.push(newIssue);
    await writeDb(data);
  },
  getTaskBlueprints: async (): Promise<TaskBlueprint[]> => {
    const data = await readDb();
    return data.taskBlueprints || [];
  },
  createTaskBlueprint: async (newBlueprint: TaskBlueprint): Promise<void> => {
    const data = await readDb();
    if (!data.taskBlueprints) {
      data.taskBlueprints = [];
    }
    data.taskBlueprints.push(newBlueprint);
    await writeDb(data);
  },
};

export default db;
