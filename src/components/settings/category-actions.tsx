
'use client';

import * as React from 'react';
import { Button } from '../ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { EditCategoryDialog } from './edit-category-dialog';
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
import { deleteProductCategory } from '@/app/settings/preferences/product-preference/actions';
import { useToast } from '@/hooks/use-toast';
import type { ProductCategory } from './product-preferences';

interface CategoryActionsProps {
  category: ProductCategory;
}

export function CategoryActions({ category }: CategoryActionsProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const { toast } = useToast();

  const confirmDelete = async () => {
    const result = await deleteProductCategory(category.name);
    if (result.message.includes('success')) {
      toast({ title: 'Success', description: result.message });
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" size="icon" onClick={() => setIsEditDialogOpen(true)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setIsDeleteDialogOpen(true)}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      {isEditDialogOpen && (
        <EditCategoryDialog 
            isOpen={isEditDialogOpen}
            setIsOpen={setIsEditDialogOpen}
            category={category}
        />
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the 
              <span className="font-bold"> "{category?.name}"</span> category.
              Products using this category will need to be updated manually.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
