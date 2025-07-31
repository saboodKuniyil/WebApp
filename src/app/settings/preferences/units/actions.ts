
'use server';

import { z } from 'zod';
import { getUnits, createUnit as createDbUnit, updateUnit as updateDbUnit, deleteUnit as deleteDbUnit } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const unitSchema = z.object({
  name: z.string().min(1, 'Unit name is required'),
  abbreviation: z.string().min(1, 'Abbreviation is required'),
});

export type UnitFormState = {
  message: string;
  errors?: {
    name?: string[];
    abbreviation?: string[];
  };
};

export async function createUnit(
  prevState: UnitFormState,
  formData: FormData
): Promise<UnitFormState> {
  const validatedFields = unitSchema.safeParse({
    name: formData.get('name'),
    abbreviation: formData.get('abbreviation'),
  });
  
  if (!validatedFields.success) {
    return {
      message: 'Failed to create unit.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, abbreviation } = validatedFields.data;

  try {
    const units = await getUnits();
    const nameExists = units.some(u => u.name.toLowerCase() === name.toLowerCase());

    if (nameExists) {
        return { message: 'Failed to create unit. A unit with this name already exists.' };
    }
    
    const abbreviationExists = units.some(u => u.abbreviation.toLowerCase() === abbreviation.toLowerCase());
    if (abbreviationExists) {
        return { message: 'Failed to create unit. A unit with this abbreviation already exists.' };
    }


    await createDbUnit({ name, abbreviation });

    revalidatePath('/settings/preferences/product-preference');
    return { message: 'Unit created successfully.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Failed to create unit.' };
  }
}

const updateUnitSchema = z.object({
    originalName: z.string(),
    name: z.string().min(1, 'Unit name cannot be empty.'),
    abbreviation: z.string().min(1, 'Abbreviation cannot be empty.'),
});

export async function updateUnit(prevState: UnitFormState, formData: FormData): Promise<UnitFormState> {
    const validatedFields = updateUnitSchema.safeParse({
        originalName: formData.get('originalName'),
        name: formData.get('name'),
        abbreviation: formData.get('abbreviation'),
    });
    
    if (!validatedFields.success) {
        return { message: 'Validation failed.', errors: validatedFields.error.flatten().fieldErrors };
    }

    const { originalName, name, abbreviation } = validatedFields.data;

    try {
        const units = await getUnits();
        if (originalName !== name) {
            const nameExists = units.some(u => u.name.toLowerCase() === name.toLowerCase());
            if (nameExists) {
                return { message: 'Failed to update unit. Another unit with this name already exists.' };
            }
        }
        
        const existingUnit = units.find(u => u.name === originalName);
        if (existingUnit && existingUnit.abbreviation.toLowerCase() !== abbreviation.toLowerCase()) {
             const abbreviationExists = units.some(u => u.abbreviation.toLowerCase() === abbreviation.toLowerCase() && u.name !== originalName);
             if (abbreviationExists) {
                return { message: 'Failed to update unit. Another unit with this abbreviation already exists.' };
             }
        }
        
        await updateDbUnit(originalName, { name, abbreviation });
        revalidatePath('/settings/preferences/product-preference');
        return { message: 'Unit updated successfully.' };
    } catch (error) {
        console.error('Database error:', error);
        return { message: 'Failed to update unit.' };
    }
}

export async function deleteUnit(unitName: string) {
    try {
        await deleteDbUnit(unitName);
        revalidatePath('/settings/preferences/product-preference');
        return { message: 'Unit deleted successfully.' };
    } catch (error) {
        console.error('Database error:', error);
        return { message: 'Failed to delete unit.' };
    }
}
