
'use client';

import * as React from 'react';
import { useActionState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Plus } from 'lucide-react';
import { updateProductCategory } from '@/app/settings/preferences/product-preference/actions';
import { useToast } from '@/hooks/use-toast';
import { ProductCategory } from './product-preferences';

const initialState = { message: '', errors: {} };

function SubmitButton() {
    return <Button type="submit">Save Changes</Button>;
}

interface EditCategoryDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  category: ProductCategory;
}

export function EditCategoryDialog({ isOpen, setIsOpen, category }: EditCategoryDialogProps) {
  const [state, dispatch] = useActionState(updateProductCategory, initialState);
  const { toast } = useToast();
  const formRef = React.useRef<HTMLFormElement>(null);

  const [name, setName] = React.useState(category.name);
  const [subcategories, setSubcategories] = React.useState(category.subcategories);
  const [newSubcategory, setNewSubcategory] = React.useState('');

  React.useEffect(() => {
    setName(category.name);
    setSubcategories(category.subcategories);
  }, [category]);

  React.useEffect(() => {
    if (state.message) {
      if (state.errors && Object.keys(state.errors).length > 0) {
        toast({ variant: 'destructive', title: 'Error', description: state.message });
      } else {
        toast({ title: 'Success', description: state.message });
        setIsOpen(false);
      }
    }
  }, [state, toast, setIsOpen]);

  const handleAddSubcategory = () => {
    if (newSubcategory.trim() && !subcategories.includes(newSubcategory.trim())) {
      setSubcategories([...subcategories, newSubcategory.trim()]);
      setNewSubcategory('');
    }
  };

  const handleRemoveSubcategory = (sub: string) => {
    setSubcategories(subcategories.filter(s => s !== sub));
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
          <DialogDescription>
            Update the category name and manage its subcategories.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={dispatch} className="grid gap-4 py-4">
          <input type="hidden" name="originalName" value={category.name} />
          <input type="hidden" name="subcategories" value={JSON.stringify(subcategories)} />

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Category Name
            </Label>
            <Input
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
            />
            {state.errors?.name && (
              <p className="col-span-4 text-red-500 text-xs text-right">{state.errors.name[0]}</p>
            )}
          </div>
           <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="subcategories-list" className="text-right pt-2">
              Subcategories
            </Label>
            <div className="col-span-3 space-y-2">
                <div className="flex gap-2">
                    <Input 
                        id="subcategories-list"
                        value={newSubcategory}
                        onChange={(e) => setNewSubcategory(e.target.value)}
                        placeholder="Add a new subcategory"
                        onKeyDown={(e) => {
                            if(e.key === 'Enter') {
                                e.preventDefault();
                                handleAddSubcategory();
                            }
                        }}
                    />
                    <Button type="button" size="icon" onClick={handleAddSubcategory}>
                        <Plus className="h-4 w-4"/>
                    </Button>
                </div>
                <div className="space-y-2">
                    {subcategories.map(sub => (
                        <div key={sub} className="flex items-center justify-between rounded-md border p-2">
                           <span>{sub}</span>
                            <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveSubcategory(sub)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
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
