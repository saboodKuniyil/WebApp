
'use server';

import { z } from 'zod';
import { getProducts, createProduct as createDbProduct } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const productSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  price: z.coerce.number().min(0, 'Price must be a positive number'),
  stock: z.coerce.number().int().min(0, 'Stock must be a positive integer'),
});

export type ProductFormState = {
  message: string;
  errors?: {
    id?: string[];
    name?: string[];
    description?: string[];
    category?: string[];
    price?: string[];
    stock?: string[];
  };
};

export async function getNextProductId(): Promise<string> {
    const products = await getProducts();
    const productIds = products
      .map(p => p.id)
      .filter(id => id.startsWith('PROD-'))
      .map(id => parseInt(id.replace('PROD-', ''), 10))
      .filter(num => !isNaN(num));

    if (productIds.length === 0) {
        return 'PROD-001';
    }

    const lastNumber = Math.max(...productIds);
    const nextNumber = lastNumber + 1;
    return `PROD-${nextNumber.toString().padStart(3, '0')}`;
}

export async function createProduct(
  prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const validatedFields = productSchema.safeParse({
    id: formData.get('id'),
    name: formData.get('name'),
    description: formData.get('description'),
    category: formData.get('category'),
    price: formData.get('price'),
    stock: formData.get('stock'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Failed to create product.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { id, name, description, category, price, stock } = validatedFields.data;

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
        category,
        price,
        stock
    });

    revalidatePath('/purchase/products');
    return { message: 'Product created successfully.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Failed to create product.' };
  }
}
