
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
import { PlusCircle, Plus, X } from 'lucide-react';
import { createProductCategory } from '@/app/settings/preferences/product-preference/actions';
import { useToast } from '@/hooks/use-toast';
import type { Subcategory } from './product-preferences';

const initialState = { message: '', errors: {} };

function SubmitButton() {
    return <Button type="submit">Create Category</Button>;
}

export function AddCategoryDialog() {
  const [state, dispatch] = useActionState(createProductCategory, initialState);
  const [isOpen, setIsOpen] = React.useState(false);
  const [subcategories, setSubcategories] = React.useState<Subcategory[]>([]);
  const [newSubcategoryName, setNewSubcategoryName] = React.useState('');
  const [newSubcategoryAbbr, setNewSubcategoryAbbr] = React.useState('');

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
        setSubcategories([]);
      }
    }
  }, [state, toast]);

  const handleAddSubcategory = () => {
    if (newSubcategoryName.trim() && newSubcategoryAbbr.trim().length === 3 && !subcategories.some(s => s.name === newSubcategoryName.trim())) {
      setSubcategories([...subcategories, { name: newSubcategoryName.trim(), abbreviation: newSubcategoryAbbr.trim().toUpperCase() }]);
      setNewSubcategoryName('');
      setNewSubcategoryAbbr('');
    }
  };

  const handleRemoveSubcategory = (sub: string) => {
    setSubcategories(subcategories.filter(s => s.name !== sub));
  };

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
          <input type="hidden" name="subcategories" value={JSON.stringify(subcategories)} />
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Category Name
            </Label>
            <Input id="name" name="name" className="col-span-3" />
            {state.errors?.name && (
              <p className="col-span-4 text-red-500 text-xs text-right">{state.errors.name[0]}</p>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="abbreviation" className="text-right">
              Abbreviation
            </Label>
            <Input id="abbreviation" name="abbreviation" className="col-span-3" maxLength={3} placeholder="e.g., ELC" />
            {state.errors?.abbreviation && (
              <p className="col-span-4 text-red-500 text-xs text-right">{state.errors.abbreviation[0]}</p>
            )}
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="subcategories-list" className="text-right pt-2">
              Subcategories
            </Label>
            <div className="col-span-3 space-y-2">
                <div className="flex gap-2">
                    <Input 
                        value={newSubcategoryName}
                        onChange={(e) => setNewSubcategoryName(e.target.value)}
                        placeholder="Subcategory Name"
                    />
                    <Input 
                        value={newSubcategoryAbbr}
                        onChange={(e) => setNewSubcategoryAbbr(e.target.value)}
                        placeholder="Abbr."
                        maxLength={3}
                        className="w-20"
                    />
                    <Button type="button" size="icon" onClick={handleAddSubcategory}>
                        <Plus className="h-4 w-4"/>
                    </Button>
                </div>
                <div className="space-y-2">
                    {subcategories.map(sub => (
                        <div key={sub.name} className="flex items-center justify-between rounded-md border p-2 text-sm">
                          <span>{sub.name} ({sub.abbreviation})</span>
                            <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveSubcategory(sub.name)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
                {state.errors?.subcategories && (
                    <p className="text-red-500 text-xs">{state.errors.subcategories[0]}</p>
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
