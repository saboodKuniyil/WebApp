
'use client';

import * as React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '../ui/button';
import type { Task } from './tasks-list';
import { deleteTask } from '@/app/project-management/tasks/actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Draggable from 'react-draggable';

interface DeleteTaskDialogProps {
  task: Task;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function DeleteTaskDialog({ task, isOpen, setIsOpen }: DeleteTaskDialogProps) {
  const [isPending, startTransition] = React.useTransition();
  const { toast } = useToast();
  const router = useRouter();
  const nodeRef = React.useRef(null);

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteTask(task.id);
      if (result?.message) {
         toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message,
        });
      } else {
        toast({
          title: 'Success',
          description: 'Task has been deleted.',
        });
        // The redirect in the action will navigate away, but we can also push here
        router.push('/project-management/tasks');
      }
      setIsOpen(false);
    });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <Draggable nodeRef={nodeRef} handle=".alert-dialog-header">
        <AlertDialogContent ref={nodeRef}>
          <AlertDialogHeader className="alert-dialog-header cursor-move">
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task
              <span className="font-bold"> "{task.title}"</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              asChild
              disabled={isPending}
              onClick={handleDelete}
            >
              <Button variant="destructive">
                  {isPending ? 'Deleting...' : 'Delete Task'}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </Draggable>
    </AlertDialog>
  );
}
