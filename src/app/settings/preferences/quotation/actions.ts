
'use server';

import { z } from 'zod';
import { getAppSettings, updateAppSettings as updateDbAppSettings } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import type { AppSettings, QuotationSettings } from '@/lib/db';

const quotationSettingsSchema = z.object({
  termsAndConditions: z.string().optional(),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  iban: z.string().optional(),
  taxPercentage: z.coerce.number().min(0, 'Tax percentage must be non-negative').optional(),
});

export type QuotationSettingsFormState = {
  message: string;
  errors?: {
    termsAndConditions?: string[];
    bankName?: string[];
    accountNumber?: string[];
    iban?: string[];
    taxPercentage?: string[];
  };
  updatedSettings?: AppSettings;
};

export async function updateQuotationSettings(
  prevState: QuotationSettingsFormState,
  formData: FormData
): Promise<QuotationSettingsFormState> {

  const validatedFields = quotationSettingsSchema.safeParse({
    termsAndConditions: formData.get('termsAndConditions'),
    bankName: formData.get('bankName'),
    accountNumber: formData.get('accountNumber'),
    iban: formData.get('iban'),
    taxPercentage: formData.get('taxPercentage'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Failed to update settings.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const currentSettings = await getAppSettings();
    const newQuotationSettings: QuotationSettings = {
        termsAndConditions: validatedFields.data.termsAndConditions ?? currentSettings.quotationSettings?.termsAndConditions ?? '',
        bankName: validatedFields.data.bankName ?? currentSettings.quotationSettings?.bankName ?? '',
        accountNumber: validatedFields.data.accountNumber ?? currentSettings.quotationSettings?.accountNumber ?? '',
        iban: validatedFields.data.iban ?? currentSettings.quotationSettings?.iban ?? '',
        taxPercentage: validatedFields.data.taxPercentage ?? currentSettings.quotationSettings?.taxPercentage ?? 0,
    };
    
    const newAppSettings = {
        ...currentSettings,
        quotationSettings: newQuotationSettings
    };

    await updateDbAppSettings(newAppSettings);
    
    revalidatePath('/settings/preferences/quotation');
    revalidatePath('/sales/quotations', 'layout'); // Revalidate quotations to reflect changes

    return { message: 'Quotation preferences updated successfully.', updatedSettings: newAppSettings };
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Failed to update settings.' };
  }
}
