
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
import type { Project } from './projects-list';
import { deleteProject } from '@/app/project-management/projects/actions';
import { useToast } from '@/hooks/use-toast';
import Draggable from 'react-draggable';

interface DeleteProjectDialogProps {
  project: Project;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function DeleteProjectDialog({ project, isOpen, setIsOpen }: DeleteProjectDialogProps) {
  const [isPending, startTransition] = React.useTransition();
  const { toast } = useToast();
  const nodeRef = React.useRef(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteProject(project.id);
      if (result?.message) {
         toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message,
        });
      } else {
        toast({
          title: 'Success',
          description: 'Project and its tasks have been deleted.',
        });
        // The redirect in the action will navigate away
      }
      setIsOpen(false);
    });
  };
  
  if (!mounted) {
    return null;
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <Draggable nodeRef={nodeRef} handle=".alert-dialog-header">
        <AlertDialogContent ref={nodeRef}>
          <AlertDialogHeader className="alert-dialog-header cursor-move">
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project
              <span className="font-bold"> "{project.title}"</span> and all of its associated tasks.
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
                  {isPending ? 'Deleting...' : 'Delete Project'}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </Draggable>
    </AlertDialog>
  );
}
