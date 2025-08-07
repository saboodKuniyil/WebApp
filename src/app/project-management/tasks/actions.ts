
'use server';

import { z } from 'zod';
import { getTasks, createTask as createDbTask, updateTask as updateDbTask, deleteTask as deleteDbTask, getProjects, getTaskBlueprints } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const taskSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  label: z.enum(['bug', 'feature', 'documentation']).optional(),
  status: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  assignee: z.string().optional(),
  projectId: z.string().min(1, 'Project is required'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  budget: z.coerce.number().optional(),
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
    budget?: string[];
    completionPercentage?: string[];
  };
};

export async function getNextTaskId(): Promise<string> {
    const tasks = await getTasks();
    const taskIds = tasks
      .map(t => t.id)
      .filter(id => id.startsWith('TS_'))
      .map(id => parseInt(id.replace('TS_', ''), 10))
      .filter(num => !isNaN(num));

    if (taskIds.length === 0) {
        return 'TS_72001';
    }

    const lastNumber = Math.max(...taskIds);
    const nextNumber = lastNumber + 1;
    return `TS_${nextNumber}`;
}

async function getBlueprintInfo(projectId: string): Promise<{ firstStatus?: string; statuses?: {name: string, completionPercentage: number}[] }> {
    const projects = await getProjects();
    const project = projects.find(p => p.id === projectId);
    if (!project) return {};

    const blueprints = await getTaskBlueprints();
    const blueprint = blueprints.find(b => b.id === project.taskBlueprintId);
    if (!blueprint || !blueprint.statuses || blueprint.statuses.length === 0) return {};
    
    return {
      firstStatus: blueprint.statuses[0].name.toLowerCase().replace(/\s/g, '-'),
      statuses: blueprint.statuses,
    };
}


async function getCompletionPercentageForStatus(projectId: string, status: string): Promise<number | undefined> {
    const projects = await getProjects();
    const project = projects.find(p => p.id === projectId);
    if (!project) return undefined;

    const blueprints = await getTaskBlueprints();
    const blueprint = blueprints.find(b => b.id === project.taskBlueprintId);
    if (!blueprint) return undefined;
    
    const statusObj = blueprint.statuses.find(s => s.name.toLowerCase().replace(/\s/g, '-') === status);
    return statusObj?.completionPercentage;
}


export async function createTask(
  prevState: TaskFormState,
  formData: FormData
): Promise<TaskFormState> {
  const rawData = {
    id: formData.get('id'),
    title: formData.get('title'),
    description: formData.get('description'),
    label: formData.get('label') || undefined,
    status: formData.get('status') || undefined,
    priority: formData.get('priority') || undefined,
    assignee: formData.get('assignee'),
    projectId: formData.get('projectId'),
    startDate: formData.get('startDate') || undefined,
    endDate: formData.get('endDate') || undefined,
    budget: formData.get('budget') || undefined,
  };

  // Handle empty strings for optional fields
  if (rawData.label === '') rawData.label = undefined;
  if (rawData.status === '') rawData.status = undefined;
  if (rawData.priority === '') rawData.priority = undefined;


  const validatedFields = taskSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      message: 'Failed to create task.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  const { id, projectId, ...taskData } = validatedFields.data;
  
  const blueprintInfo = await getBlueprintInfo(projectId);
  const status = taskData.status || blueprintInfo?.firstStatus || 'backlog';
  const completionPercentage = await getCompletionPercentageForStatus(projectId, status);


  try {
     const tasks = await getTasks();
     const idExists = tasks.some(p => p.id === id);

     if (idExists) {
        return { message: 'Failed to create task. The Task ID already exists.' };
     }

    await createDbTask({
        id,
        projectId,
        title: taskData.title,
        description: taskData.description,
        label: taskData.label ?? 'feature',
        status: status,
        priority: taskData.priority ?? 'medium',
        assignee: taskData.assignee || 'Unassigned',
        startDate: taskData.startDate,
        endDate: taskData.endDate,
        budget: taskData.budget,
        completionPercentage: completionPercentage ?? 0,
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
    const rawData = {
        id: formData.get('id'),
        title: formData.get('title'),
        description: formData.get('description'),
        label: formData.get('label') || undefined,
        status: formData.get('status') || undefined,
        priority: formData.get('priority') || undefined,
        assignee: formData.get('assignee'),
        projectId: formData.get('projectId'),
        startDate: formData.get('startDate') || undefined,
        endDate: formData.get('endDate') || undefined,
        budget: formData.get('budget') || undefined,
    };

    if (rawData.label === '') rawData.label = undefined;
    if (rawData.status === '') rawData.status = undefined;
    if (rawData.priority === '') rawData.priority = undefined;

    const validatedFields = taskSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            message: 'Failed to update task.',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { id, status, projectId, ...taskData } = validatedFields.data;
    
    const blueprintInfo = await getBlueprintInfo(projectId);
    const finalStatus = status || blueprintInfo?.firstStatus || 'backlog';
    const completionPercentage = await getCompletionPercentageForStatus(projectId, finalStatus);

    try {
        await updateDbTask({
            id,
            projectId,
            status: finalStatus,
            ...taskData,
            label: taskData.label ?? 'feature',
            priority: taskData.priority ?? 'medium',
            assignee: taskData.assignee || 'Unassigned',
            completionPercentage: completionPercentage ?? 0
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
        await deleteDbTask(taskId);
        revalidatePath('/project-management/tasks');
        revalidatePath('/project-management/projects'); // Also revalidate projects in case task lists are shown
    } catch (error: any) {
        console.error('Database Error:', error);
        return { message: 'Failed to delete task.' };
    }
    redirect('/project-management/tasks');
}


export async function updateTaskStatus(taskId: string, newStatus: string): Promise<{ message: string; }> {
    const tasks = await getTasks();
    const task = tasks.find(t => t.id === taskId);

    if (!task) {
        return { message: 'Task not found.' };
    }

    const completionPercentage = await getCompletionPercentageForStatus(task.projectId, newStatus);
    if(completionPercentage === undefined) {
         return { message: 'Could not determine completion percentage for the new status.' };
    }

    try {
        await updateDbTask({
            id: taskId,
            status: newStatus,
            completionPercentage: completionPercentage,
        });

        revalidatePath('/project-management/tasks');
        revalidatePath(`/project-management/tasks/${taskId}`);
        revalidatePath(`/project-management/projects/${task.projectId}`);
        return { message: 'Task status updated successfully.' };
    } catch (error) {
        console.error('Database Error:', error);
        return { message: 'Failed to update task status.' };
    }
}
