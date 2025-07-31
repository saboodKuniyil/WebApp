
'use client';

import * as React from 'react';
import { useActionState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle } from 'lucide-react';
import { createProductCategory } from '@/app/settings/preferences/product-preference/actions';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '../ui/textarea';

const initialState = { message: '', errors: {} };

function SubmitButton() {
    return <Button type="submit">Create Category</Button>;
}

export function AddCategoryDialog() {
  const [state, dispatch] = useActionState(createProductCategory, initialState);
  const [isOpen, setIsOpen] = React.useState(false);

  const { toast } = useToast();
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    if (state.message) {
      if (state.errors && Object.keys(state.errors).length > 0) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: state.message,
        });
      } else {
        toast({
          title: 'Success',
          description: state.message,
        });
        setIsOpen(false);
        formRef.current?.reset();
      }
    }
  }, [state, toast]);


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Category</DialogTitle>
          <DialogDescription>
            Define a new product category and its subcategories.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={dispatch} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Category Name
            </Label>
            <Input id="name" name="name" className="col-span-3" />
            {state.errors?.name && (
              <p className="col-span-4 text-red-500 text-xs text-right">{state.errors.name[0]}</p>
            )}
          </div>
           <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="subcategories" className="text-right pt-2">
              Subcategories
            </Label>
            <div className="col-span-3">
                <Textarea id="subcategories" name="subcategories" />
                <p className="text-xs text-muted-foreground mt-1">
                    Enter subcategory names separated by commas (e.g., Laptops, Keyboards, Monitors).
                </p>
                {state.errors?.subcategories && (
                    <p className="text-red-500 text-xs text-right">{state.errors.subcategories[0]}</p>
                )}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
