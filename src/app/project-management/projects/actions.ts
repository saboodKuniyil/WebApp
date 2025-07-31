
'use server';

import { z } from 'zod';
import db from '@/lib/db';
import { revalidatePath } from 'next/cache';

const projectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  manager: z.string().min(1, 'Manager is required'),
  deadline: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  status: z.enum(['in-progress', 'completed', 'on-hold', 'canceled']),
});

export type ProjectFormState = {
  message: string;
  errors?: {
    title?: string[];
    manager?: string[];
    deadline?: string[];
    status?: string[];
  };
};

export async function createProject(
  prevState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  const validatedFields = projectSchema.safeParse({
    title: formData.get('title'),
    manager: formData.get('manager'),
    deadline: formData.get('deadline'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Failed to create project.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { title, manager, deadline, status } = validatedFields.data;

  try {
    // Generate a unique ID, for example:
    const id = `PROJ-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    await db.query(
      'INSERT INTO projects (id, title, manager, deadline, status) VALUES (?, ?, ?, ?, ?)',
      [id, title, manager, new Date(deadline), status]
    );

    revalidatePath('/project-management/projects');
    return { message: 'Project created successfully.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Failed to create project.' };
  }
}
