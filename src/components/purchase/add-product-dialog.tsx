
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
import { PlusCircle, Plus, X, Trash2 } from 'lucide-react';
import { createProduct, getNextProductId } from '@/app/purchase/products/actions';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '../ui/textarea';
import type { ProductCategory, Subcategory } from '../settings/product-preferences';
import type { Unit } from '../settings/units-management';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import { getProductCategories, getUnits, getProducts } from '@/lib/db';
import { Skeleton } from '../ui/skeleton';
import type { Product, BillOfMaterialItem } from './products-list';
import { Card } from '../ui/card';

const initialState = { message: '', errors: {} };

const productTypes = [
    { name: 'Raw Material', abbreviation: 'RM' },
    { name: 'Service', abbreviation: 'SRV' },
    { name: 'Finished Good', abbreviation: 'FG' },
];

function SubmitButton() {
    return <Button type="submit">Create Product</Button>;
}

interface AddProductDialogProps {
  allProducts: Product[];
}

export function AddProductDialog({ allProducts }: AddProductDialogProps) {
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

  // BOM state
  const [bom, setBom] = React.useState<BillOfMaterialItem[]>([]);
  const [selectedBomProduct, setSelectedBomProduct] = React.useState('');
  const [selectedBomQuantity, setSelectedBomQuantity] = React.useState(1);
  const [calculatedCost, setCalculatedCost] = React.useState(0);

  const rawMaterials = React.useMemo(() => allProducts.filter(p => p.type === 'Raw Material'), [allProducts]);
  
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

  const resetFormState = React.useCallback(() => {
    formRef.current?.reset();
    setSelectedTypeName('');
    setSelectedCategoryName('');
    setAvailableCategories([]);
    setSubcategories([]);
    setNextId('');
    setBom([]);
    setCalculatedCost(0);
  }, []);

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
        resetFormState();
      }
    }
  }, [state, toast, resetFormState]);

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

  // BOM Calculation Effect
  React.useEffect(() => {
    const cost = bom.reduce((acc, item) => {
        const product = rawMaterials.find(p => p.id === item.productId);
        return acc + (product ? product.purchasePrice * item.quantity : 0);
    }, 0);
    setCalculatedCost(cost);
  }, [bom, rawMaterials]);

  const handleAddBomItem = () => {
    if (selectedBomProduct && selectedBomQuantity > 0 && !bom.find(item => item.productId === selectedBomProduct)) {
      setBom([...bom, { productId: selectedBomProduct, quantity: selectedBomQuantity }]);
      setSelectedBomProduct('');
      setSelectedBomQuantity(1);
    }
  };

  const handleRemoveBomItem = (productId: string) => {
    setBom(bom.filter(item => item.productId !== productId));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
              Fill in the details below to create a new product.
          </DialogDescription>
          </DialogHeader>
          <form ref={formRef} action={dispatch}>
            <input type="hidden" name="billOfMaterials" value={JSON.stringify(bom)} />
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
                    
                    <div className="grid grid-cols-2 gap-4">
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
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="id">Product ID</Label>
                        <Input id="id" name="id" value={nextId} readOnly className="font-mono bg-muted" />
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

                    {selectedTypeName === 'Finished Good' && (
                        <Card className="p-4 space-y-4">
                            <Label>Bill of Materials</Label>
                             <div className="flex gap-2">
                                <Select onValueChange={setSelectedBomProduct} value={selectedBomProduct}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a raw material" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {rawMaterials.map(product => (
                                            <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Input type="number" value={selectedBomQuantity} onChange={e => setSelectedBomQuantity(Number(e.target.value))} className="w-24" min="1" />
                                <Button type="button" size="icon" onClick={handleAddBomItem}><Plus className="h-4 w-4" /></Button>
                            </div>
                            <div className="space-y-2">
                                {bom.map(item => {
                                    const product = rawMaterials.find(p => p.id === item.productId);
                                    return (
                                        <div key={item.productId} className="flex items-center justify-between p-2 border rounded-md text-sm">
                                            <span>{product?.name}</span>
                                            <div className="flex items-center gap-2">
                                                <span>{item.quantity} {product?.unit}</span>
                                                <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveBomItem(item.productId)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                            {state.errors?.billOfMaterials && (
                                <p className="text-red-500 text-xs">{state.errors.billOfMaterials[0]}</p>
                            )}
                        </Card>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="purchasePrice">Purchase Price</Label>
                            <Input 
                                id="purchasePrice" 
                                name="purchasePrice" 
                                type="number" 
                                step="0.01" 
                                readOnly={selectedTypeName === 'Finished Good'}
                                value={selectedTypeName === 'Finished Good' ? calculatedCost : undefined}
                                onChange={selectedTypeName === 'Finished Good' ? undefined : (e) => {}}
                                className={selectedTypeName === 'Finished Good' ? 'bg-muted' : ''}
                            />
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
                <Button variant="outline" onClick={resetFormState}>Cancel</Button>
                </DialogClose>
                <SubmitButton />
            </DialogFooter>
          </form>
      </DialogContent>
    </Dialog>
  );
}
