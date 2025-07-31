
'use server';

import fs from 'fs/promises';
import path from 'path';
import type { Project } from '@/components/project-management/projects-list';
import type { Task } from '@/components/project-management/tasks-list';
import type { Issue } from '@/components/project-management/issues-list';
import type { TaskBlueprint } from '@/components/project-management/task-blueprints-list';
import type { Product } from '@/components/purchase/products-list';
import type { ProductCategory } from '@/components/settings/product-preferences';

const dbPath = path.join(process.cwd(), 'src', 'lib', 'db.json');

type DbData = {
  projects: Project[];
  tasks: Task[];
  issues: Issue[];
  taskBlueprints: TaskBlueprint[];
  products: Product[];
  productCategories: ProductCategory[];
};

async function readDb(): Promise<DbData> {
  try {
    const data = await fs.readFile(dbPath, 'utf-8');
    return JSON.parse(data) as DbData;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // If the file doesn't exist, return a default structure
      return { projects: [], tasks: [], issues: [], taskBlueprints: [], products: [], productCategories: [] };
    }
    throw error;
  }
}

async function writeDb(data: DbData): Promise<void> {
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function getProjects(): Promise<Project[]>{
    const data = await readDb();
    return data.projects || [];
}

export async function getProjectById(id: string): Promise<Project | undefined> {
    const data = await readDb();
    return data.projects.find(p => p.id === id);
}

export async function createProject(newProject: Project): Promise<void> {
    const data = await readDb();
    data.projects.push(newProject);
    await writeDb(data);
}

export async function updateProject(updatedProject: Project): Promise<void> {
    const data = await readDb();
    const projectIndex = data.projects.findIndex(p => p.id === updatedProject.id);
    if (projectIndex !== -1) {
      data.projects[projectIndex] = updatedProject;
      await writeDb(data);
    } else {
      throw new Error(`Project with id ${updatedProject.id} not found.`);
    }
}

export async function deleteProject(projectId: string): Promise<void> {
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
}

export async function getTasks(): Promise<Task[]> {
    const data = await readDb();
    return data.tasks || [];
}

export async function getTaskById(id: string): Promise<Task | undefined> {
    const data = await readDb();
    return (data.tasks || []).find(t => t.id === id);
}

export async function getTasksByProjectId(projectId: string): Promise<Task[]> {
    const data = await readDb();
    return (data.tasks || []).filter(t => t.projectId === projectId);
}

export async function createTask(newTask: Task): Promise<void> {
    const data = await readDb();
    if (!data.tasks) {
        data.tasks = [];
    }
    data.tasks.push(newTask);
    await writeDb(data);
}

export async function updateTask(updatedTask: Partial<Task> & { id: string }): Promise<void> {
    const data = await readDb();
    const taskIndex = data.tasks.findIndex(t => t.id === updatedTask.id);
    if (taskIndex !== -1) {
      data.tasks[taskIndex] = { ...data.tasks[taskIndex], ...updatedTask };
      await writeDb(data);
    } else {
      throw new Error(`Task with id ${updatedTask.id} not found.`);
    }
}

export async function deleteTask(taskId: string): Promise<void> {
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
}

export async function getIssues(): Promise<Issue[]> {
    const data = await readDb();
    return data.issues || [];
}

export async function getIssueById(id: string): Promise<Issue | undefined> {
    const data = await readDb();
    return (data.issues || []).find(i => i.id === id);
}

export async function getIssuesByTaskId(taskId: string): Promise<Issue[]> {
    const data = await readDb();
    return (data.issues || []).filter(i => i.taskId === taskId);
}

export async function createIssue(newIssue: Issue): Promise<void> {
    const data = await readDb();
    if (!data.issues) {
      data.issues = [];
    }
    data.issues.push(newIssue);
    await writeDb(data);
}

export async function getTaskBlueprints(): Promise<TaskBlueprint[]> {
    const data = await readDb();
    return data.taskBlueprints || [];
}

export async function createTaskBlueprint(newBlueprint: TaskBlueprint): Promise<void> {
    const data = await readDb();
    if (!data.taskBlueprints) {
      data.taskBlueprints = [];
    }
    data.taskBlueprints.push(newBlueprint);
    await writeDb(data);
}

export async function getProducts(): Promise<Product[]> {
    const data = await readDb();
    return data.products || [];
}

export async function createProduct(newProduct: Product): Promise<void> {
    const data = await readDb();
    if (!data.products) {
      data.products = [];
    }
    data.products.push(newProduct);
    await writeDb(data);
}

export async function getProductCategories(): Promise<ProductCategory[]> {
    const data = await readDb();
    return data.productCategories || [];
}

export async function createProductCategory(newCategory: ProductCategory): Promise<void> {
    const data = await readDb();
    if (!data.productCategories) {
        data.productCategories = [];
    }
    data.productCategories.push(newCategory);
    await writeDb(data);
}
