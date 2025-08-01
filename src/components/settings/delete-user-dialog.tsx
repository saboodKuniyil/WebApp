
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
import type { User } from '@/lib/db';
import { deleteUserAction } from '@/app/settings/user-management/actions';
import { useToast } from '@/hooks/use-toast';

interface DeleteUserDialogProps {
  user: User;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function DeleteUserDialog({ user, isOpen, setIsOpen }: DeleteUserDialogProps) {
  const [isPending, startTransition] = React.useTransition();
  const { toast } = useToast();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteUserAction(user.id);
      if (result.message.includes('success')) {
        toast({
          title: 'Success',
          description: result.message,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message,
        });
      }
      setIsOpen(false);
    });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the user{' '}
            <span className="font-bold">"{user.name}"</span>.
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
                {isPending ? 'Deleting...' : 'Delete User'}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
