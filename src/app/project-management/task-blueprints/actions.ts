
'use server';

import { z } from 'zod';
import { getTaskBlueprints, createTaskBlueprint as createDbTaskBlueprint } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const blueprintStatusSchema = z.object({
  name: z.string().min(1, 'Status name cannot be empty'),
  completionPercentage: z.coerce.number().min(0).max(100),
});

const blueprintSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  statuses: z.string()
    .min(1, 'At least one status is required')
    .transform(val => JSON.parse(val))
    .pipe(z.array(blueprintStatusSchema).min(1, 'At least one status is required')),
});

export type BlueprintFormState = {
  message: string;
  errors?: {
    id?: string[];
    name?: string[];
    statuses?: string[];
  };
};

export async function getNextTaskBlueprintId(): Promise<string> {
    const blueprints = await getTaskBlueprints();
    const bpIds = blueprints
      .map(p => p.id)
      .filter(id => id.startsWith('bp-'))
      .map(id => parseInt(id.replace('bp-', ''), 10))
      .filter(num => !isNaN(num));

    if (bpIds.length === 0) {
        return 'bp-1';
    }

    const lastNumber = Math.max(...bpIds);
    const nextNumber = lastNumber + 1;
    return `bp-${nextNumber}`;
}

export async function createTaskBlueprint(
  prevState: BlueprintFormState,
  formData: FormData
): Promise<BlueprintFormState> {
  const validatedFields = blueprintSchema.safeParse({
    id: formData.get('id'),
    name: formData.get('name'),
    statuses: formData.get('statuses'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Failed to create blueprint.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { id, name, statuses } = validatedFields.data;

  try {
     const blueprints = await getTaskBlueprints();
     const idExists = blueprints.some(p => p.id === id);

     if (idExists) {
        return { message: 'Failed to create blueprint. The ID already exists.' };
     }

    await createDbTaskBlueprint({
        id,
        name,
        statuses,
    });

    revalidatePath('/project-management/task-blueprints');
    return { message: 'Blueprint created successfully.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Failed to create blueprint.' };
  }
}
