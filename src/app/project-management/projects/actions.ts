
'use server';

import { z } from 'zod';
import db from '@/lib/db';
import { revalidatePath } from 'next/cache';

const projectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  manager: z.string().min(1, 'Manager is required'),
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
    title?: string[];
    description?: string[];
    manager?: string[];
    startDate?: string[];
    endDate?: string[];
    status?: string[];
  };
};

export async function createProject(
  prevState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  const validatedFields = projectSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    manager: formData.get('manager'),
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

  const { title, description, manager, startDate, endDate, status } = validatedFields.data;

  try {
    // In a real app, you'd want a more robust way to generate sequential IDs,
    // like a database sequence or a dedicated service.
    const id = `PR_${Math.floor(Math.random() * 1000) + 9001}`;

    await db.query(
      'INSERT INTO projects (id, title, description, manager, startDate, endDate, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, title, description, manager, new Date(startDate), new Date(endDate), status]
    );

    revalidatePath('/project-management/projects');
    return { message: 'Project created successfully.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Failed to create project.' };
  }
}
