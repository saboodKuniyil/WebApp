
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
import type { Unit } from '../settings/units-management';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import { getProductCategories, getUnits } from '@/lib/db';
import { Skeleton } from '../ui/skeleton';

const initialState = { message: '', errors: {} };

const productTypes = [
    { name: 'Raw Material', abbreviation: 'RM' },
    { name: 'Service', abbreviation: 'SRV' },
    { name: 'Finished Good', abbreviation: 'FG' },
];

function SubmitButton() {
    return <Button type="submit">Create Product</Button>;
}

export function AddProductDialog() {
  const [state, dispatch] = useActionState(createProduct, initialState);
  const [isOpen, setIsOpen] = React.useState(false);
  const [nextId, setNextId] = React.useState('');
  const [selectedTypeName, setSelectedTypeName] = React.useState('');
  const [selectedCategoryName, setSelectedCategoryName] = React.useState('');
  const [availableCategories, setAvailableCategories] = React.useState<ProductCategory[]>([]);
  const [subcategories, setSubcategories] = React.useState<Subcategory[]>([]);
  
  const [categories, setCategories] = React.useState<ProductCategory[]>([]);
  const [units, setUnits] = React.useState<Unit[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const { toast } = useToast();
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    async function fetchData() {
        if (isOpen) {
            setIsLoading(true);
            const [fetchedCategories, fetchedUnits] = await Promise.all([
                getProductCategories(),
                getUnits()
            ]);
            setCategories(fetchedCategories);
            setUnits(fetchedUnits);
            setIsLoading(false);
        }
    }
    fetchData();
  }, [isOpen]);

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
        setSelectedTypeName('');
        setSelectedCategoryName('');
        setAvailableCategories([]);
        setSubcategories([]);
        setNextId('');
      }
    }
  }, [state, toast]);

  React.useEffect(() => {
    if(selectedTypeName) {
      const filteredCategories = categories.filter(c => c.productType === selectedTypeName);
      setAvailableCategories(filteredCategories);
    } else {
      setAvailableCategories([]);
    }
    setSelectedCategoryName('');
    setSubcategories([]);
    setNextId('');
  }, [selectedTypeName, categories]);
  
  React.useEffect(() => {
    const category = availableCategories.find(c => c.name === selectedCategoryName);
    setSubcategories(category ? category.subcategories : []);
    setNextId(''); // Reset ID when category changes
  }, [selectedCategoryName, availableCategories]);

  React.useEffect(() => {
      if(selectedTypeName && selectedCategoryName) {
        const type = productTypes.find(t => t.name === selectedTypeName);
        const category = availableCategories.find(c => c.name === selectedCategoryName);
        if (type && category) {
            getNextProductId(type.abbreviation, category.abbreviation).then(setNextId);
        }
      } else {
        setNextId('');
      }
  }, [selectedTypeName, selectedCategoryName, availableCategories]);

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
          <form ref={formRef} action={dispatch}>
            <ScrollArea className="h-[70vh] pr-4">
              {isLoading ? (
                  <div className="space-y-4 py-4">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-8 w-1/2" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-20 w-full" />
                      <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                  </div>
              ) : (
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label>Type</Label>
                        <RadioGroup name="type" onValueChange={setSelectedTypeName} className="flex gap-2 flex-wrap">
                        {productTypes.map((type) => (
                            <Label key={type.name} htmlFor={`type-${type.abbreviation}`} className={cn("flex items-center space-x-2 rounded-md border p-2 cursor-pointer", selectedTypeName === type.name && "border-primary")}>
                            <RadioGroupItem value={type.name} id={`type-${type.abbreviation}`} className="sr-only"/>
                            <span>{type.name}</span>
                            </Label>
                        ))}
                        </RadioGroup>
                        {state.errors?.type && (
                        <p className="text-red-500 text-xs">{state.errors.type[0]}</p>
                        )}
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select name="category" onValueChange={setSelectedCategoryName} value={selectedCategoryName} disabled={!selectedTypeName}>
                        <SelectTrigger>
                            <SelectValue placeholder={selectedTypeName ? "Select a category" : "Select a type first"} />
                        </SelectTrigger>
                        <SelectContent>
                            {availableCategories.map((category) => (
                            <SelectItem key={category.name} value={category.name}>
                                {category.name}
                            </SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                        {state.errors?.category && (
                        <p className="text-red-500 text-xs">{state.errors.category[0]}</p>
                        )}
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="subcategory">Subcategory</Label>
                        <Select name="subcategory" disabled={!selectedCategoryName}>
                            <SelectTrigger>
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
                            <p className="text-red-500 text-xs">{state.errors.subcategory[0]}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="id">Product ID</Label>
                        <Input id="id" name="id" value={nextId} readOnly className="font-mono" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="name">Product Name</Label>
                        <Input id="name" name="name" />
                        {state.errors?.name && (
                        <p className="text-red-500 text-xs">{state.errors.name[0]}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="purchasePrice">Purchase Price</Label>
                                <Input id="purchasePrice" name="purchasePrice" type="number" step="0.01" />
                                {state.errors?.purchasePrice && (
                                    <p className="text-red-500 text-xs">{state.errors.purchasePrice[0]}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="salesPrice">Sales Price</Label>
                                <Input id="salesPrice" name="salesPrice" type="number" step="0.01" />
                                {state.errors?.salesPrice && (
                                    <p className="text-red-500 text-xs">{state.errors.salesPrice[0]}</p>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="stock">Stock</Label>
                            <Input id="stock" name="stock" type="number" step="1" />
                            {state.errors?.stock && (
                            <p className="text-red-500 text-xs">{state.errors.stock[0]}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="unit">Unit</Label>
                            <Select name="unit">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a unit" />
                                </SelectTrigger>
                                <SelectContent>
                                    {units.map((unit) => (
                                        <SelectItem key={unit.name} value={unit.name}>
                                            {unit.name} ({unit.abbreviation})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {state.errors?.unit && (
                                <p className="text-red-500 text-xs">{state.errors.unit[0]}</p>
                            )}
                        </div>
                    </div>
                </div>
              )}
            </ScrollArea>
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
