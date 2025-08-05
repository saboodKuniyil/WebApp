

'use server';

import { z } from 'zod';
import { getEstimations, createEstimation as createDbEstimation, updateEstimation, deleteEstimation as deleteDbEstimation, getEstimationById } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Estimation } from '@/components/sales/estimations-list';

const estimationItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  quantity: z.coerce.number().min(0.001, "Quantity must be positive"),
  cost: z.coerce.number().min(0, "Cost must be a positive number"),
  type: z.enum(['product', 'adhoc']),
  size: z.string().optional(),
  color: z.string().optional(),
  model: z.string().optional(),
  notes: z.string().optional(),
  imageUrl: z.string().optional(),
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
  customerId: z.string().optional(),
  customerName: z.string().optional(),
  tasks: z.string()
    .min(1, 'At least one task is required')
    .transform(val => JSON.parse(val))
    .pipe(z.array(estimationTaskSchema).min(1, 'At least one task is required')),
  totalCost: z.coerce.number(),
  createdDate: z.string(),
  status: z.enum(['draft', 'sent', 'approved', 'rejected']),
});

export type EstimationFormState = {
  message: string;
  errors?: {
    id?: string[];
    title?: string[];
    customerId?: string[];
    tasks?: string[];
    status?: string[];
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
    customerId: formData.get('customerId'),
    customerName: formData.get('customerName'),
    tasks: formData.get('tasks'),
    totalCost: formData.get('totalCost'),
    createdDate: new Date().toISOString().split('T')[0],
    status: 'draft',
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

  const { id, title, customerId, customerName, tasks, totalCost, createdDate, status } = validatedFields.data;

  try {
    await createDbEstimation({
      id,
      title,
      customerId,
      customerName,
      tasks,
      totalCost,
      createdDate,
      status
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
  // We need to fetch the current status to add it to the schema validation
  const id = formData.get('id') as string;
  const currentEstimation = await getEstimationById(id);
  
  const validatedFields = estimationSchema.safeParse({
    id: id,
    title: formData.get('title'),
    customerId: formData.get('customerId'),
    customerName: formData.get('customerName'),
    tasks: formData.get('tasks'),
    totalCost: formData.get('totalCost'),
    createdDate: formData.get('createdDate'), // Pass existing date
    status: currentEstimation?.status || 'draft',
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
    await updateEstimation(validatedFields.data);

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

export async function updateEstimationStatus(
  estimationId: string,
  status: Estimation['status']
): Promise<{ message: string; errors?: any }> {
  try {
    const estimation = await getEstimationById(estimationId);
    if (!estimation) {
      return { message: 'Estimation not found.' };
    }

    const updatedEstimation: Estimation = { ...estimation, status };
    await updateEstimation(updatedEstimation);

    revalidatePath(`/sales/estimations/${estimationId}`);
    revalidatePath('/sales/estimations');
    return { message: `Estimation status updated to ${status}.` };
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Failed to update estimation status.' };
  }
}
