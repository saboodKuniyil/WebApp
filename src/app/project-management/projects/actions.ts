
'use server';

import { z } from 'zod';
import { getProjects, createProject as createDbProject, updateProject as updateDbProject, deleteProject as deleteDbProject } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Project } from '@/components/project-management/projects-list';

const projectSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  manager: z.string().optional(),
  customer: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(['in-progress', 'completed', 'on-hold', 'canceled']).optional(),
  taskBlueprintId: z.string().optional(),
});

export type ProjectFormState = {
  message: string;
  errors?: {
    id?: string[];
    title?: string[];
    description?: string[];
    manager?: string[];
    customer?: string[];
    startDate?: string[];
    endDate?: string[];
    status?: string[];
    taskBlueprintId?: string[];
  };
};

export async function getNextProjectId(): Promise<string> {
    const projects = await getProjects();
    const prIds = projects
      .map(p => p.id)
      .filter(id => id.startsWith('PR_'))
      .map(id => parseInt(id.replace('PR_', ''), 10))
      .filter(num => !isNaN(num));

    if (prIds.length === 0) {
        return 'PR_9001';
    }

    const lastNumber = Math.max(...prIds);
    const nextNumber = lastNumber + 1;
    return `PR_${nextNumber}`;
}

export async function createProject(
  prevState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  const validatedFields = projectSchema.safeParse({
    id: formData.get('id'),
    title: formData.get('title'),
    description: formData.get('description'),
    manager: formData.get('manager'),
    customer: formData.get('customer'),
    startDate: formData.get('startDate'),
    endDate: formData.get('endDate'),
    status: formData.get('status'),
    taskBlueprintId: formData.get('taskBlueprintId'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Failed to create project.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { id, title, description, manager, customer, startDate, endDate, status, taskBlueprintId } = validatedFields.data;

  try {
     const projects = await getProjects();
     const idExists = projects.some(p => p.id === id);

     if (idExists) {
        return { message: 'Failed to create project. The Project ID already exists.' };
     }

    await createDbProject({
        id,
        title,
        description: description ?? '',
        manager: manager ?? 'Unassigned',
        customer: customer ?? 'N/A',
        startDate: startDate || new Date().toISOString(),
        endDate: endDate || new Date().toISOString(),
        status: status ?? 'in-progress',
        taskBlueprintId: taskBlueprintId ?? 'bp-1' // Default blueprint
    });

    revalidatePath('/project-management/projects');
    return { message: 'Project created successfully.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Failed to create project.' };
  }
}

const updateProjectSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  manager: z.string().min(1, 'Manager is required'),
  customer: z.string().min(1, 'Customer is required'),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid start date format",
  }),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid end date format",
  }),
  status: z.enum(['in-progress', 'completed', 'on-hold', 'canceled']),
  taskBlueprintId: z.string().min(1, 'Task Blueprint is required'),
});


export async function updateProject(
    prevState: ProjectFormState,
    formData: FormData
): Promise<ProjectFormState> {
    const validatedFields = updateProjectSchema.safeParse({
        id: formData.get('id'),
        title: formData.get('title'),
        description: formData.get('description'),
        manager: formData.get('manager'),
        customer: formData.get('customer'),
        startDate: formData.get('startDate'),
        endDate: formData.get('endDate'),
        status: formData.get('status'),
        taskBlueprintId: formData.get('taskBlueprintId'),
    });

    if (!validatedFields.success) {
        return {
            message: 'Failed to update project.',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { id, ...projectData } = validatedFields.data;

    try {
        await updateDbProject({
            id,
            ...projectData
        });

        revalidatePath(`/project-management/projects/${id}`);
        revalidatePath('/project-management/projects');
        return { message: 'Project updated successfully.' };
    } catch (error) {
        console.error('Database Error:', error);
        return { message: 'Failed to update project.' };
    }
}

export async function deleteProject(projectId: string): Promise<{ message: string }> {
    try {
        await deleteDbProject(projectId);
        revalidatePath('/project-management/projects');
        // This redirect will be caught by the try-catch block
        // but it will still work as expected.
        redirect('/project-management/projects');
    } catch (error: any) {
        if (error.message === 'NEXT_REDIRECT') {
            throw error;
        }
        console.error('Database Error:', error);
        return { message: 'Failed to delete project.' };
    }
}
