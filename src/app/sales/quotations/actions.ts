
'use server';

import { z } from 'zod';
import { getQuotations, createQuotation as createDbQuotation, getEstimationById, updateQuotation as updateDbQuotation } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { QuotationItem } from '@/components/sales/quotations-list';

export async function getNextQuotationId(): Promise<string> {
    const quotations = await getQuotations();
    const estIds = quotations
      .map(p => p.id)
      .filter(id => id.startsWith('QUO-'))
      .map(id => parseInt(id.replace('QUO-', ''), 10))
      .filter(num => !isNaN(num));

    if (estIds.length === 0) {
        return 'QUO-1001';
    }

    const lastNumber = Math.max(...estIds);
    const nextNumber = lastNumber + 1;
    return `QUO-${nextNumber}`;
}

const createQuotationSchema = z.object({
  estimationId: z.string().min(1, { message: 'Please select an estimation.' }),
});

export async function createQuotation(
  prevState: { message: string; quotationId?: string; errors?: any },
  formData: FormData
): Promise<{ message: string; quotationId?: string; errors?: any }> {
  
  const validatedFields = createQuotationSchema.safeParse({
    estimationId: formData.get('estimationId'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Failed to create quotation.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { estimationId } = validatedFields.data;
  const estimation = await getEstimationById(estimationId);

  if (!estimation) {
    return { message: 'Failed to create quotation. Estimation not found.' };
  }

  const newId = await getNextQuotationId();

  try {
    const newQuotationItems: QuotationItem[] = estimation.tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      quantity: 1, // Default quantity
      rate: task.totalCost,
    }));
    
    const totalCost = newQuotationItems.reduce((acc, item) => acc + (item.quantity * item.rate), 0);

    const newQuotation = {
        id: newId,
        title: estimation.title,
        estimationId: estimation.id,
        items: newQuotationItems,
        totalCost: totalCost,
        status: 'draft' as const,
        customer: 'N/A', // Placeholder, ideally this would come from estimation or be selectable
        createdDate: new Date().toISOString().split('T')[0],
    };

    await createDbQuotation(newQuotation);

    revalidatePath('/sales/quotations');
    revalidatePath(`/sales/estimations/${estimationId}`); // Revalidate estimation to maybe show a link
    return { message: 'Quotation created successfully.', quotationId: newId, errors: {} };
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Failed to create quotation.' };
  }
}

const updateQuotationSchema = z.object({
    id: z.string(),
    items: z.string().transform(val => JSON.parse(val)).pipe(z.array(z.any())),
});

export async function updateQuotationAction(prevState: any, formData: FormData): Promise<{ message: string, errors?: any }> {
    const validatedFields = updateQuotationSchema.safeParse({
        id: formData.get('id'),
        items: formData.get('items'),
    });

    if (!validatedFields.success) {
        return {
            message: 'Failed to update quotation.',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    const { id, items } = validatedFields.data;

    try {
        const quotations = await getQuotations();
        const existingQuotation = quotations.find(q => q.id === id);

        if (!existingQuotation) {
            return { message: 'Quotation not found.' };
        }
        
        const totalCost = items.reduce((acc: number, item: QuotationItem) => acc + (item.quantity * item.rate), 0);

        const updatedQuotation = {
            ...existingQuotation,
            items,
            totalCost,
        };

        await updateDbQuotation(updatedQuotation);

        revalidatePath(`/sales/quotations/${id}`);
        revalidatePath('/sales/quotations');
        return { message: 'Quotation updated successfully.' };

    } catch (error) {
        console.error('Database Error:', error);
        return { message: 'Failed to update quotation.' };
    }
}
