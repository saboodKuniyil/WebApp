
'use server';

import { z } from 'zod';
import { updateCompanyProfile } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import type { CompanyProfile } from '@/lib/db';

const profileSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  trnNumber: z.string().optional(),
  logoUrl: z.string().url().or(z.literal('')).optional(),
  address: z.string().optional(),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  iban: z.string().optional(),
});

export type ProfileFormState = {
  message: string;
  errors?: {
    companyName?: string[];
    trnNumber?: string[];
    logoUrl?: string[];
    address?: string[];
    bankName?: string[];
    accountNumber?: string[];
    iban?: string[];
  };
};

export async function saveProfileSettings(
  prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const validatedFields = profileSchema.safeParse({
    companyName: formData.get('companyName'),
    trnNumber: formData.get('trnNumber'),
    logoUrl: formData.get('logoUrl'),
    address: formData.get('address'),
    bankName: formData.get('bankName'),
    accountNumber: formData.get('accountNumber'),
    iban: formData.get('iban'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Failed to update profile.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await updateCompanyProfile(validatedFields.data as CompanyProfile);
    revalidatePath('/settings/profile');
    return { message: 'Profile updated successfully.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Failed to update profile.' };
  }
}
