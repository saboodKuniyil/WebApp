
'use client';

import * as React from 'react';
import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { createQuotationFromScratch, getNextQuotationId } from '@/app/sales/quotations/actions';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';
import { useModules } from '@/context/modules-context';
import type { Product } from '../purchase/products-list';
import type { QuotationItem } from './quotations-list';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { Textarea } from '../ui/textarea';
import Link from 'next/link';
import { Customer } from '@/lib/db';

const initialState = { message: '', errors: {} };

function SubmitButton() {
    return <Button type="submit">Create Quotation</Button>;
}

interface CreateQuotationFormProps {
    products: Product[];
    customers: Customer[];
}

export function CreateQuotationForm({ products, customers }: CreateQuotationFormProps) {
    const [state, dispatch] = useActionState(createQuotationFromScratch, initialState);
    const [nextId, setNextId] = React.useState('');
    const [items, setItems] = React.useState<QuotationItem[]>([]);
    const [totalCost, setTotalCost] = React.useState(0);
    
    // State for adding a product item
    const [selectedProduct, setSelectedProduct] = React.useState<string>('');
    const [productQuantity, setProductQuantity] = React.useState(1);
    
    // State for adding an ad-hoc item
    const [adhocName, setAdhocName] = React.useState('');
    const [adhocQuantity, setAdhocQuantity] = React.useState(1);
    const [adhocRate, setAdhocRate] = React.useState(0);
    const [adhocDescription, setAdhocDescription] = React.useState('');
    
    const { toast } = useToast();
    const formRef = React.useRef<HTMLFormElement>(null);
    const { currency } = useModules();

    const formatCurrency = React.useCallback((amount: number) => {
        if (!currency) {
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
        }
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.code }).format(amount);
    }, [currency]);

    React.useEffect(() => {
        if (state.message && state.errors) {
            toast({ variant: 'destructive', title: 'Error', description: state.message });
        }
    }, [state, toast]);

    React.useEffect(() => {
        getNextQuotationId().then(setNextId);
    }, []);

    React.useEffect(() => {
        const newTotalCost = items.reduce((acc, item) => acc + (item.quantity * item.rate), 0);
        setTotalCost(newTotalCost);
    }, [items]);

    const handleAddItem = (item: QuotationItem) => {
        setItems(prev => [...prev, item]);
    };
    
    const handleAddProduct = () => {
        const product = products.find(p => p.id === selectedProduct);
        if (!product || !selectedProduct) return;
        
        handleAddItem({
            id: product.id,
            title: product.name,
            description: product.description,
            quantity: productQuantity,
            rate: product.salesPrice,
            imageUrl: product.imageUrl
        });
        setSelectedProduct('');
        setProductQuantity(1);
    };

    const handleAddAdhocItem = () => {
        if (!adhocName || adhocQuantity <= 0 || adhocRate < 0) return;
        handleAddItem({
            id: `adhoc-${Date.now()}`,
            title: adhocName,
            description: adhocDescription,
            quantity: adhocQuantity,
            rate: adhocRate,
        });
        setAdhocName('');
        setAdhocQuantity(1);
        setAdhocRate(0);
        setAdhocDescription('');
    };
    
    const handleRemoveItem = (itemId: string) => {
        setItems(items.filter(item => item.id !== itemId));
    };

    return (
        <form ref={formRef} action={dispatch}>
            <Card>
                <CardHeader>
                    <CardTitle>New Quotation</CardTitle>
                    <CardDescription>Build a quotation by adding products or ad-hoc items.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <input type="hidden" name="id" value={nextId} />
                    <input type="hidden" name="items" value={JSON.stringify(items)} />
                    <input type="hidden" name="totalCost" value={totalCost} />
                    
                    <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label htmlFor="id-display">Quotation ID</Label>
                            <Input id="id-display" value={nextId} readOnly className="font-mono bg-muted" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input id="title" name="title" />
                            {state.errors?.title && <p className="text-red-500 text-xs text-right">{state.errors.title[0]}</p>}
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="customer">Customer</Label>
                        <Select name="customer">
                            <SelectTrigger>
                                <SelectValue placeholder="Select a customer" />
                            </SelectTrigger>
                            <SelectContent>
                                {customers.map((customer) => (
                                    <SelectItem key={customer.id} value={customer.name}>
                                        {customer.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                         {state.errors?.customer && <p className="text-red-500 text-xs text-right">{state.errors.customer[0]}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Quotation Items</Label>
                        <div className="border rounded-lg p-2 space-y-2">
                            {items.length > 0 ? (
                                <>
                                 <div className="grid grid-cols-[1fr_80px_80px_80px_40px] items-center gap-x-4 px-2 text-xs text-muted-foreground font-medium">
                                    <span>Material / Service</span>
                                    <span className="text-right">Qty</span>
                                    <span className="text-right">Rate</span>
                                    <span className="text-right">Total</span>
                                    <span></span>
                                </div>
                                {items.map(item => (
                                    <div key={item.id} className="grid grid-cols-[1fr_80px_80px_80px_40px] items-center gap-x-4 p-2 border rounded-md text-sm">
                                        <span className="truncate font-medium" title={item.title}>{item.title}</span>
                                        <span className="text-right">{item.quantity}</span>
                                        <span className="text-right">{formatCurrency(item.rate)}</span>
                                        <span className="text-right font-semibold">{formatCurrency(item.rate * item.quantity)}</span>
                                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6 justify-self-end" onClick={() => handleRemoveItem(item.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                ))}
                                </>
                            ) : (
                                <div className="text-center text-muted-foreground py-8">No items added yet.</div>
                            )}
                        </div>
                         {state.errors?.items && <p className="text-red-500 text-xs text-right">{state.errors.items[0]}</p>}
                    </div>
                     <Card className="p-4 mt-4">
                        <Tabs defaultValue="product">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="product">Add Product</TabsTrigger>
                                <TabsTrigger value="adhoc">Add Ad-hoc Item</TabsTrigger>
                            </TabsList>
                            <TabsContent value="product" className="pt-4">
                                <div className="flex items-end gap-2">
                                    <div className="flex-1 space-y-1">
                                        <Label>Product</Label>
                                        <Select onValueChange={setSelectedProduct}><SelectTrigger><SelectValue placeholder="Select a product" /></SelectTrigger><SelectContent>{products.map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({p.id})</SelectItem>)}</SelectContent></Select>
                                    </div>
                                    <div className="space-y-1"><Label>Quantity</Label><Input type="number" value={productQuantity} onChange={e => setProductQuantity(Number(e.target.value))} className="w-24" min="1" /></div>
                                    <Button type="button" onClick={handleAddProduct}><Plus className="h-4 w-4 mr-2" />Add</Button>
                                </div>
                            </TabsContent>
                            <TabsContent value="adhoc" className="pt-4 space-y-2">
                                <div className="flex items-end gap-2">
                                    <div className="flex-1 space-y-1"><Label>Item Name</Label><Input value={adhocName} onChange={e => setAdhocName(e.target.value)} /></div>
                                    <div className="space-y-1"><Label>Quantity</Label><Input type="number" value={adhocQuantity} onChange={e => setAdhocQuantity(Number(e.target.value))} className="w-24" min="1" /></div>
                                    <div className="space-y-1"><Label>Rate per Item</Label><Input type="number" value={adhocRate} onChange={e => setAdhocRate(Number(e.target.value))} className="w-28" /></div>
                                </div>
                                <div className="space-y-1"><Label>Description</Label><Textarea value={adhocDescription} onChange={e => setAdhocDescription(e.target.value)} /></div>
                                <div className="flex justify-end">
                                    <Button type="button" onClick={handleAddAdhocItem}><Plus className="h-4 w-4 mr-2" />Add</Button>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </Card>

                    <div className="flex justify-end">
                        <div className="text-right space-y-1 p-4 rounded-md border w-64 bg-background">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Grand Total:</span>
                                <span className="font-bold text-xl">{formatCurrency(totalCost)}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="justify-end gap-2">
                     <Button variant="outline" asChild>
                        <Link href="/sales/quotations">Cancel</Link>
                    </Button>
                    <SubmitButton />
                </CardFooter>
            </Card>
        </form>
    )
}
