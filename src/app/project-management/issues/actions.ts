
'use server';

import { z } from 'zod';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const issueSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required'),
  type: z.enum(['bug', 'feature-request', 'documentation']),
  status: z.enum(['open', 'in-progress', 'closed']),
  priority: z.enum(['low', 'medium', 'high']),
  taskId: z.string().min(1, 'Task is required'),
});

export type IssueFormState = {
  message: string;
  errors?: {
    id?: string[];
    title?: string[];
    type?: string[];
    status?: string[];
    priority?: string[];
    taskId?: string[];
  };
};

export async function getNextIssueId(): Promise<string> {
    const issues = await db.getIssues();
    const issueIds = issues
      .map(i => i.id)
      .filter(id => id.startsWith('ISSUE-'))
      .map(id => parseInt(id.replace('ISSUE-', ''), 10))
      .filter(num => !isNaN(num));

    if (issueIds.length === 0) {
        return 'ISSUE-284'; // Start from a reasonable number
    }

    const lastNumber = Math.max(...issueIds);
    const nextNumber = lastNumber + 1;
    return `ISSUE-${nextNumber}`;
}

export async function createIssue(
  prevState: IssueFormState,
  formData: FormData
): Promise<IssueFormState> {
  const validatedFields = issueSchema.safeParse({
    id: formData.get('id'),
    title: formData.get('title'),
    type: formData.get('type'),
    status: formData.get('status'),
    priority: formData.get('priority'),
    taskId: formData.get('taskId'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Failed to create issue.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { id, title, type, status, priority, taskId } = validatedFields.data;
  
  const newIssue = {
    id,
    title,
    type,
    status,
    priority,
    taskId,
    created: new Date().toISOString().split('T')[0], // Set creation date
  };

  try {
     const issues = await db.getIssues();
     const idExists = issues.some(p => p.id === id);

     if (idExists) {
        return { message: 'Failed to create issue. The Issue ID already exists.' };
     }

    await db.createIssue(newIssue);

    revalidatePath('/project-management/issues');
    revalidatePath(`/project-management/tasks/${taskId}`); // Revalidate related task page
    return { message: 'Issue created successfully.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Failed to create issue.' };
  }
}
