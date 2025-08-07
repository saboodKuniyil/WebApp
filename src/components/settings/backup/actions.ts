
'use server';

import { getDbJsonContent as getDbContent, restoreDbFromJsonContent as restoreDbContent } from '@/lib/db';

export async function getDbJsonContent(): Promise<{ content: string | null; error?: string }> {
  try {
    const result = await getDbContent();
    if (result.error || !result.content) {
      throw new Error(result.error || 'Backup content is empty.');
    }
    return { content: result.content };
  } catch (error: any) {
    console.error('Database read error:', error);
    return { content: null, error: error.message || 'Failed to read database file.' };
  }
}

export async function restoreDbFromJsonContent(content: string): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await restoreDbContent(content);
    if (!result.success) {
      throw new Error(result.error || 'An unknown error occurred during restore.');
    }
    return { success: true };
  } catch (error: any) {
    console.error('Database restore error:', error);
    return { success: false, error: error.message };
  }
}
