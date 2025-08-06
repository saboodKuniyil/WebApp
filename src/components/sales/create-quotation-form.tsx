
'use client';

import * as React from 'react';
import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { createQuotationFromScratch, getNextQuotationId, createQuotationFromEstimation } from '@/app/sales/quotations/actions';
import { useToast } from '@/hooks/use-toast';
import { useModules } from '@/context/modules-context';
import type { QuotationItem } from './quotations-list';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { Textarea } from '../ui/textarea';
import Link from 'next/link';
import { Customer, Estimation } from '@/lib/db';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

const fromScratchInitialState = { message: '', errors: {}, quotationId: undefined };
const fromEstInitialState = { message: '', errors: {}, quotationId: undefined };

interface CreateQuotationFormProps {
    customers: Customer[];
    estimations: Estimation[];
}

export function CreateQuotationForm({ customers, estimations }: CreateQuotationFormProps) {
    const [fromScratchState, fromScratchDispatch] = useActionState(createQuotationFromScratch, fromScratchInitialState);
    const [fromEstState, fromEstDispatch] = useActionState(createQuotationFromEstimation, fromEstInitialState);

    const [nextId, setNextId] = React.useState('');
    const [items, setItems] = React.useState<QuotationItem[]>([]);
    
    const [subtotal, setSubtotal] = React.useState(0);
    const [marginPercent, setMarginPercent] = React.useState(0);
    const [marginAmount, setMarginAmount] = React.useState(0);
    const [totalCost, setTotalCost] = React.useState(0);
    
    const { toast } = useToast();
    const formRef = React.useRef<HTMLFormElement>(null);
    const { currency, appSettings } = useModules();
    const router = useRouter();

    const taxPercentage = appSettings?.quotationSettings?.taxPercentage ?? 0;

    const approvedEstimations = React.useMemo(() => {
        return estimations.filter(e => e.status === 'approved');
    }, [estimations]);

    const formatCurrency = React.useCallback((amount: number) => {
        if (!currency) {
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
        }
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.code }).format(amount);
    }, [currency]);

    React.useEffect(() => {
        if (fromScratchState.message) {
             if (fromScratchState.quotationId) {
                toast({ title: 'Success', description: fromScratchState.message });
                router.push(`/sales/quotations/${fromScratchState.quotationId}`);
            } else {
                toast({ variant: 'destructive', title: 'Error', description: fromScratchState.message });
            }
        }
    }, [fromScratchState, toast, router]);
    
    React.useEffect(() => {
        if (fromEstState.message) {
            if (fromEstState.quotationId) {
                toast({ title: 'Success', description: fromEstState.message });
                router.push(`/sales/quotations/${fromEstState.quotationId}`);
            } else {
                toast({ variant: 'destructive', title: 'Error', description: fromEstState.message });
            }
        }
    }, [fromEstState, toast, router]);


    React.useEffect(() => {
        getNextQuotationId().then(setNextId);
    }, []);

    React.useEffect(() => {
        const newSubtotal = items.reduce((acc, item) => acc + (item.quantity * item.rate), 0);
        setSubtotal(newSubtotal);
    }, [items]);
    
    React.useEffect(() => {
        const taxAmount = (subtotal + marginAmount) * (taxPercentage / 100);
        setTotalCost(subtotal + marginAmount + taxAmount);
    }, [subtotal, marginAmount, taxPercentage]);

    const handleMarginPercentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const percent = parseFloat(e.target.value) || 0;
        setMarginPercent(percent);
        const newMarginAmount = subtotal * (percent / 100);
        setMarginAmount(parseFloat(newMarginAmount.toFixed(2)));
    };

    const handleMarginAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const amount = parseFloat(e.target.value) || 0;
        setMarginAmount(amount);
        if (subtotal > 0) {
            const newMarginPercent = (amount / subtotal) * 100;
            setMarginPercent(parseFloat(newMarginPercent.toFixed(2)));
        } else {
            setMarginPercent(0);
        }
    };
    
    const handleItemChange = (itemId: string, field: keyof QuotationItem, value: string | number) => {
        setItems(prevItems =>
            prevItems.map(item => {
                if (item.id === itemId) {
                    const updatedValue = typeof value === 'string' && (field === 'quantity' || field === 'rate') ? parseFloat(value) || 0 : value;
                    return { ...item, [field]: updatedValue };
                }
                return item;
            })
        );
    };

    const handleAddItem = () => {
        const newItem: QuotationItem = {
            id: `item-${Date.now()}`,
            title: '',
            description: '',
            quantity: 1,
            rate: 0,
        };
        setItems(prev => [...prev, newItem]);
    };
    
    const handleRemoveItem = (itemId: string) => {
        setItems(items.filter(item => item.id !== itemId));
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>New Quotation</CardTitle>
                <CardDescription>Create a new quotation from an existing estimation or start from scratch.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="from-estimation">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="from-estimation">From Estimation</TabsTrigger>
                        <TabsTrigger value="from-scratch">From Scratch</TabsTrigger>
                    </TabsList>
                    <TabsContent value="from-estimation">
                        <form action={fromEstDispatch}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Create from Estimation</CardTitle>
                                    <CardDescription>Select an approved estimation to automatically generate a quotation.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Label htmlFor="estimationId">Approved Estimations</Label>
                                    <Select name="estimationId">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select an estimation" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {approvedEstimations.map((est) => (
                                                <SelectItem key={est.id} value={est.id}>
                                                    {est.title} ({est.id})
                                                </SelectItem>
                                            ))}
                                            {approvedEstimations.length === 0 && (
                                                <div className="p-4 text-center text-sm text-muted-foreground">
                                                    No approved estimations available.
                                                </div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                     {fromEstState.errors?.estimationId && <p className="text-red-500 text-xs mt-1">{fromEstState.errors.estimationId[0]}</p>}
                                </CardContent>
                                <CardFooter className="justify-end gap-2">
                                     <Button variant="outline" asChild>
                                        <Link href="/sales/quotations">Cancel</Link>
                                    </Button>
                                    <Button type="submit">Create Quotation</Button>
                                </CardFooter>
                            </Card>
                        </form>
                    </TabsContent>
                    <TabsContent value="from-scratch">
                         <form ref={formRef} action={fromScratchDispatch}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Create from Scratch</CardTitle>
                                    <CardDescription>Build a quotation by adding custom line items.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <input type="hidden" name="id" value={nextId} />
                                    <input type="hidden" name="items" value={JSON.stringify(items)} />
                                    <input type="hidden" name="subtotal" value={subtotal} />
                                    <input type="hidden" name="marginPercentage" value={marginPercent} />
                                    <input type="hidden" name="marginAmount" value={marginAmount} />
                                    <input type="hidden" name="totalCost" value={totalCost} />
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="id-display">Quotation ID</Label>
                                            <Input id="id-display" value={nextId} readOnly className="font-mono bg-muted" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="projectName">Project Name</Label>
                                            <Input id="projectName" name="projectName" />
                                            {fromScratchState.errors?.projectName && <p className="text-red-500 text-xs">{fromScratchState.errors.projectName[0]}</p>}
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
                                        {fromScratchState.errors?.customer && <p className="text-red-500 text-xs">{fromScratchState.errors.customer[0]}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Quotation Items</Label>
                                        <div className="rounded-md border">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-2/5">Item</TableHead>
                                                        <TableHead className="w-[100px] text-right">Qty</TableHead>
                                                        <TableHead className="w-[120px] text-right">Rate</TableHead>
                                                        <TableHead className="w-[120px] text-right">Amount</TableHead>
                                                        <TableHead className="w-[50px]"></TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {items.length > 0 ? (
                                                        items.map(item => (
                                                            <TableRow key={item.id}>
                                                                <TableCell className="p-2 align-top">
                                                                    <Input 
                                                                        placeholder="Item Name"
                                                                        value={item.title}
                                                                        onChange={(e) => handleItemChange(item.id, 'title', e.target.value)}
                                                                        className="font-medium mb-1 h-8"
                                                                    />
                                                                    <Textarea 
                                                                        placeholder="Description"
                                                                        value={item.description}
                                                                        onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                                                                        className="text-xs"
                                                                        rows={1}
                                                                    />
                                                                </TableCell>
                                                                <TableCell className="p-2 align-top text-right">
                                                                    <Input
                                                                        type="number"
                                                                        value={item.quantity}
                                                                        onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                                                                        className="text-right h-8"
                                                                    />
                                                                </TableCell>
                                                                <TableCell className="p-2 align-top text-right">
                                                                    <Input
                                                                        type="number"
                                                                        step="0.01"
                                                                        value={item.rate}
                                                                        onChange={(e) => handleItemChange(item.id, 'rate', e.target.value)}
                                                                        className="text-right h-8"
                                                                    />
                                                                </TableCell>
                                                                <TableCell className="p-2 align-top text-right font-medium">
                                                                    {formatCurrency(item.quantity * item.rate)}
                                                                </TableCell>
                                                                <TableCell className="p-2 align-top text-right">
                                                                    <Button variant="ghost" size="icon" type="button" onClick={() => handleRemoveItem(item.id)}>
                                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                                    </Button>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                    ) : (
                                                        <TableRow>
                                                            <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                                                No items added yet.
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                        <div className="flex justify-start mt-2">
                                            <Button type="button" variant="outline" onClick={handleAddItem}><Plus className="h-4 w-4 mr-2"/>Add Item</Button>
                                        </div>
                                        {fromScratchState.errors?.items && <p className="text-red-500 text-xs">{fromScratchState.errors.items[0]}</p>}
                                    </div>
                                    
                                    <div className="flex justify-end">
                                        <div className="text-right space-y-2 p-4 rounded-md border w-80 bg-background">
                                            <div className="flex justify-between items-center"><Label>Subtotal</Label><span>{formatCurrency(subtotal)}</span></div>
                                            <div className="flex justify-between items-center">
                                                <Label htmlFor="marginPercent">Margin</Label>
                                                <div className="flex items-center gap-1">
                                                     <Input id="marginPercent" type="number" value={marginPercent} onChange={handleMarginPercentChange} className="w-20 h-8 text-right" />
                                                    <span>%</span>
                                                </div>
                                            </div>
                                             <div className="flex justify-between items-center">
                                                 <Label htmlFor="marginAmount" className="sr-only">Margin Amount</Label>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-sm mr-1">{currency?.symbol}</span>
                                                    <Input id="marginAmount" type="number" value={marginAmount} onChange={handleMarginAmountChange} className="w-24 h-8 text-right" />
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center"><Label>Tax ({taxPercentage}%)</Label><span>{formatCurrency((subtotal + marginAmount) * (taxPercentage / 100))}</span></div>
                                            <div className="flex justify-between items-center border-t pt-2 mt-2">
                                                <Label className="text-lg">Grand Total:</Label>
                                                <span className="font-bold text-xl">{formatCurrency(totalCost)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="justify-end gap-2">
                                    <Button variant="outline" asChild>
                                        <Link href="/sales/quotations">Cancel</Link>
                                    </Button>
                                    <Button type="submit">Create Quotation</Button>
                                </CardFooter>
                            </Card>
                        </form>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
