
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
