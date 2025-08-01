
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
import { ProductCategory, Subcategory } from './product-preferences';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const initialState = { message: '', errors: {} };
const productTypes = ["Raw Material", "Service", "Finished Good"];

function SubmitButton() {
    return <Button type="submit">Save Changes</Button>;
}

interface EditCategoryDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  category: ProductCategory | null;
}

export function EditCategoryDialog({ isOpen, setIsOpen, category }: EditCategoryDialogProps) {
  const [state, dispatch] = useActionState(updateProductCategory, initialState);
  const { toast } = useToast();
  
  const [currentSubcategories, setCurrentSubcategories] = React.useState<Subcategory[]>([]);
  const [newSubcategoryName, setNewSubcategoryName] = React.useState('');
  const [newSubcategoryAbbr, setNewSubcategoryAbbr] = React.useState('');
  const [formKey, setFormKey] = React.useState(() => Date.now());

  React.useEffect(() => {
    if (category) {
      setCurrentSubcategories(category.subcategories);
    }
    // When the dialog opens, reset the form by changing its key
    if (isOpen) {
        setFormKey(Date.now());
    }
  }, [category, isOpen]);
  
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
    if (newSubcategoryName.trim() && newSubcategoryAbbr.trim().length === 3 && !currentSubcategories.some(s => s.name === newSubcategoryName.trim())) {
      setCurrentSubcategories([...currentSubcategories, { name: newSubcategoryName.trim(), abbreviation: newSubcategoryAbbr.trim().toUpperCase() }]);
      setNewSubcategoryName('');
      setNewSubcategoryAbbr('');
    }
  };

  const handleRemoveSubcategory = (subNameToRemove: string) => {
    setCurrentSubcategories(currentSubcategories.filter(s => s.name !== subNameToRemove));
  };
  
  if (!category) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Category: {category.name}</DialogTitle>
          <DialogDescription>
            Update the category name and manage its subcategories.
          </DialogDescription>
        </DialogHeader>
        <form key={formKey} action={dispatch} className="grid gap-4 py-4">
          <input type="hidden" name="originalName" value={category.name} />
          <input type="hidden" name="subcategories" value={JSON.stringify(currentSubcategories)} />
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="productType" className="text-right">
              Product Type
            </Label>
            <Select name="productType" defaultValue={category.productType}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a product type" />
              </SelectTrigger>
              <SelectContent>
                {productTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state.errors?.productType && (
              <p className="col-span-4 text-red-500 text-xs text-right">{state.errors.productType[0]}</p>
            )}
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Category Name
            </Label>
            <Input
              id="name"
              name="name"
              defaultValue={category.name}
              className="col-span-3"
            />
            {state.errors?.name && (
              <p className="col-span-4 text-red-500 text-xs text-right">{state.errors.name[0]}</p>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="abbreviation" className="text-right">
              Abbreviation
            </Label>
            <Input
              id="abbreviation"
              name="abbreviation"
              defaultValue={category.abbreviation}
              className="col-span-3"
              maxLength={3}
            />
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
                        id="subcategories-list"
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
                    {currentSubcategories.map(sub => (
                        <div key={sub.name} className="flex items-center justify-between rounded-md border p-2 text-sm">
                          <span>{sub.name} ({sub.abbreviation})</span>
                            <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveSubcategory(sub.name)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
