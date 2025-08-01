
'use server';

import { z } from 'zod';
import { getCurrencies, createCurrency as createDbCurrency, updateCurrency as updateDbCurrency, deleteCurrency as deleteDbCurrency, getAppSettings, updateAppSettings as updateDbAppSettings } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import type { AppSettings } from '@/lib/db';

const currencySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(3, 'Code must be at least 3 characters').max(3, 'Code must be 3 characters'),
  symbol: z.string().min(1, 'Symbol is required'),
});

export type CurrencyFormState = {
  message: string;
  errors?: {
    name?: string[];
    code?: string[];
    symbol?: string[];
  };
};

export async function createCurrency(
  prevState: CurrencyFormState,
  formData: FormData
): Promise<CurrencyFormState> {
  const validatedFields = currencySchema.safeParse({
    name: formData.get('name'),
    code: formData.get('code'),
    symbol: formData.get('symbol'),
  });
  
  if (!validatedFields.success) {
    return {
      message: 'Failed to create currency.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, code, symbol } = validatedFields.data;
  const upperCaseCode = code.toUpperCase();

  try {
    const currencies = await getCurrencies();
    const codeExists = currencies.some(c => c.code.toLowerCase() === upperCaseCode.toLowerCase());

    if (codeExists) {
        return { message: 'Failed to create currency. A currency with this code already exists.' };
    }

    await createDbCurrency({ name, code: upperCaseCode, symbol });

    revalidatePath('/settings/preferences/currency');
    return { message: 'Currency created successfully.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Failed to create currency.' };
  }
}

const updateCurrencySchema = z.object({
    originalCode: z.string(),
    name: z.string().min(1, 'Currency name cannot be empty.'),
    code: z.string().min(3, 'Code must be 3 characters.').max(3, 'Code must be 3 characters.'),
    symbol: z.string().min(1, 'Symbol cannot be empty.'),
});

export async function updateCurrency(prevState: CurrencyFormState, formData: FormData): Promise<CurrencyFormState> {
    const validatedFields = updateCurrencySchema.safeParse({
        originalCode: formData.get('originalCode'),
        name: formData.get('name'),
        code: formData.get('code'),
        symbol: formData.get('symbol'),
    });
    
    if (!validatedFields.success) {
        return { message: 'Validation failed.', errors: validatedFields.error.flatten().fieldErrors };
    }

    const { originalCode, name, code, symbol } = validatedFields.data;
    const upperCaseCode = code.toUpperCase();

    try {
        const currencies = await getCurrencies();
        if (originalCode.toLowerCase() !== upperCaseCode.toLowerCase()) {
            const codeExists = currencies.some(c => c.code.toLowerCase() === upperCaseCode.toLowerCase());
            if (codeExists) {
                return { message: 'Failed to update currency. Another currency with this code already exists.' };
            }
        }
        
        await updateDbCurrency(originalCode, { name, code: upperCaseCode, symbol });
        revalidatePath('/settings/preferences/currency');
        return { message: 'Currency updated successfully.' };
    } catch (error) {
        console.error('Database error:', error);
        return { message: 'Failed to update currency.' };
    }
}

export async function deleteCurrency(currencyCode: string) {
    try {
        const settings = await getAppSettings();
        if (settings.currency === currencyCode) {
            return { message: 'Cannot delete the default currency.' };
        }
        await deleteDbCurrency(currencyCode);
        revalidatePath('/settings/preferences/currency');
        return { message: 'Currency deleted successfully.' };
    } catch (error) {
        console.error('Database error:', error);
        return { message: 'Failed to delete currency.' };
    }
}

export async function updateAppSettings(settings: Partial<AppSettings>) {
    try {
        await updateDbAppSettings(settings);
        revalidatePath('/settings/preferences/currency');
        revalidatePath('/settings/preferences/dashboard'); 
        revalidatePath('/'); // Revalidate all pages that might use currency
        return { message: 'Settings updated successfully.' };
    } catch (error) {
         console.error('Database error:', error);
        return { message: 'Failed to update settings.' };
    }
}
