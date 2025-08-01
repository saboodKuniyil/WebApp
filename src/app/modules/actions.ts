
'use server';

import { z } from 'zod';
import { updateAppSettings as updateDbAppSettings } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import type { EnabledModules } from '@/lib/db';

export async function updateModuleSettings(
  modules: EnabledModules
): Promise<{ message: string }> {
  try {
    await updateDbAppSettings({ enabled_modules: modules });
    revalidatePath('/modules');
    revalidatePath('/layout', 'layout'); // Revalidate layout to show/hide sidebar items
    return { message: 'Module settings updated successfully.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Failed to update module settings.' };
  }
}
