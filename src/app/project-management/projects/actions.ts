
'use server';

import { z } from 'zod';
import db from '@/lib/db';
import { revalidatePath } from 'next/cache';
import type { RowDataPacket } from 'mysql2';

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
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT id FROM projects WHERE id LIKE 'PR_%' ORDER BY CAST(SUBSTRING(id, 4) AS UNSIGNED) DESC LIMIT 1"
    );

    if (rows.length === 0) {
        return 'PR_9001';
    }

    const lastId = rows[0].id;
    const lastNumber = parseInt(lastId.replace('PR_', ''), 10);
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
    await db.query(
      'INSERT INTO projects (id, title, description, manager, customer, startDate, endDate, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, title, description, manager, customer, new Date(startDate), new Date(endDate), status]
    );

    revalidatePath('/project-management/projects');
    return { message: 'Project created successfully.' };
  } catch (error) {
    console.error('Database Error:', error);
    // Check for unique key violation
    if (error.code === 'ER_DUP_ENTRY') {
        return { message: 'Failed to create project. The Project ID already exists.' };
    }
    return { message: 'Failed to create project.' };
  }
}
