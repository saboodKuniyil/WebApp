
'use server';

import { z } from 'zod';
import { getUsers, createUser as createDbUser, updateUser as updateDbUser, deleteUser as deleteDbUser } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import type { User } from '@/lib/db';

const userSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['Admin', 'Manager', 'User']),
  status: z.enum(['active', 'inactive']),
});

export type UserFormState = {
  message: string;
  errors?: {
    id?: string[];
    name?: string[];
    email?: string[];
    role?: string[];
    status?: string[];
  };
};

export async function getNextUserId(): Promise<string> {
    const users = await getUsers();
    if (users.length === 0) {
        return 'USR-001';
    }
    const userIds = users.map(u => parseInt(u.id.replace('USR-', ''), 10));
    const lastIdNumber = Math.max(...userIds);
    return `USR-${(lastIdNumber + 1).toString().padStart(3, '0')}`;
}

export async function createUser(
  prevState: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  const validatedFields = userSchema.safeParse({
    id: formData.get('id'),
    name: formData.get('name'),
    email: formData.get('email'),
    role: formData.get('role'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Failed to create user.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { id, name, email, role, status } = validatedFields.data;

  try {
     const users = await getUsers();
     const emailExists = users.some(u => u.email === email);
     if (emailExists) {
        return { message: 'Failed to create user. Email already exists.' };
     }

    await createDbUser({ id, name, email, role, status });

    revalidatePath('/settings/user-management');
    return { message: 'User created successfully.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Failed to create user.' };
  }
}

export async function updateUser(
    prevState: UserFormState,
    formData: FormData
): Promise<UserFormState> {
    const validatedFields = userSchema.safeParse({
        id: formData.get('id'),
        name: formData.get('name'),
        email: formData.get('email'),
        role: formData.get('role'),
        status: formData.get('status'),
    });

    if (!validatedFields.success) {
        return {
            message: 'Failed to update user.',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { id, ...userData } = validatedFields.data;

    try {
        await updateDbUser({ id, ...userData });
        revalidatePath('/settings/user-management');
        return { message: 'User updated successfully.' };
    } catch (error) {
        console.error('Database Error:', error);
        return { message: 'Failed to update user.' };
    }
}

export async function deleteUserAction(userId: string): Promise<{ message: string }> {
    try {
        await deleteDbUser(userId);
        revalidatePath('/settings/user-management');
        return { message: 'User deleted successfully.' };
    } catch (error: any) {
        console.error('Database Error:', error);
        return { message: 'Failed to delete user.' };
    }
}
