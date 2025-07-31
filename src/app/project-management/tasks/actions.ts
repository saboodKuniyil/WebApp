'use server';

import { z } from 'zod';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const taskSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required'),
  label: z.enum(['bug', 'feature', 'documentation']),
  status: z.enum(['in-progress', 'done', 'backlog', 'todo', 'canceled']),
  priority: z.enum(['low', 'medium', 'high']),
  assignee: z.string().min(1, 'Assignee is required'),
  projectId: z.string().min(1, 'Project is required'),
});

export type TaskFormState = {
  message: string;
  errors?: {
    id?: string[];
    title?: string[];
    label?: string[];
    status?: string[];
    priority?: string[];
    assignee?: string[];
    projectId?: string[];
  };
};

export async function getNextTaskId(): Promise<string> {
    const tasks = await db.getTasks();
    const taskIds = tasks
      .map(t => t.id)
      .filter(id => id.startsWith('TASK-'))
      .map(id => parseInt(id.replace('TASK-', ''), 10))
      .filter(num => !isNaN(num));

    if (taskIds.length === 0) {
        return 'TASK-8783';
    }

    const lastNumber = Math.max(...taskIds);
    const nextNumber = lastNumber + 1;
    return `TASK-${nextNumber}`;
}

export async function createTask(
  prevState: TaskFormState,
  formData: FormData
): Promise<TaskFormState> {
  const validatedFields = taskSchema.safeParse({
    id: formData.get('id'),
    title: formData.get('title'),
    label: formData.get('label'),
    status: formData.get('status'),
    priority: formData.get('priority'),
    assignee: formData.get('assignee'),
    projectId: formData.get('projectId'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Failed to create task.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  const { id, title, label, status, priority, assignee, projectId } = validatedFields.data;

  try {
     const tasks = await db.getTasks();
     const idExists = tasks.some(p => p.id === id);

     if (idExists) {
        return { message: 'Failed to create task. The Task ID already exists.' };
     }

    await db.createTask({
        id,
        title,
        label,
        status,
        priority,
        assignee,
        projectId,
    });

    revalidatePath('/project-management/tasks');
    return { message: 'Task created successfully.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Failed to create task.' };
  }
}
