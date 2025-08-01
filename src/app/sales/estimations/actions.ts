
'use server';

import { z } from 'zod';
import { getEstimations, createEstimation as createDbEstimation } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import type { Estimation } from '@/components/sales/estimations-list';

const estimationItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  quantity: z.coerce.number().min(0.001, "Quantity must be positive"),
  cost: z.coerce.number().min(0, "Cost must be a positive number"),
  type: z.enum(['product', 'adhoc']),
});


const estimationSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required'),
  items: z.string()
    .min(1, 'At least one item is required')
    .transform(val => JSON.parse(val))
    .pipe(z.array(estimationItemSchema).min(1, 'At least one item is required')),
  totalCost: z.coerce.number(),
  createdDate: z.string(),
});

export type EstimationFormState = {
  message: string;
  errors?: {
    id?: string[];
    title?: string[];
    items?: string[];
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
    items: formData.get('items'),
    totalCost: formData.get('totalCost'),
    createdDate: new Date().toISOString().split('T')[0],
  });

  if (!validatedFields.success) {
    return {
      message: 'Failed to create estimation.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { id, title, items, totalCost, createdDate } = validatedFields.data;

  try {
    await createDbEstimation({
      id,
      title,
      items,
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
