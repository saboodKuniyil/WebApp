
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
import type { Vendor } from '@/lib/db';
import { deleteVendorAction } from '@/app/purchase/vendors/actions';
import { useToast } from '@/hooks/use-toast';

interface DeleteVendorDialogProps {
  vendor: Vendor;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function DeleteVendorDialog({ vendor, isOpen, setIsOpen }: DeleteVendorDialogProps) {
  const [isPending, startTransition] = React.useTransition();
  const { toast } = useToast();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteVendorAction(vendor.id);
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
            This action cannot be undone. This will permanently delete the vendor{' '}
            <span className="font-bold">"{vendor.name}"</span>.
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
                {isPending ? 'Deleting...' : 'Delete Vendor'}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
