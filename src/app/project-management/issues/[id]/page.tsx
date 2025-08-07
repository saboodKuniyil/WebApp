
import { getIssueById, getTaskById } from '@/lib/db';
import type { Issue } from "@/components/project-management/issues-list";
import type { Task } from '@/components/project-management/tasks-list';
import { notFound } from 'next/navigation';
import { IssueDetailView } from '@/components/project-management/issue-detail-view';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

async function getIssue(id: string): Promise<Issue | undefined> {
  return await getIssueById(id);
}

async function getTask(id: string): Promise<Task | undefined> {
  return await getTaskById(id);
}


export default async function IssueDetailPage({ params }: { params: { id: string } }) {
  const issue = await getIssue(params.id);
  
  if (!issue) {
    notFound();
  }
  
  const task = await getTask(issue.taskId);

  return (
    <main className="flex-1 space-y-4 p-2 md:p-4 pt-4">
      <div className="flex items-center justify-between space-y-2">
         <Button asChild variant="outline" size="sm">
            <Link href="/project-management/issues">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Issues
            </Link>
        </Button>
      </div>
      <IssueDetailView issue={issue} task={task} />
    </main>
  );
}
