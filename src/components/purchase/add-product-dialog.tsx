
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
import { PlusCircle, Plus, X, Trash2, Upload } from 'lucide-react';
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
import type { Product, BillOfMaterialItem, BillOfServiceItem } from './products-list';
import { Card } from '../ui/card';
import { useModules } from '@/context/modules-context';
import Image from 'next/image';

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
  const [allProducts, setAllProducts] = React.useState<Product[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { currency } = useModules();

  // Image state
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [imageData, setImageData] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // BOM state
  const [bom, setBom] = React.useState<BillOfMaterialItem[]>([]);
  const [selectedBomProduct, setSelectedBomProduct] = React.useState('');
  const [selectedBomQuantity, setSelectedBomQuantity] = React.useState(1);
  
  // BOS state
  const [bos, setBos] = React.useState<BillOfServiceItem[]>([]);
  const [selectedBosProduct, setSelectedBosProduct] = React.useState('');
  const [selectedBosQuantity, setSelectedBosQuantity] = React.useState(1);

  const [purchasePrice, setPurchasePrice] = React.useState(0);
  const [salesPrice, setSalesPrice] = React.useState(0);
  const [marginPercent, setMarginPercent] = React.useState(0);
  const [marginAmount, setMarginAmount] = React.useState(0);


  const rawMaterials = React.useMemo(() => allProducts.filter(p => p.type === 'Raw Material'), [allProducts]);
  const services = React.useMemo(() => allProducts.filter(p => p.type === 'Service'), [allProducts]);
  
  const { toast } = useToast();
  const formRef = React.useRef<HTMLFormElement>(null);

  const formatCurrency = React.useCallback((amount: number) => {
    if (!currency) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    }
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency.code,
        currencyDisplay: 'narrowSymbol'
    }).format(amount);
  }, [currency]);

  React.useEffect(() => {
    async function fetchData() {
        if (isOpen) {
            setIsLoading(true);
            const [fetchedCategories, fetchedUnits, fetchedProducts] = await Promise.all([
                getProductCategories(),
                getUnits(),
                getProducts()
            ]);
            setCategories(fetchedCategories);
            setUnits(fetchedUnits);
            setAllProducts(fetchedProducts);
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
    setBos([]);
    setPurchasePrice(0);
    setSalesPrice(0);
    setMarginAmount(0);
    setMarginPercent(0);
    setImagePreview(null);
    setImageData(null);
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

  // Cost Calculation Effect
  React.useEffect(() => {
    if (selectedTypeName === 'Finished Good') {
        const bomCost = bom.reduce((acc, item) => {
            const product = rawMaterials.find(p => p.id === item.productId);
            return acc + (product ? product.purchasePrice * item.quantity : 0);
        }, 0);
        const bosCost = bos.reduce((acc, item) => {
            const service = services.find(s => s.id === item.productId);
            return acc + (service ? service.purchasePrice * item.quantity : 0);
        }, 0);
        const totalCost = parseFloat((bomCost + bosCost).toFixed(2));
        setPurchasePrice(totalCost);
    }
  }, [bom, bos, rawMaterials, services, selectedTypeName]);

  // Update sales price when purchase price or margin changes
  React.useEffect(() => {
      const newMarginAmount = purchasePrice * (marginPercent / 100);
      setMarginAmount(parseFloat(newMarginAmount.toFixed(2)));
      setSalesPrice(parseFloat((purchasePrice + newMarginAmount).toFixed(2)));
  }, [purchasePrice, marginPercent]);


  const handleMarginPercentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const percent = parseFloat(e.target.value) || 0;
    setMarginPercent(percent);
  };

  const handleMarginAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const amount = parseFloat(e.target.value) || 0;
      setMarginAmount(amount);
      if (purchasePrice > 0) {
          const newMarginPercent = (amount / purchasePrice) * 100;
          setMarginPercent(parseFloat(newMarginPercent.toFixed(2)));
      } else {
          setMarginPercent(0);
      }
       setSalesPrice(parseFloat((purchasePrice + amount).toFixed(2)));
  };
  
  const handleSalesPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSalesPrice = parseFloat(e.target.value) || 0;
    setSalesPrice(newSalesPrice);
    const newMarginAmount = newSalesPrice - purchasePrice;
    setMarginAmount(parseFloat(newMarginAmount.toFixed(2)));
     if (purchasePrice > 0) {
        const newMarginPercent = (newMarginAmount / purchasePrice) * 100;
        setMarginPercent(parseFloat(newMarginPercent.toFixed(2)));
    } else {
        setMarginPercent(0);
    }
  };

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
  
  const handleAddBosItem = () => {
    if (selectedBosProduct && selectedBosQuantity > 0 && !bos.find(item => item.productId === selectedBosProduct)) {
      setBos([...bos, { productId: selectedBosProduct, quantity: selectedBosQuantity }]);
      setSelectedBosProduct('');
      setSelectedBosQuantity(1);
    }
  };

  const handleRemoveBosItem = (productId: string) => {
    setBos(bos.filter(item => item.productId !== productId));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setImageData(base64String);
      };
      reader.readAsDataURL(file);
    }
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
            <input type="hidden" name="billOfServices" value={JSON.stringify(bos)} />
            <input type="hidden" name="purchasePrice" value={purchasePrice} />
            <input type="hidden" name="salesPrice" value={salesPrice} />
            <input type="hidden" name="imageUrl" value={imageData || ''} />

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
                    <div className="grid grid-cols-[120px_1fr] gap-4 items-start">
                      <div className="space-y-2">
                        <Label>Image</Label>
                        <div 
                          className="aspect-square w-full border border-dashed rounded-lg flex items-center justify-center cursor-pointer relative overflow-hidden"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {imagePreview ? (
                            <Image src={imagePreview} alt="Product preview" fill className="object-cover" />
                          ) : (
                            <div className="text-center text-muted-foreground">
                              <Upload className="mx-auto h-8 w-8" />
                              <p className="text-xs mt-1">Click to upload</p>
                            </div>
                          )}
                        </div>
                         <Input 
                            ref={fileInputRef}
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                          {state.errors?.imageUrl && (
                            <p className="text-red-500 text-xs">{state.errors.imageUrl[0]}</p>
                          )}
                      </div>
                      <div className="space-y-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Product Name</Label>
                            <Input id="name" name="name" />
                            {state.errors?.name && (
                            <p className="text-red-500 text-xs">{state.errors.name[0]}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" name="description" rows={4} />
                        </div>
                      </div>
                    </div>

                    {selectedTypeName === 'Finished Good' && (
                        <>
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
                                    {bom.length > 0 && (
                                        <div className="grid grid-cols-[1fr_80px_80px_80px_40px] items-center gap-x-4 px-2 text-xs text-muted-foreground font-medium">
                                            <span>Material</span>
                                            <span className="text-right">Qty</span>
                                            <span className="text-right">Rate</span>
                                            <span className="text-right">Total</span>
                                            <span></span>
                                        </div>
                                    )}
                                    {bom.map(item => {
                                        const product = rawMaterials.find(p => p.id === item.productId);
                                        if (!product) return null;
                                        const totalItemCost = product.purchasePrice * item.quantity;
                                        return (
                                            <div key={item.productId} className="grid grid-cols-[1fr_80px_80px_80px_40px] items-center gap-x-4 p-2 border rounded-md text-sm">
                                                <span className="truncate" title={product.name}>{product.name}</span>
                                                <span className="text-right">{item.quantity} {product?.unit}</span>
                                                <span className="text-right">{formatCurrency(product.purchasePrice)}</span>
                                                <span className="text-right font-semibold">{formatCurrency(totalItemCost)}</span>
                                                <Button type="button" variant="ghost" size="icon" className="h-6 w-6 justify-self-end" onClick={() => handleRemoveBomItem(item.productId)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        )
                                    })}
                                </div>
                                {state.errors?.billOfMaterials && (
                                    <p className="text-red-500 text-xs">{state.errors.billOfMaterials[0]}</p>
                                )}
                            </Card>
                            
                            <Card className="p-4 space-y-4">
                                <Label>Bill of Services</Label>
                                <div className="flex gap-2">
                                    <Select onValueChange={setSelectedBosProduct} value={selectedBosProduct}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a service" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {services.map(service => (
                                                <SelectItem key={service.id} value={service.id}>{service.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Input type="number" value={selectedBosQuantity} onChange={e => setSelectedBosQuantity(Number(e.target.value))} className="w-24" min="1" />
                                    <Button type="button" size="icon" onClick={handleAddBosItem}><Plus className="h-4 w-4" /></Button>
                                </div>
                                <div className="space-y-2">
                                    {bos.length > 0 && (
                                        <div className="grid grid-cols-[1fr_80px_80px_80px_40px] items-center gap-x-4 px-2 text-xs text-muted-foreground font-medium">
                                            <span>Service</span>
                                            <span className="text-right">Qty</span>
                                            <span className="text-right">Rate</span>
                                            <span className="text-right">Total</span>
                                            <span></span>
                                        </div>
                                    )}
                                    {bos.map(item => {
                                        const service = services.find(s => s.id === item.productId);
                                        if (!service) return null;
                                        const totalItemCost = service.purchasePrice * item.quantity;
                                        return (
                                            <div key={item.productId} className="grid grid-cols-[1fr_80px_80px_80px_40px] items-center gap-x-4 p-2 border rounded-md text-sm">
                                                <span className="truncate" title={service.name}>{service.name}</span>
                                                <span className="text-right">{item.quantity} {service?.unit}</span>
                                                <span className="text-right">{formatCurrency(service.purchasePrice)}</span>
                                                <span className="text-right font-semibold">{formatCurrency(totalItemCost)}</span>
                                                <Button type="button" variant="ghost" size="icon" className="h-6 w-6 justify-self-end" onClick={() => handleRemoveBosItem(item.productId)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        )
                                    })}
                                </div>
                                {state.errors?.billOfServices && (
                                    <p className="text-red-500 text-xs">{state.errors.billOfServices[0]}</p>
                                )}
                            </Card>
                        </>
                    )}
                    <div className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-2 items-end">
                        <div className="space-y-2">
                            <Label htmlFor="purchasePrice">Purchase Price</Label>
                            <Input
                                id="purchasePriceDisplay"
                                type="number"
                                step="0.01"
                                value={purchasePrice}
                                onChange={(e) => setPurchasePrice(parseFloat(e.target.value) || 0)}
                                readOnly={selectedTypeName === 'Finished Good'}
                                className={selectedTypeName === 'Finished Good' ? 'font-semibold bg-muted' : ''}
                            />
                            {state.errors?.purchasePrice && (
                                <p className="text-red-500 text-xs">{state.errors.purchasePrice[0]}</p>
                            )}
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="marginPercent">Margin %</Label>
                            <Input
                                id="marginPercent"
                                type="number"
                                value={marginPercent}
                                onChange={handleMarginPercentChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="marginAmount">Margin Amount</Label>
                            <Input
                                id="marginAmount"
                                type="number"
                                value={marginAmount}
                                onChange={handleMarginAmountChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="salesPrice">Sales Price</Label>
                            <Input
                                id="salesPriceDisplay"
                                type="number"
                                step="0.01"
                                value={salesPrice}
                                onChange={handleSalesPriceChange}
                            />
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
