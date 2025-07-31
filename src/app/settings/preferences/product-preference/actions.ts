
'use server';

import { z } from 'zod';
import { getProductCategories, createProductCategory as createDbProductCategory } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  subcategories: z.string()
    .transform((val) => val.split(',').map(s => s.trim()).filter(Boolean))
    .refine((val) => val.length > 0, { message: 'At least one subcategory is required' }),
});

export type CategoryFormState = {
  message: string;
  errors?: {
    name?: string[];
    subcategories?: string[];
  };
};

export async function createProductCategory(
  prevState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  const validatedFields = categorySchema.safeParse({
    name: formData.get('name'),
    subcategories: formData.get('subcategories'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Failed to create category.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, subcategories } = validatedFields.data;

  try {
    const categories = await getProductCategories();
    const nameExists = categories.some(c => c.name.toLowerCase() === name.toLowerCase());

    if (nameExists) {
        return { message: 'Failed to create category. A category with this name already exists.' };
    }

    await createDbProductCategory({
        name,
        subcategories,
    });

    revalidatePath('/settings/preferences/product-preference');
    revalidatePath('/purchase/products'); // Revalidate products page to update categories in the form
    return { message: 'Category created successfully.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Failed to create category.' };
  }
}
