'use server';

import { z } from 'zod';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const projectSchema = z.object({
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
  };
};

export async function getNextProjectId(): Promise<string> {
    const projects = await db.getProjects();
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
  });

  if (!validatedFields.success) {
    return {
      message: 'Failed to create project.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { id, title, description, manager, customer, startDate, endDate, status } = validatedFields.data;

  try {
     const projects = await db.getProjects();
     const idExists = projects.some(p => p.id === id);

     if (idExists) {
        return { message: 'Failed to create project. The Project ID already exists.' };
     }

    await db.createProject({
        id,
        title,
        description,
        manager,
        customer,
        startDate,
        endDate,
        status,
    });

    revalidatePath('/project-management/projects');
    return { message: 'Project created successfully.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Failed to create project.' };
  }
}
