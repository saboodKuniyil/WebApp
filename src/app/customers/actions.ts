
'use server';

import { z } from 'zod';
import { getCustomers, createCustomer, updateCustomer as updateDbCustomer, deleteCustomer as deleteDbCustomer } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import Papa from 'papaparse';

const customerSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  status: z.enum(['active', 'inactive']),
  companyName: z.string().optional(),
  trnNumber: z.string().optional(),
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
    companyName?: string[];
    trnNumber?: string[];
  };
};

export async function getNextCustomerId(): Promise<string> {
    const customers = await getCustomers();
    const prefix = 'CS_';
    const startNumber = 4001;
    if (customers.length === 0) {
        return `${prefix}${startNumber}`;
    }
    const customerIds = customers
      .map(u => u.id)
      .filter(id => id.startsWith(prefix))
      .map(id => parseInt(id.replace(prefix, ''), 10))
      .filter(num => !isNaN(num));
      
    if(customerIds.length === 0) {
      return `${prefix}${startNumber}`;
    }
    const lastIdNumber = Math.max(...customerIds);
    return `${prefix}${lastIdNumber + 1}`;
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
    companyName: formData.get('companyName'),
    trnNumber: formData.get('trnNumber'),
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
        companyName: validatedFields.data.companyName || '',
        trnNumber: validatedFields.data.trnNumber || '',
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
        companyName: formData.get('companyName'),
        trnNumber: formData.get('trnNumber'),
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
            companyName: validatedFields.data.companyName || '',
            trnNumber: validatedFields.data.trnNumber || '',
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

export async function exportCustomersToCsv(): Promise<string> {
    const customers = await getCustomers();
    const csv = Papa.unparse(customers, {
        header: true,
        columns: ['id', 'name', 'email', 'phone', 'address', 'status', 'companyName', 'trnNumber'],
    });
    return csv;
}

export async function importCustomersFromCsv(csvData: string): Promise<{ message: string; errors?: any[] }> {
    try {
        const parsed = Papa.parse(csvData, { header: true, skipEmptyLines: true });
        if (parsed.errors.length) {
            return { message: 'Failed to parse CSV file.', errors: parsed.errors };
        }

        const newCustomers = parsed.data as any[];
        const allCustomers = await getCustomers();
        const allEmails = new Set(allCustomers.map(c => c.email).filter(Boolean));

        for (const customerData of newCustomers) {
             const validatedFields = customerSchema.partial({id: true, status: true}).safeParse({
                ...customerData,
                status: customerData.status || 'active',
            });

            if (!validatedFields.success) {
                 return { message: `Validation failed for customer ${customerData.name}: ${JSON.stringify(validatedFields.error.flatten().fieldErrors)}` };
            }

            const { name, email, phone, address, status, companyName, trnNumber } = validatedFields.data;

            if (email && allEmails.has(email)) {
                console.warn(`Skipping duplicate email: ${email}`);
                continue;
            }

            const newId = await getNextCustomerId();
            await createCustomer({
                id: newId,
                name: name || '',
                email: email || '',
                phone: phone || '',
                address: address || '',
                status: status || 'active',
                companyName: companyName || '',
                trnNumber: trnNumber || '',
            });
            
            if(email) allEmails.add(email);
        }

        revalidatePath('/crm/customers');
        revalidatePath('/sales/customers');
        return { message: 'Customers imported successfully.' };
    } catch (error: any) {
        console.error('CSV Import Error:', error);
        return { message: `Failed to import customers: ${error.message}` };
    }
}
