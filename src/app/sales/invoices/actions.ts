
'use server';

import { z } from 'zod';
import { getInvoices, updateInvoice as updateDbInvoice, getInvoiceById } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import type { Invoice } from '@/lib/db';

export async function getNextInvoiceId(): Promise<string> {
    const invoices = await getInvoices();
    const prefix = 'INV-';
    if (invoices.length === 0) {
        return `${prefix}1001`;
    }
    const invIds = invoices
      .map(p => p.id)
      .filter(id => id.startsWith(prefix))
      .map(id => parseInt(id.replace(prefix, ''), 10))
      .filter(num => !isNaN(num));

    if (invIds.length === 0) {
        return `${prefix}1001`;
    }

    const lastNumber = Math.max(...invIds);
    const nextNumber = lastNumber + 1;
    return `${prefix}${nextNumber}`;
}

export async function updateInvoiceStatus(
  invoiceId: string,
  status: Invoice['status']
): Promise<{ message: string; errors?: any }> {
  try {
    const invoice = await getInvoiceById(invoiceId);
    if (!invoice) {
      return { message: 'Invoice not found.' };
    }

    const updatedInvoice: Invoice = { ...invoice, status };
    await updateDbInvoice(updatedInvoice);

    revalidatePath(`/sales/invoices/${invoiceId}`);
    revalidatePath('/sales/invoices');
    return { message: `Invoice status updated to ${status}.` };
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Failed to update invoice status.' };
  }
}
