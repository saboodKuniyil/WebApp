
'use server';

import { z } from 'zod';
import { getUserRoles, updateUserRole as updateDbUserRole } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const permissionsSchema = z.object({
  view_dashboard: z.boolean(),
  manage_projects: z.boolean(),
  manage_tasks: z.boolean(),
  manage_purchase_module: z.boolean(),
  manage_crm_module: z.boolean(),
  manage_payroll_module: z.boolean(),
  manage_settings: z.boolean(),
  manage_users: z.boolean(),
});

const roleSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  permissions: z.string().transform(val => JSON.parse(val)).pipe(permissionsSchema),
});

export type RoleFormState = {
  message: string;
  errors?: {
    id?: string[];
    name?: string[];
    description?: string[];
    permissions?: string[];
  };
};

export async function updateUserRole(
    prevState: RoleFormState,
    formData: FormData
): Promise<RoleFormState> {
    const validatedFields = roleSchema.safeParse({
        id: formData.get('id'),
        name: formData.get('name'),
        description: formData.get('description'),
        permissions: formData.get('permissions'),
    });

    if (!validatedFields.success) {
        return {
            message: 'Failed to update role.',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { id, ...roleData } = validatedFields.data;

    try {
        const roles = await getUserRoles();
        const originalRole = roles.find(r => r.id === id);

        if (!originalRole) {
            return { message: 'Role not found.' };
        }
        
        await updateDbUserRole({ id, ...roleData });

        revalidatePath('/settings/user-management/roles');
        return { message: 'Role updated successfully.' };
    } catch (error) {
        console.error('Database Error:', error);
        return { message: 'Failed to update role.' };
    }
}
