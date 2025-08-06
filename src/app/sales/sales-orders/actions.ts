
'use server';

import { z } from 'zod';
import { getQuotationById, createSalesOrder, getSalesOrders, updateSalesOrder as updateDbSalesOrder, getSalesOrderById, createInvoice } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import type { SalesOrder, Invoice } from '@/lib/db';
import { updateQuotationStatus } from '../quotations/actions';
import { getNextInvoiceId } from '../invoices/actions';

export async function getNextSalesOrderId(): Promise<string> {
    const salesOrders = await getSalesOrders();
    const prefix = 'SO-';
    if (salesOrders.length === 0) {
        return `${prefix}1001`;
    }
    const soIds = salesOrders
      .map(p => p.id)
      .filter(id => id.startsWith(prefix))
      .map(id => parseInt(id.replace(prefix, ''), 10))
      .filter(num => !isNaN(num));

    if (soIds.length === 0) {
        return `${prefix}1001`;
    }

    const lastNumber = Math.max(...soIds);
    const nextNumber = lastNumber + 1;
    return `${prefix}${nextNumber}`;
}

const createSalesOrderSchema = z.object({
  quotationId: z.string().min(1, { message: 'Please select a quotation.' }),
});


export async function createSalesOrderFromQuotation(
  prevState: { salesOrderId?: string; message: string; errors?: any },
  formData: FormData
): Promise<{ salesOrderId?: string; message: string; errors?: any }> {
  try {
    const validatedFields = createSalesOrderSchema.safeParse({
        quotationId: formData.get('quotationId'),
    });

    if (!validatedFields.success) {
        return { message: 'Validation failed.', errors: validatedFields.error.flatten().fieldErrors };
    }

    const { quotationId } = validatedFields.data;

    const quotation = await getQuotationById(quotationId);

    if (!quotation) {
      return { message: 'Quotation not found.' };
    }
    
    if (quotation.status !== 'approved') {
        return { message: 'Only approved quotations can be converted to sales orders.' };
    }

    const newSalesOrderId = await getNextSalesOrderId();
    const now = new Date();
    const newSalesOrder: SalesOrder = {
        id: newSalesOrderId,
        quotationId: quotation.id,
        title: quotation.title,
        items: quotation.items,
        totalCost: quotation.totalCost,
        status: 'open',
        customer: quotation.customer,
        createdDate: now.toISOString().split('T')[0],
        orderDate: now.toISOString().split('T')[0],
    };

    await createSalesOrder(newSalesOrder);
    
    // Update quotation status to 'converted'
    await updateQuotationStatus(quotation.id, 'converted');

    revalidatePath('/sales/sales-orders');
    revalidatePath(`/sales/quotations/${quotationId}`);
    revalidatePath('/sales/quotations');

    return { salesOrderId: newSalesOrderId, message: 'Sales Order created successfully.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Failed to create Sales Order.' };
  }
}

export async function updateSalesOrderStatus(
  salesOrderId: string,
  status: SalesOrder['status']
): Promise<{ message: string; errors?: any }> {
  try {
    const salesOrder = await getSalesOrderById(salesOrderId);
    if (!salesOrder) {
      return { message: 'Sales Order not found.' };
    }

    const updatedSalesOrder: SalesOrder = { ...salesOrder, status };
    await updateDbSalesOrder(updatedSalesOrder);

    revalidatePath(`/sales/sales-orders/${salesOrderId}`);
    revalidatePath('/sales/sales-orders');
    return { message: `Sales Order status updated to ${status}.` };
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Failed to update sales order status.' };
  }
}

export async function createInvoiceFromSalesOrder(
    salesOrderId: string
): Promise<{ invoiceId?: string; message: string }> {
    try {
        const salesOrder = await getSalesOrderById(salesOrderId);
        if (!salesOrder) {
            return { message: 'Sales Order not found.' };
        }
        if (salesOrder.status !== 'fulfilled') {
            return { message: 'Only fulfilled sales orders can be invoiced.' };
        }

        const newInvoiceId = await getNextInvoiceId();
        const now = new Date();
        const dueDate = new Date();
        dueDate.setDate(now.getDate() + 30); // Due in 30 days

        const newInvoice: Invoice = {
            id: newInvoiceId,
            salesOrderId: salesOrder.id,
            title: salesOrder.title,
            items: salesOrder.items,
            totalCost: salesOrder.totalCost,
            status: 'draft',
            customer: salesOrder.customer,
            createdDate: now.toISOString().split('T')[0],
            invoiceDate: now.toISOString().split('T')[0],
            dueDate: dueDate.toISOString().split('T')[0],
        };

        await createInvoice(newInvoice);
        await updateSalesOrderStatus(salesOrderId, 'invoiced');
        
        revalidatePath('/sales/invoices');
        revalidatePath(`/sales/sales-orders/${salesOrderId}`);
        revalidatePath('/sales/sales-orders');
        
        return { invoiceId: newInvoiceId, message: 'Invoice created successfully.' };
    } catch (error) {
        console.error('Database Error:', error);
        return { message: 'Failed to create invoice.' };
    }
}
