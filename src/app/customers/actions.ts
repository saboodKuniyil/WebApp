
'use server';

import { z } from 'zod';
import { getCustomers, createCustomer, updateCustomer as updateDbCustomer, deleteCustomer as deleteDbCustomer } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const customerSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  status: z.enum(['active', 'inactive']),
});

export type CustomerFormState = {
  message: string;
  errors?: {
    id?: string[];
    name?: string[];
    email?: string[];
    phone?: string[];
    address?: string[];
    status?: string[];
  };
};

export async function getNextCustomerId(): Promise<string> {
    const customers = await getCustomers();
    if (customers.length === 0) {
        return 'CUS-001';
    }
    const customerIds = customers.map(u => parseInt(u.id.replace('CUS-', ''), 10)).filter(num => !isNaN(num));
    if(customerIds.length === 0) {
      return 'CUS-001';
    }
    const lastIdNumber = Math.max(...customerIds);
    return `CUS-${(lastIdNumber + 1).toString().padStart(3, '0')}`;
}

export async function createCustomerAction(
  prevState: CustomerFormState,
  formData: FormData
): Promise<CustomerFormState> {
  const validatedFields = customerSchema.safeParse({
    id: formData.get('id'),
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    address: formData.get('address'),
    status: formData.get('status') ?? 'active',
  });

  if (!validatedFields.success) {
    return {
      message: 'Failed to create customer.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  const { email } = validatedFields.data;

  try {
     if (email) {
        const customers = await getCustomers();
        const emailExists = customers.some(u => u.email === email);
        if (emailExists) {
            return { message: 'Failed to create customer. Email already exists.' };
        }
     }

    await createCustomer({
        ...validatedFields.data,
        email: validatedFields.data.email || '',
        phone: validatedFields.data.phone || '',
        address: validatedFields.data.address || '',
    });

    revalidatePath('/crm/customers');
    revalidatePath('/sales/customers');
    return { message: 'Customer created successfully.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Failed to create customer.' };
  }
}

export async function updateCustomerAction(
    prevState: CustomerFormState,
    formData: FormData
): Promise<CustomerFormState> {
    const validatedFields = customerSchema.safeParse({
        id: formData.get('id'),
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        status: formData.get('status'),
    });

    if (!validatedFields.success) {
        return {
            message: 'Failed to update customer.',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    try {
        const customers = await getCustomers();
        const existingCustomer = customers.find(u => u.id === validatedFields.data.id);
        if (!existingCustomer) {
            return { message: 'Customer not found.' };
        }

        if (validatedFields.data.email && validatedFields.data.email !== existingCustomer.email) {
            const emailExists = customers.some(u => u.email === validatedFields.data.email);
            if (emailExists) {
                return { message: 'Failed to update customer. Email already exists.' };
            }
        }

        await updateDbCustomer({
            ...validatedFields.data,
            email: validatedFields.data.email || '',
            phone: validatedFields.data.phone || '',
            address: validatedFields.data.address || '',
        });
        revalidatePath('/crm/customers');
        revalidatePath('/sales/customers');
        return { message: 'Customer updated successfully.' };
    } catch (error) {
        console.error('Database Error:', error);
        return { message: 'Failed to update customer.' };
    }
}

export async function deleteCustomerAction(customerId: string): Promise<{ message: string }> {
    try {
        await deleteDbCustomer(customerId);
        revalidatePath('/crm/customers');
        revalidatePath('/sales/customers');
        return { message: 'Customer deleted successfully.' };
    } catch (error: any) {
        console.error('Database Error:', error);
        return { message: 'Failed to delete customer.' };
    }
}
