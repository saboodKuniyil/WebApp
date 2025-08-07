
'use server';

import { z } from 'zod';
import { getAccounts, createAccount as createDbAccount } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const accountSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Account name is required'),
  type: z.string().min(1, 'Account type is required'),
  description: z.string().optional(),
});

export type AccountFormState = {
  message: string;
  errors?: {
    id?: string[];
    name?: string[];
    type?: string[];
    description?: string[];
  };
};

export async function getNextAccountId(prefix: string): Promise<string> {
    const accounts = await getAccounts();
    const accountIds = accounts
      .map(a => a.id)
      .filter(id => id.startsWith(`${prefix}-`))
      .map(id => parseInt(id.split('-')[1], 10))
      .filter(num => !isNaN(num));

    let nextNumber = 1001;
    if (accountIds.length > 0) {
        nextNumber = Math.max(...accountIds) + 1;
    }
    
    return `${prefix}-${nextNumber}`;
}

export async function createAccount(
  prevState: AccountFormState,
  formData: FormData
): Promise<AccountFormState> {
  const validatedFields = accountSchema.safeParse({
    id: formData.get('id'),
    name: formData.get('name'),
    type: formData.get('type'),
    description: formData.get('description'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Failed to create account.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { id, name, type, description } = validatedFields.data;

  try {
    const accounts = await getAccounts();
    const nameExists = accounts.some(a => a.name.toLowerCase() === name.toLowerCase());
    if (nameExists) {
        return { message: 'An account with this name already exists.' };
    }

    await createDbAccount({
        id,
        name,
        type,
        description: description || '',
        balance: 0,
    });

    revalidatePath('/accounting/chart-of-accounts');
    return { message: 'Account created successfully.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Failed to create account.' };
  }
}
