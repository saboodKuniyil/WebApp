
'use server';

import { z } from 'zod';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const taskSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  label: z.enum(['bug', 'feature', 'documentation']),
  status: z.enum(['in-progress', 'done', 'backlog', 'todo', 'canceled']),
  priority: z.enum(['low', 'medium', 'high']),
  assignee: z.string().min(1, 'Assignee is required'),
  projectId: z.string().min(1, 'Project is required'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  completionPercentage: z.coerce.number().min(0).max(100).optional(),
});

export type TaskFormState = {
  message: string;
  errors?: {
    id?: string[];
    title?: string[];
    description?: string[];
    label?: string[];
    status?: string[];
    priority?: string[];
    assignee?: string[];
    projectId?: string[];
    startDate?: string[];
    endDate?: string[];
    completionPercentage?: string[];
  };
};

export async function getNextTaskId(): Promise<string> {
    const tasks = await db.getTasks();
    const taskIds = tasks
      .map(t => t.id)
      .filter(id => id.startsWith('TS_'))
      .map(id => parseInt(id.replace('TS_', ''), 10))
      .filter(num => !isNaN(num));

    if (taskIds.length === 0) {
        return 'TS_9001';
    }

    const lastNumber = Math.max(...taskIds);
    const nextNumber = lastNumber + 1;
    return `TS_${nextNumber}`;
}

export async function createTask(
  prevState: TaskFormState,
  formData: FormData
): Promise<TaskFormState> {
  const validatedFields = taskSchema.safeParse({
    id: formData.get('id'),
    title: formData.get('title'),
    description: formData.get('description'),
    label: formData.get('label'),
    status: formData.get('status'),
    priority: formData.get('priority'),
    assignee: formData.get('assignee'),
    projectId: formData.get('projectId'),
    startDate: formData.get('startDate') || undefined,
    endDate: formData.get('endDate') || undefined,
    completionPercentage: formData.get('completionPercentage'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Failed to create task.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  const { id, title, description, label, status, priority, assignee, projectId, startDate, endDate, completionPercentage } = validatedFields.data;

  try {
     const tasks = await db.getTasks();
     const idExists = tasks.some(p => p.id === id);

     if (idExists) {
        return { message: 'Failed to create task. The Task ID already exists.' };
     }

    await db.createTask({
        id,
        title,
        description,
        label,
        status,
        priority,
        assignee,
        projectId,
        startDate,
        endDate,
        completionPercentage,
    });

    revalidatePath('/project-management/tasks');
    return { message: 'Task created successfully.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Failed to create task.' };
  }
}

export async function updateTask(
    prevState: TaskFormState,
    formData: FormData
): Promise<TaskFormState> {
    const validatedFields = taskSchema.safeParse({
        id: formData.get('id'),
        title: formData.get('title'),
        description: formData.get('description'),
        label: formData.get('label'),
        status: formData.get('status'),
        priority: formData.get('priority'),
        assignee: formData.get('assignee'),
        projectId: formData.get('projectId'),
        startDate: formData.get('startDate') || undefined,
        endDate: formData.get('endDate') || undefined,
        completionPercentage: formData.get('completionPercentage'),
    });

    if (!validatedFields.success) {
        return {
            message: 'Failed to update task.',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { id, ...taskData } = validatedFields.data;

    try {
        await db.updateTask({
            id,
            ...taskData
        });

        revalidatePath(`/project-management/tasks/${id}`);
        revalidatePath('/project-management/tasks');
        return { message: 'Task updated successfully.' };
    } catch (error) {
        console.error('Database Error:', error);
        return { message: 'Failed to update task.' };
    }
}

export async function deleteTask(taskId: string): Promise<{ message: string }> {
    try {
        await db.deleteTask(taskId);
        revalidatePath('/project-management/tasks');
        revalidatePath('/project-management/projects'); // Also revalidate projects in case task lists are shown
    } catch (error: any) {
        console.error('Database Error:', error);
        return { message: 'Failed to delete task.' };
    }
    redirect('/project-management/tasks');
}


export async function updateTaskCompletion(taskId: string, completionPercentage: number) {
  try {
    await db.updateTask({ id: taskId, completionPercentage });
    revalidatePath('/project-management/tasks');
    revalidatePath(`/project-management/projects`); // Revalidate projects to update progress
    return { success: true };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Failed to update task completion.' };
  }
}
