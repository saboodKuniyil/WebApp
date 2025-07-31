
'use server';

import { z } from 'zod';
import { getProducts, getProductCategories, createProduct as createDbProduct } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const productSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  type: z.string().min(1, 'Type is required'),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().min(1, 'Subcategory is required'),
  purchasePrice: z.coerce.number().min(0, 'Purchase price must be a positive number'),
  salesPrice: z.coerce.number().min(0, 'Sales price must be a positive number'),
  stock: z.coerce.number().int().min(0, 'Stock must be a positive integer'),
  unit: z.string().min(1, 'Unit is required'),
});

export type ProductFormState = {
  message: string;
  errors?: {
    id?: string[];
    name?: string[];
    description?: string[];
    type?: string[];
    category?: string[];
    subcategory?: string[];
    purchasePrice?: string[];
    salesPrice?: string[];
    stock?: string[];
    unit?: string[];
  };
};

export async function getNextProductId(typeAbbr: string, categoryAbbr: string): Promise<string> {
    if (!typeAbbr || !categoryAbbr) {
        return '';
    }
    const prefix = `${typeAbbr.toUpperCase()}_${categoryAbbr.toUpperCase()}_`;
    
    const products = await getProducts();
    const productIds = products
      .map(p => p.id)
      .filter(id => id.startsWith(prefix))
      .map(id => parseInt(id.replace(prefix, ''), 10))
      .filter(num => !isNaN(num));

    if (productIds.length === 0) {
        return `${prefix}7001`;
    }

    const lastNumber = Math.max(...productIds);
    const nextNumber = lastNumber + 1;
    return `${prefix}${nextNumber}`;
}

export async function createProduct(
  prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const validatedFields = productSchema.safeParse({
    id: formData.get('id'),
    name: formData.get('name'),
    description: formData.get('description'),
    type: formData.get('type'),
    category: formData.get('category'),
    subcategory: formData.get('subcategory'),
    purchasePrice: formData.get('purchasePrice'),
    salesPrice: formData.get('salesPrice'),
    stock: formData.get('stock'),
    unit: formData.get('unit'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Failed to create product.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { id, name, description, type, category, subcategory, purchasePrice, salesPrice, stock, unit } = validatedFields.data;

  try {
     const products = await getProducts();
     const idExists = products.some(p => p.id === id);

     if (idExists) {
        return { message: 'Failed to create product. The Product ID already exists.' };
     }

    await createDbProduct({
        id,
        name,
        description,
        type,
        category,
        subcategory,
        purchasePrice,
        salesPrice,
        stock,
        unit,
    });

    revalidatePath('/purchase/products');
    return { message: 'Product created successfully.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Failed to create product.' };
  }
}
