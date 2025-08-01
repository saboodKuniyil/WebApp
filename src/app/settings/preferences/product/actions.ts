
'use server';

import { z } from 'zod';
import { getProductCategories, createProductCategory as createDbProductCategory, updateProductCategory as updateDbProductCategory, deleteProductCategory as deleteDbProductCategory } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const subcategorySchema = z.object({
  name: z.string().min(1, 'Subcategory name cannot be empty'),
  abbreviation: z.string().min(1, 'Subcategory abbreviation cannot be empty').max(3, 'Abbreviation cannot exceed 3 characters'),
});

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  abbreviation: z.string().min(1, 'Abbreviation is required').max(3, 'Abbreviation cannot exceed 3 characters'),
  productType: z.enum(['Raw Material', 'Service', 'Finished Good']),
  subcategories: z.string()
    .transform(val => JSON.parse(val))
    .pipe(z.array(subcategorySchema)),
});

export type CategoryFormState = {
  message: string;
  errors?: {
    name?: string[];
    abbreviation?: string[];
    productType?: string[];
    subcategories?: string[];
  };
};

export async function createProductCategory(
  prevState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  const validatedFields = categorySchema.safeParse({
    name: formData.get('name'),
    abbreviation: formData.get('abbreviation'),
    productType: formData.get('productType'),
    subcategories: formData.get('subcategories'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Failed to create category.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, abbreviation, productType, subcategories } = validatedFields.data;

  try {
    const categories = await getProductCategories();
    const nameExists = categories.some(c => c.name.toLowerCase() === name.toLowerCase());
    if (nameExists) {
        return { message: 'A category with this name already exists.' };
    }
    const abbrExists = categories.some(c => c.abbreviation.toLowerCase() === abbreviation.toLowerCase());
    if (abbrExists) {
        return { message: 'A category with this abbreviation already exists.' };
    }

    await createDbProductCategory({ name, abbreviation, productType, subcategories });
    revalidatePath('/settings/preferences/product');
    return { message: 'Category created successfully.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Failed to create category.' };
  }
}

export async function updateProductCategory(
  prevState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  const originalName = formData.get('originalName') as string;
   const validatedFields = categorySchema.safeParse({
    name: formData.get('name'),
    abbreviation: formData.get('abbreviation'),
    productType: formData.get('productType'),
    subcategories: formData.get('subcategories'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Failed to update category.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  try {
    await updateDbProductCategory(originalName, validatedFields.data);
    revalidatePath('/settings/preferences/product');
    return { message: 'Category updated successfully.' };
  } catch (error) {
     console.error('Database Error:', error);
    return { message: 'Failed to update category.' };
  }
}

export async function deleteProductCategory(categoryName: string): Promise<{ message: string }> {
    try {
        await deleteDbProductCategory(categoryName);
        revalidatePath('/settings/preferences/product');
        return { message: 'Category deleted successfully.' };
    } catch (error) {
        console.error('Database Error:', error);
        return { message: 'Failed to delete category.' };
    }
}
