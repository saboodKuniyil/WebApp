
'use server';

import { z } from 'zod';
import { getJournals, createJournal as createDbJournal, getAccounts, updateAccountBalance } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import type { JournalEntry } from '@/lib/db';

const journalEntrySchema = z.object({
  accountId: z.string().min(1, "Account is required"),
  debit: z.coerce.number().min(0, "Debit must be non-negative").optional(),
  credit: z.coerce.number().min(0, "Credit must be non-negative").optional(),
}).refine(data => (data.debit || 0) > 0 || (data.credit || 0) > 0, {
  message: "Either debit or credit must be provided",
  path: ["debit"], // path of error
}).refine(data => !(data.debit && data.credit), {
    message: "Cannot provide both debit and credit for a single entry",
    path: ["credit"],
});

const journalSchema = z.object({
  id: z.string(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  notes: z.string().min(1, "Notes are required"),
  entries: z.string()
    .transform(val => JSON.parse(val))
    .pipe(z.array(journalEntrySchema).min(2, 'At least two entries are required')),
}).refine(data => {
    const totalDebits = data.entries.reduce((sum, entry) => sum + (entry.debit || 0), 0);
    const totalCredits = data.entries.reduce((sum, entry) => sum + (entry.credit || 0), 0);
    return Math.abs(totalDebits - totalCredits) < 0.01; // Use a small tolerance for floating point
}, {
    message: "Total debits must equal total credits.",
    path: ["entries"],
});

export type JournalFormState = {
  message: string;
  errors?: {
    id?: string[];
    date?: string[];
    notes?: string[];
    entries?: string[];
  };
};

export async function getNextJournalId(): Promise<string> {
    const journals = await getJournals();
    if (journals.length === 0) {
        return 'JRN-1001';
    }
    const journalIds = journals.map(j => parseInt(j.id.replace('JRN-', ''), 10)).filter(num => !isNaN(num));
    if(journalIds.length === 0) {
      return 'JRN-1001';
    }
    const lastIdNumber = Math.max(...journalIds);
    return `JRN-${lastIdNumber + 1}`;
}

async function updateBalances(entries: JournalEntry[]) {
    const accounts = await getAccounts();
    for (const entry of entries) {
        const account = accounts.find(a => a.id === entry.accountId);
        if (account) {
            const debit = entry.debit || 0;
            const credit = entry.credit || 0;
            let newBalance = account.balance;

            if (['Assets', 'Expense'].includes(account.type)) {
                newBalance += debit - credit;
            } else { // Liabilities, Equity, Income
                newBalance += credit - debit;
            }
            await updateAccountBalance(account.id, newBalance);
        }
    }
}


export async function createJournal(
  prevState: JournalFormState,
  formData: FormData
): Promise<JournalFormState> {
  const validatedFields = journalSchema.safeParse({
    id: formData.get('id'),
    date: formData.get('date'),
    notes: formData.get('notes'),
    entries: formData.get('entries'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Failed to create journal entry.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await createDbJournal(validatedFields.data);
    await updateBalances(validatedFields.data.entries);

    revalidatePath('/accounting/journals');
    revalidatePath('/accounting/chart-of-accounts');
    return { message: 'Journal entry created successfully.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Failed to create journal entry.' };
  }
}
