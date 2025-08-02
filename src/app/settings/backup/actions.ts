
'use server';

import fs from 'fs/promises';
import path from 'path';

const dbPath = path.join(process.cwd(), 'src', 'lib', 'db.json');

export async function getDbJsonContent(): Promise<{ content: string | null; error?: string }> {
  try {
    const data = await fs.readFile(dbPath, 'utf-8');
    return { content: data };
  } catch (error) {
    console.error('Database read error:', error);
    return { content: null, error: 'Failed to read database file.' };
  }
}

export async function restoreDbFromJsonContent(content: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Basic validation to ensure it's a JSON string
    JSON.parse(content);

    // If parsing succeeds, write the file
    await fs.writeFile(dbPath, content, 'utf-8');
    return { success: true };
  } catch (error: any) {
    console.error('Database restore error:', error);
    if (error instanceof SyntaxError) {
      return { success: false, error: 'Invalid JSON file format.' };
    }
    return { success: false, error: 'Failed to restore database file.' };
  }
}
