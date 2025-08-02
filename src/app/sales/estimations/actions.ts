
'use server';

import { z } from 'zod';
import { getEstimations, createEstimation as createDbEstimation, updateEstimation as updateDbEstimation, deleteEstimation as deleteDbEstimation } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const estimationItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  quantity: z.coerce.number().min(0.001, "Quantity must be positive"),
  cost: z.coerce.number().min(0, "Cost must be a positive number"),
  type: z.enum(['product', 'adhoc']),
});

const estimationTaskSchema = z.object({
    id: z.string(),
    title: z.string().min(1, 'Task title is required'),
    description: z.string().optional(),
    items: z.array(estimationItemSchema).min(1, 'Each task must have at least one item'),
    totalCost: z.coerce.number(),
});

const estimationSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required'),
  tasks: z.string()
    .min(1, 'At least one task is required')
    .transform(val => JSON.parse(val))
    .pipe(z.array(estimationTaskSchema).min(1, 'At least one task is required')),
  totalCost: z.coerce.number(),
  createdDate: z.string(),
});

export type EstimationFormState = {
  message: string;
  errors?: {
    id?: string[];
    title?: string[];
    tasks?: string[];
  };
};

export async function getNextEstimationId(): Promise<string> {
    const estimations = await getEstimations();
    const estIds = estimations
      .map(p => p.id)
      .filter(id => id.startsWith('EST-'))
      .map(id => parseInt(id.replace('EST-', ''), 10))
      .filter(num => !isNaN(num));

    if (estIds.length === 0) {
        return 'EST-1001';
    }

    const lastNumber = Math.max(...estIds);
    const nextNumber = lastNumber + 1;
    return `EST-${nextNumber}`;
}

export async function createEstimation(
  prevState: EstimationFormState,
  formData: FormData
): Promise<EstimationFormState> {
  const validatedFields = estimationSchema.safeParse({
    id: formData.get('id'),
    title: formData.get('title'),
    tasks: formData.get('tasks'),
    totalCost: formData.get('totalCost'),
    createdDate: new Date().toISOString().split('T')[0],
  });
  
  if (!validatedFields.success) {
    const errors = validatedFields.error.flatten().fieldErrors;
    // Provide more specific feedback for task/item errors
    if(errors.tasks) {
        return { message: 'Failed to create estimation. Ensure every task has a title and at least one item.', errors }
    }
    return {
      message: 'Failed to create estimation.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { id, title, tasks, totalCost, createdDate } = validatedFields.data;

  try {
    await createDbEstimation({
      id,
      title,
      tasks,
      totalCost,
      createdDate
    });

    revalidatePath('/sales/estimations');
    return { message: 'Estimation created successfully.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Failed to create estimation.' };
  }
}

export async function updateEstimation(
  prevState: EstimationFormState,
  formData: FormData
): Promise<EstimationFormState> {
  const validatedFields = estimationSchema.safeParse({
    id: formData.get('id'),
    title: formData.get('title'),
    tasks: formData.get('tasks'),
    totalCost: formData.get('totalCost'),
    createdDate: formData.get('createdDate'), // Pass existing date
  });

  if (!validatedFields.success) {
    const errors = validatedFields.error.flatten().fieldErrors;
    if(errors.tasks) {
        return { message: 'Failed to update estimation. Ensure every task has a title and at least one item.', errors }
    }
    return {
      message: 'Failed to update estimation.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  try {
    await updateDbEstimation(validatedFields.data);

    revalidatePath('/sales/estimations');
    revalidatePath(`/sales/estimations/${validatedFields.data.id}`);
    return { message: 'Estimation updated successfully.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Failed to update estimation.' };
  }
}

export async function deleteEstimationAction(estimationId: string): Promise<{ message: string }> {
    try {
        await deleteDbEstimation(estimationId);
    } catch (error) {
        console.error('Database Error:', error);
        return { message: 'Failed to delete estimation.' };
    }
    revalidatePath('/sales/estimations');
    redirect('/sales/estimations');
}
