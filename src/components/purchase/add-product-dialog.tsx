
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlusCircle } from 'lucide-react';
import { createProduct, getNextProductId } from '@/app/purchase/products/actions';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '../ui/textarea';
import type { ProductCategory, Subcategory } from '../settings/product-preferences';

const initialState = { message: '', errors: {} };


function SubmitButton() {
    return <Button type="submit">Create Product</Button>;
}

interface AddProductDialogProps {
  categories: ProductCategory[];
}

export function AddProductDialog({ categories }: AddProductDialogProps) {
  const [state, dispatch] = useActionState(createProduct, initialState);
  const [isOpen, setIsOpen] = React.useState(false);
  const [nextId, setNextId] = React.useState('');
  const [selectedCategoryName, setSelectedCategoryName] = React.useState('');
  const [selectedSubcategoryName, setSelectedSubcategoryName] = React.useState('');
  const [subcategories, setSubcategories] = React.useState<Subcategory[]>([]);

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
        setSelectedCategoryName('');
        setSelectedSubcategoryName('');
        setSubcategories([]);
        setNextId('');
      }
    }
  }, [state, toast]);
  
  React.useEffect(() => {
    const category = categories.find(c => c.name === selectedCategoryName);
    setSubcategories(category ? category.subcategories : []);
    setSelectedSubcategoryName(''); // Reset subcategory when category changes
    setNextId(''); // Reset ID when category changes
  }, [selectedCategoryName, categories]);

  React.useEffect(() => {
      if(selectedCategoryName && selectedSubcategoryName) {
        const category = categories.find(c => c.name === selectedCategoryName);
        const subcategory = category?.subcategories.find(s => s.name === selectedSubcategoryName);
        if (category && subcategory) {
            getNextProductId(category.abbreviation, subcategory.abbreviation).then(setNextId);
        }
      } else {
        setNextId('');
      }
  }, [selectedCategoryName, selectedSubcategoryName, categories]);


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new product.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={dispatch} className="grid gap-4 py-4">
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="id" className="text-right">
              Product ID
            </Label>
            <Input id="id" name="id" className="col-span-3" value={nextId} readOnly />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" name="name" className="col-span-3" />
            {state.errors?.name && (
              <p className="col-span-4 text-red-500 text-xs text-right">{state.errors.name[0]}</p>
            )}
          </div>
           <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="text-right pt-2">
              Description
            </Label>
            <Textarea id="description" name="description" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
             <Select name="category" onValueChange={setSelectedCategoryName}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.name} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
             {state.errors?.category && (
              <p className="col-span-4 text-red-500 text-xs text-right">{state.errors.category[0]}</p>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="subcategory" className="text-right">
                Subcategory
            </Label>
            <Select name="subcategory" onValueChange={setSelectedSubcategoryName} disabled={!selectedCategoryName}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder={selectedCategoryName ? "Select a subcategory" : "Select a category first"} />
                </SelectTrigger>
                <SelectContent>
                    {subcategories.map((subcategory) => (
                        <SelectItem key={subcategory.name} value={subcategory.name}>
                            {subcategory.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {state.errors?.subcategory && (
                <p className="col-span-4 text-red-500 text-xs text-right">{state.errors.subcategory[0]}</p>
            )}
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Price
            </Label>
            <Input id="price" name="price" type="number" step="0.01" className="col-span-3" />
             {state.errors?.price && (
              <p className="col-span-4 text-red-500 text-xs text-right">{state.errors.price[0]}</p>
            )}
          </div>
            <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="stock" className="text-right">
              Stock
            </Label>
            <Input id="stock" name="stock" type="number" step="1" className="col-span-3" />
             {state.errors?.stock && (
              <p className="col-span-4 text-red-500 text-xs text-right">{state.errors.stock[0]}</p>
            )}
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

    
