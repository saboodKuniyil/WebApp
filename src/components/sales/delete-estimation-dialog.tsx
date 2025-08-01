
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
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { deleteEstimation } from '@/app/sales/estimations/actions';
import type { Estimation } from './estimations-list';

interface DeleteEstimationDialogProps {
  estimation: Estimation;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function DeleteEstimationDialog({ estimation, isOpen, setIsOpen }: DeleteEstimationDialogProps) {
  const [isPending, startTransition] = React.useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteEstimation(estimation.id);
      if (result?.message) {
         toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message,
        });
      } else {
        toast({
          title: 'Success',
          description: 'Estimation has been deleted.',
        });
        router.push('/sales/estimations');
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
            This action cannot be undone. This will permanently delete the estimation
            <span className="font-bold"> "{estimation.title}"</span>.
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
                {isPending ? 'Deleting...' : 'Delete Estimation'}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
