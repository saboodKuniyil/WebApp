
'use server';

import { z } from 'zod';
import { getQuotations, createQuotation as createDbQuotation, getEstimationById } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

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

export async function createQuotation(
  estimationId: string
): Promise<{ message: string; quotationId?: string; }> {
  
  const estimation = await getEstimationById(estimationId);

  if (!estimation) {
    return { message: 'Failed to create quotation. Estimation not found.' };
  }

  const newId = await getNextQuotationId();

  try {
    const newQuotation = {
        id: newId,
        title: estimation.title,
        estimationId: estimation.id,
        tasks: estimation.tasks,
        totalCost: estimation.totalCost,
        status: 'draft' as const,
        customer: 'N/A', // Placeholder, ideally this would come from estimation or be selectable
        createdDate: new Date().toISOString().split('T')[0],
    };

    await createDbQuotation(newQuotation);

    revalidatePath('/sales/quotations');
    revalidatePath(`/sales/estimations/${estimationId}`); // Revalidate estimation to maybe show a link
    return { message: 'Quotation created successfully.', quotationId: newId };
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Failed to create quotation.' };
  }
}
