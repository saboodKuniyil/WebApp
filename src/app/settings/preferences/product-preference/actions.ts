
'use server';

import { z } from 'zod';
import { getProductCategories, createProductCategory as createDbProductCategory, updateProductCategory as updateDbProductCategory, deleteProductCategory as deleteDbProductCategory } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const subcategorySchema = z.object({
  name: z.string().min(1, 'Subcategory name cannot be empty'),
  abbreviation: z.string().length(3, 'Abbreviation must be 3 characters'),
});

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  abbreviation: z.string().length(3, 'Abbreviation must be 3 characters'),
  subcategories: z.string()
    .transform((val) => JSON.parse(val))
    .pipe(z.array(subcategorySchema))
});

export type CategoryFormState = {
  message: string;
  errors?: {
    name?: string[];
    abbreviation?: string[];
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
    subcategories: formData.get('subcategories'),
  });
  
  if (!validatedFields.success) {
    return {
      message: 'Failed to create category.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, abbreviation, subcategories } = validatedFields.data;

  try {
    const categories = await getProductCategories();
    const nameExists = categories.some(c => c.name.toLowerCase() === name.toLowerCase());

    if (nameExists) {
        return { message: 'Failed to create category. A category with this name already exists.' };
    }
    
    const abbreviationExists = categories.some(c => c.abbreviation.toLowerCase() === abbreviation.toLowerCase());
    if (abbreviationExists) {
        return { message: 'Failed to create category. A category with this abbreviation already exists.' };
    }


    await createDbProductCategory({
        name,
        abbreviation,
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

const updateCategorySchema = z.object({
    originalName: z.string(),
    name: z.string().min(1, 'Category name cannot be empty.'),
    abbreviation: z.string().length(3, 'Abbreviation must be 3 characters'),
    subcategories: z.string().transform((val) => JSON.parse(val))
});

export async function updateProductCategory(prevState: CategoryFormState, formData: FormData): Promise<CategoryFormState> {
    const validatedFields = updateCategorySchema.safeParse({
        originalName: formData.get('originalName'),
        name: formData.get('name'),
        abbreviation: formData.get('abbreviation'),
        subcategories: formData.get('subcategories'),
    });
    
    if (!validatedFields.success) {
        return { message: 'Validation failed.', errors: validatedFields.error.flatten().fieldErrors };
    }

    const { originalName, name, abbreviation, subcategories } = validatedFields.data;

    try {
        const categories = await getProductCategories();
        if (originalName !== name) {
            const nameExists = categories.some(c => c.name.toLowerCase() === name.toLowerCase());
            if (nameExists) {
                return { message: 'Failed to update category. Another category with this name already exists.' };
            }
        }
        
        const existingCategory = categories.find(c => c.name === originalName);
        if (existingCategory && existingCategory.abbreviation !== abbreviation) {
             const abbreviationExists = categories.some(c => c.abbreviation.toLowerCase() === abbreviation.toLowerCase());
             if (abbreviationExists) {
                return { message: 'Failed to update category. Another category with this abbreviation already exists.' };
             }
        }
        
        await updateDbProductCategory(originalName, { name, abbreviation, subcategories });
        revalidatePath('/settings/preferences/product-preference');
        revalidatePath('/purchase/products');
        return { message: 'Category updated successfully.' };
    } catch (error) {
        console.error('Database error:', error);
        return { message: 'Failed to update category.' };
    }
}

export async function deleteProductCategory(categoryName: string) {
    try {
        await deleteDbProductCategory(categoryName);
        revalidatePath('/settings/preferences/product-preference');
        revalidatePath('/purchase/products');
        return { message: 'Category deleted successfully.' };
    } catch (error) {
        console.error('Database error:', error);
        return { message: 'Failed to delete category.' };
    }
}

    