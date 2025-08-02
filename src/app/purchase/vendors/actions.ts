
'use server';

import { z } from 'zod';
import { getVendors, createVendor, updateVendor as updateDbVendor, deleteVendor as deleteDbVendor } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const vendorSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  address: z.string().min(1, 'Address is required'),
  status: z.enum(['active', 'inactive']),
});

export type VendorFormState = {
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

export async function getNextVendorId(): Promise<string> {
    const vendors = await getVendors();
    if (vendors.length === 0) {
        return 'VND-001';
    }
    const vendorIds = vendors.map(u => parseInt(u.id.replace('VND-', ''), 10)).filter(num => !isNaN(num));
    if(vendorIds.length === 0) {
      return 'VND-001';
    }
    const lastIdNumber = Math.max(...vendorIds);
    return `VND-${(lastIdNumber + 1).toString().padStart(3, '0')}`;
}

export async function createVendorAction(
  prevState: VendorFormState,
  formData: FormData
): Promise<VendorFormState> {
  const validatedFields = vendorSchema.safeParse({
    id: formData.get('id'),
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    address: formData.get('address'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Failed to create vendor.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
     const vendors = await getVendors();
     const emailExists = vendors.some(u => u.email === validatedFields.data.email);
     if (emailExists) {
        return { message: 'Failed to create vendor. Email already exists.' };
     }

    await createVendor(validatedFields.data);

    revalidatePath('/purchase/vendors');
    return { message: 'Vendor created successfully.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Failed to create vendor.' };
  }
}

export async function updateVendorAction(
    prevState: VendorFormState,
    formData: FormData
): Promise<VendorFormState> {
    const validatedFields = vendorSchema.safeParse({
        id: formData.get('id'),
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        status: formData.get('status'),
    });

    if (!validatedFields.success) {
        return {
            message: 'Failed to update vendor.',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    try {
        const vendors = await getVendors();
        const existingVendor = vendors.find(u => u.id === validatedFields.data.id);
        if (!existingVendor) {
            return { message: 'Vendor not found.' };
        }

        if (validatedFields.data.email !== existingVendor.email) {
            const emailExists = vendors.some(u => u.email === validatedFields.data.email);
            if (emailExists) {
                return { message: 'Failed to update vendor. Email already exists.' };
            }
        }

        await updateDbVendor(validatedFields.data);
        revalidatePath('/purchase/vendors');
        return { message: 'Vendor updated successfully.' };
    } catch (error) {
        console.error('Database Error:', error);
        return { message: 'Failed to update vendor.' };
    }
}

export async function deleteVendorAction(vendorId: string): Promise<{ message: string }> {
    try {
        await deleteDbVendor(vendorId);
        revalidatePath('/purchase/vendors');
        return { message: 'Vendor deleted successfully.' };
    } catch (error: any) {
        console.error('Database Error:', error);
        return { message: 'Failed to delete vendor.' };
    }
}
