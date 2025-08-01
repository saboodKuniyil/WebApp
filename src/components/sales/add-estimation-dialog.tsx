
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
import { PlusCircle, Plus, Trash2 } from 'lucide-react';
import { createEstimation, getNextEstimationId } from '@/app/sales/estimations/actions';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';
import { useModules } from '@/context/modules-context';
import type { Product } from '../purchase/products-list';
import type { EstimationItem } from './estimations-list';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card } from '../ui/card';

const initialState = { message: '', errors: {} };

interface AddEstimationDialogProps {
    products: Product[];
}

function SubmitButton() {
    return <Button type="submit">Create Estimation</Button>;
}

export function AddEstimationDialog({ products }: AddEstimationDialogProps) {
    const [state, dispatch] = useActionState(createEstimation, initialState);
    const [isOpen, setIsOpen] = React.useState(false);
    const [nextId, setNextId] = React.useState('');
    const [items, setItems] = React.useState<EstimationItem[]>([]);
    const [totalCost, setTotalCost] = React.useState(0);
    
    // State for adding a product item
    const [selectedProduct, setSelectedProduct] = React.useState<string>('');
    const [productQuantity, setProductQuantity] = React.useState(1);
    
    // State for adding an ad-hoc item
    const [adhocName, setAdhocName] = React.useState('');
    const [adhocQuantity, setAdhocQuantity] = React.useState(1);
    const [adhocCost, setAdhocCost] = React.useState(0);
    
    const { toast } = useToast();
    const formRef = React.useRef<HTMLFormElement>(null);
    const { currency } = useModules();

    const formatCurrency = React.useCallback((amount: number) => {
        if (!currency) {
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
        }
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.code }).format(amount);
    }, [currency]);

    const resetForm = React.useCallback(() => {
        formRef.current?.reset();
        setItems([]);
        setTotalCost(0);
        setSelectedProduct('');
        setProductQuantity(1);
        setAdhocName('');
        setAdhocQuantity(1);
        setAdhocCost(0);
    }, []);

    React.useEffect(() => {
        if (state.message) {
            if (state.errors && Object.keys(state.errors).length > 0) {
                toast({ variant: 'destructive', title: 'Error', description: state.message });
            } else {
                toast({ title: 'Success', description: state.message });
                setIsOpen(false);
                resetForm();
            }
        }
    }, [state, toast, resetForm]);

    React.useEffect(() => {
        if (isOpen) {
            getNextEstimationId().then(setNextId);
        }
    }, [isOpen]);

    React.useEffect(() => {
        const newTotalCost = items.reduce((acc, item) => acc + (item.cost * item.quantity), 0);
        setTotalCost(newTotalCost);
    }, [items]);

    const handleAddProduct = () => {
        const product = products.find(p => p.id === selectedProduct);
        if (!product) return;
        
        const newItem: EstimationItem = {
            id: product.id,
            name: product.name,
            quantity: productQuantity,
            cost: product.salesPrice, // Use sales price for estimation
            type: 'product',
        };
        setItems([...items, newItem]);
        setSelectedProduct('');
        setProductQuantity(1);
    };

    const handleAddAdhocItem = () => {
        if (!adhocName || adhocQuantity <= 0 || adhocCost < 0) return;
        const newItem: EstimationItem = {
            id: `adhoc-${Date.now()}`,
            name: adhocName,
            quantity: adhocQuantity,
            cost: adhocCost,
            type: 'adhoc',
        };
        setItems([...items, newItem]);
        setAdhocName('');
        setAdhocQuantity(1);
        setAdhocCost(0);
    };

    const handleRemoveItem = (itemId: string) => {
        setItems(items.filter(item => item.id !== itemId));
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Estimation
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Create New Estimation</DialogTitle>
                    <DialogDescription>Build a cost sheet by adding products and ad-hoc items.</DialogDescription>
                </DialogHeader>
                <form ref={formRef} action={dispatch}>
                    <input type="hidden" name="id" value={nextId} />
                    <input type="hidden" name="items" value={JSON.stringify(items)} />
                    <input type="hidden" name="totalCost" value={totalCost} />
                    <ScrollArea className="h-[70vh] pr-4">
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="id-display" className="text-right">Estimation ID</Label>
                                <Input id="id-display" value={nextId} readOnly className="col-span-3 font-mono bg-muted" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="title" className="text-right">Title</Label>
                                <Input id="title" name="title" className="col-span-3" />
                                {state.errors?.title && <p className="col-span-4 text-red-500 text-xs text-right">{state.errors.title[0]}</p>}
                            </div>

                            <Card className="p-4">
                                <Tabs defaultValue="product">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="product">Add Product</TabsTrigger>
                                        <TabsTrigger value="adhoc">Add Ad-hoc Item</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="product" className="pt-4">
                                        <div className="flex items-end gap-2">
                                            <div className="flex-1 space-y-1">
                                                <Label>Product</Label>
                                                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                                                    <SelectTrigger><SelectValue placeholder="Select a product" /></SelectTrigger>
                                                    <SelectContent>
                                                        {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({p.id})</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-1">
                                                <Label>Quantity</Label>
                                                <Input type="number" value={productQuantity} onChange={e => setProductQuantity(Number(e.target.value))} className="w-24" min="1" />
                                            </div>
                                            <Button type="button" onClick={handleAddProduct}><Plus className="h-4 w-4 mr-2" />Add</Button>
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="adhoc" className="pt-4">
                                         <div className="flex items-end gap-2">
                                            <div className="flex-1 space-y-1">
                                                <Label>Item Name</Label>
                                                <Input value={adhocName} onChange={e => setAdhocName(e.target.value)} />
                                            </div>
                                            <div className="space-y-1">
                                                <Label>Quantity</Label>
                                                <Input type="number" value={adhocQuantity} onChange={e => setAdhocQuantity(Number(e.target.value))} className="w-24" min="1" />
                                            </div>
                                            <div className="space-y-1">
                                                <Label>Cost per Item</Label>
                                                <Input type="number" value={adhocCost} onChange={e => setAdhocCost(Number(e.target.value))} className="w-28" />
                                            </div>
                                            <Button type="button" onClick={handleAddAdhocItem}><Plus className="h-4 w-4 mr-2" />Add</Button>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </Card>

                            <div className="space-y-2">
                                <Label>Estimation Items</Label>
                                <Card className="p-2 space-y-2">
                                    <div className="grid grid-cols-[1fr_80px_80px_80px_40px] gap-x-4 px-2 text-xs text-muted-foreground font-medium">
                                        <span>Item Name</span>
                                        <span className="text-right">Quantity</span>
                                        <span className="text-right">Cost</span>
                                        <span className="text-right">Subtotal</span>
                                        <span></span>
                                    </div>
                                    {items.length > 0 ? items.map(item => (
                                        <div key={item.id} className="grid grid-cols-[1fr_80px_80px_80px_40px] items-center gap-x-4 p-2 border rounded-md text-sm">
                                            <span className="truncate" title={item.name}>{item.name}</span>
                                            <span className="text-right">{item.quantity}</span>
                                            <span className="text-right">{formatCurrency(item.cost)}</span>
                                            <span className="text-right font-semibold">{formatCurrency(item.cost * item.quantity)}</span>
                                            <Button type="button" variant="ghost" size="icon" className="h-6 w-6 justify-self-end" onClick={() => handleRemoveItem(item.id)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    )) : (
                                        <div className="text-center text-muted-foreground py-8">No items added yet.</div>
                                    )}
                                </Card>
                                 {state.errors?.items && <p className="text-red-500 text-xs text-right">{state.errors.items[0]}</p>}
                            </div>

                             <div className="flex justify-end">
                                <div className="text-right space-y-1 p-4 rounded-md border w-64">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Total Cost:</span>
                                        <span className="font-bold text-lg">{formatCurrency(totalCost)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline" onClick={resetForm}>Cancel</Button></DialogClose>
                        <SubmitButton />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
