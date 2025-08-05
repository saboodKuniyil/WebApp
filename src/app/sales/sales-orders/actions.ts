
'use server';

import { z } from 'zod';
import { getQuotations, getQuotationById, updateQuotation, createSalesOrder, getSalesOrders } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import type { SalesOrder } from '@/lib/db';

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

export async function createSalesOrderFromQuotation(
  quotationId: string
): Promise<{ salesOrderId?: string; message?: string }> {
  try {
    const quotation = await getQuotationById(quotationId);

    if (!quotation) {
      return { message: 'Quotation not found.' };
    }
    
    if (quotation.status !== 'approved') {
        return { message: 'Only approved quotations can be converted to sales orders.' };
    }

    const newSalesOrderId = await getNextSalesOrderId();

    const newSalesOrder: SalesOrder = {
        id: newSalesOrderId,
        quotationId: quotation.id,
        title: quotation.title,
        items: quotation.items,
        totalCost: quotation.totalCost,
        status: 'open',
        customer: quotation.customer,
        createdDate: new Date().toISOString().split('T')[0],
        orderDate: new Date().toISOString().split('T')[0],
    };

    await createSalesOrder(newSalesOrder);
    
    // Update quotation status
    await updateQuotation({ ...quotation, status: 'converted' });

    revalidatePath('/sales/sales-orders');
    revalidatePath(`/sales/quotations/${quotationId}`);
    revalidatePath('/sales/quotations');

    return { salesOrderId: newSalesOrderId, message: 'Sales Order created successfully.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Failed to create Sales Order.' };
  }
}
