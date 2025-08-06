

'use server';

import { z } from 'zod';
import { getQuotations, createQuotation as createDbQuotation, getEstimationById, updateQuotation as updateDbQuotation, getQuotationById, getAppSettings } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { QuotationItem, EstimationItem, Quotation } from '@/lib/db';

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

const quotationItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Item title cannot be empty.'),
  description: z.string().optional(),
  quantity: z.coerce.number().min(0.001, "Quantity must be positive"),
  rate: z.coerce.number().min(0, "Cost must be a positive number"),
  imageUrl: z.string().optional(),
  marginPercentage: z.coerce.number().optional(),
  marginAmount: z.coerce.number().optional(),
});

const createQuotationFromScratchSchema = z.object({
  id: z.string(),
  projectName: z.string().min(1, 'Project Name is required'),
  customer: z.string().min(1, 'Customer is required'),
  items: z.string()
    .min(1, 'At least one item is required')
    .transform(val => JSON.parse(val))
    .pipe(z.array(quotationItemSchema).min(1, 'At least one item is required')),
  subtotal: z.coerce.number(),
  marginAmount: z.coerce.number(),
  totalCost: z.coerce.number(),
  createdDate: z.string(),
});

export async function createQuotationFromScratch(
    prevState: { message: string; errors?: any, quotationId?: string },
    formData: FormData
): Promise<{ message: string; quotationId?: string; errors?: any }> {
    const validatedFields = createQuotationFromScratchSchema.safeParse({
        id: formData.get('id'),
        projectName: formData.get('projectName'),
        customer: formData.get('customer'),
        items: formData.get('items'),
        subtotal: formData.get('subtotal'),
        marginAmount: formData.get('marginAmount'),
        totalCost: formData.get('totalCost'),
        createdDate: new Date().toISOString().split('T')[0],
    });

    if (!validatedFields.success) {
        const errors = validatedFields.error.flatten().fieldErrors;
        return { message: 'Failed to create quotation. Please check the fields.', errors };
    }

    const { id, projectName, customer, items, subtotal, marginAmount, totalCost, createdDate } = validatedFields.data;

    try {
        const newQuotation: Quotation = {
            id,
            title: projectName,
            estimationId: 'N/A', // No estimation linked
            items,
            subtotal,
            marginAmount,
            marginPercentage: subtotal > 0 ? (marginAmount / subtotal) * 100 : 0,
            totalCost,
            status: 'draft' as const,
            customer,
            createdDate,
        };

        await createDbQuotation(newQuotation);
        
    } catch (error) {
        console.error('Database Error:', error);
        return { message: 'Failed to create quotation due to a database error.' };
    }

    revalidatePath('/sales/quotations');
    return { message: 'Quotation created successfully.', quotationId: validatedFields.data.id };
}


const createQuotationFromEstSchema = z.object({
  estimationId: z.string().min(1, { message: 'Please select an estimation.' }),
});

export async function createQuotationFromEstimation(
  prevState: { message: string; quotationId?: string; errors?: any },
  formData: FormData
): Promise<{ message: string; quotationId?: string; errors?: any }> {
  
  const validatedFields = createQuotationFromEstSchema.safeParse({
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
    const newQuotationItems: QuotationItem[] = estimation.tasks.flatMap(task => 
        task.items.map(item => ({
            id: item.id,
            title: item.name,
            description: `Task: ${task.title}\n${item.notes || ''}`.trim(),
            quantity: item.quantity,
            rate: item.cost,
            imageUrl: item.imageUrl,
            marginPercentage: 0,
            marginAmount: 0,
        }))
    );
    
    const subtotal = newQuotationItems.reduce((acc, item) => acc + (item.quantity * item.rate), 0);

    const newQuotation: Quotation = {
        id: newId,
        title: estimation.title,
        estimationId: estimation.id,
        items: newQuotationItems,
        subtotal: subtotal,
        marginPercentage: 0,
        marginAmount: 0,
        totalCost: subtotal, // Initially total is same as subtotal
        status: 'draft' as const,
        customer: estimation.customerName || 'N/A',
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
    title: z.string().min(1, 'Title is required.'),
    items: z.string().transform(val => JSON.parse(val)).pipe(z.array(quotationItemSchema)),
    marginAmount: z.coerce.number(),
    subtotal: z.coerce.number(),
    totalCost: z.coerce.number(),
});

export async function updateQuotationAction(prevState: any, formData: FormData): Promise<{ message: string, errors?: any }> {
    const validatedFields = updateQuotationSchema.safeParse({
        id: formData.get('id'),
        title: formData.get('title'),
        items: formData.get('items'),
        marginAmount: formData.get('marginAmount'),
        subtotal: formData.get('subtotal'),
        totalCost: formData.get('totalCost'),
    });

    if (!validatedFields.success) {
        return {
            message: 'Failed to update quotation.',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    const { id, title, items, marginAmount, subtotal, totalCost } = validatedFields.data;

    try {
        const quotations = await getQuotations();
        const existingQuotation = quotations.find(q => q.id === id);

        if (!existingQuotation) {
            return { message: 'Quotation not found.' };
        }
        
        const newMarginPercentage = subtotal > 0 ? (marginAmount / subtotal) * 100 : 0;

        const updatedQuotation: Quotation = {
            ...existingQuotation,
            title,
            items,
            subtotal,
            marginAmount,
            marginPercentage: newMarginPercentage,
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


export async function updateQuotationStatus(
  quotationId: string,
  status: Quotation['status']
): Promise<{ success: boolean; message: string; errors?: any }> {
  try {
    const quotation = await getQuotationById(quotationId);
    if (!quotation) {
      return { success: false, message: 'Quotation not found.' };
    }

    const updatedQuotation: Quotation = { ...quotation, status };
    await updateDbQuotation(updatedQuotation);

    revalidatePath(`/sales/quotations/${quotationId}`);
    revalidatePath('/sales/quotations');
    return { success: true, message: `Quotation status updated to ${status}.` };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Failed to update quotation status.' };
  }
}

export async function sendQuotationByEmail(quotationId: string): Promise<{ success: boolean; message: string }> {
    const quotation = await getQuotationById(quotationId);
    if (!quotation) {
        return { success: false, message: 'Quotation not found.' };
    }
    
    const appSettings = await getAppSettings();
    const fromEmail = appSettings.quotationSettings?.sendingEmail;
    const toEmail = appSettings.quotationSettings?.receivingEmail;
    
    if (!fromEmail || !toEmail) {
        return { success: false, message: 'Sending and receiving emails are not configured in settings.' };
    }

    // TODO: Implement actual email sending logic here
    // You will need to install and configure an email sending library like nodemailer
    // and provide your email service credentials (e.g., via environment variables).

    console.log(`Simulating sending email for quotation ${quotation.id}`);
    console.log(`From: ${fromEmail}`);
    console.log(`To: ${toEmail}`);
    console.log(`Customer: ${quotation.customer}`);
    console.log('Email Body (Placeholder):');
    console.log(`Dear ${quotation.customer},`);
    console.log(`Please find attached our quotation ${quotation.id} for "${quotation.title}".`);
    console.log(`Total amount: ${quotation.totalCost.toFixed(2)}`);
    console.log('Thank you.');
    
    // For now, we'll just simulate a success response.
    // Replace this with your actual email logic.
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

    return { success: true, message: 'Email sent successfully (simulated).' };
}
