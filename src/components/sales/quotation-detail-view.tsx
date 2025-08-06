

'use client'

import * as React from 'react';
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Quotation, QuotationItem } from "@/lib/db";
import { Button } from "../ui/button"
import { Pencil, Save, Trash2, Plus, Printer, X, ShoppingBag, Send, CheckCircle2, XCircle, FileSignature, Redo } from "lucide-react"
import { useModules } from '@/context/modules-context';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { useActionState } from 'react';
import { updateQuotationAction, updateQuotationStatus } from '@/app/sales/quotations/actions';
import { useToast } from '@/hooks/use-toast';
import { QuotationPrintLayout } from './quotation-print-layout';
import ReactDOMServer from 'react-dom/server';
import Image from 'next/image';
import { createSalesOrderFromQuotation } from '@/app/sales/sales-orders/actions';
import { useRouter } from 'next/navigation';

interface QuotationDetailViewProps {
    quotation: Quotation;
}

const statusColors: Record<Quotation['status'], string> = {
    draft: 'bg-gray-500/20 text-gray-700 dark:text-gray-300',
    sent: 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
    approved: 'bg-green-500/20 text-green-700 dark:text-green-300',
    rejected: 'bg-red-500/20 text-red-700 dark:text-red-300',
    converted: 'bg-purple-500/20 text-purple-700 dark:text-purple-300',
};

const initialState = { message: '', errors: {} };

export function QuotationDetailView({ quotation }: QuotationDetailViewProps) {
    const [updateState, updateDispatch] = useActionState(updateQuotationAction, initialState);
    const { currency, companyProfile, appSettings } = useModules();
    const [isEditing, setIsEditing] = React.useState(false);
    const [originalItems, setOriginalItems] = React.useState<QuotationItem[]>([]);
    const [items, setItems] = React.useState<QuotationItem[]>(quotation.items.map(item => ({...item, marginPercentage: item.marginPercentage || 0, marginAmount: item.marginAmount || 0})));
    const [isCreatingSO, setIsCreatingSO] = React.useState(false);
    const [isChangingStatus, setIsChangingStatus] = React.useState(false);
    
    const { toast } = useToast();
    const router = useRouter();
    const formRef = React.useRef<HTMLFormElement>(null);

    const subtotal = items.reduce((acc, item) => acc + item.quantity * item.rate, 0);
    const totalMargin = items.reduce((acc, item) => acc + (item.marginAmount || 0), 0);
    const taxPercentage = appSettings?.quotationSettings?.taxPercentage ?? 0;
    const preTaxTotal = subtotal + totalMargin;
    const taxAmount = preTaxTotal * (taxPercentage / 100);
    const totalCost = preTaxTotal + taxAmount;


    React.useEffect(() => {
        if (updateState.message) {
            if (updateState.errors) {
                toast({ variant: 'destructive', title: 'Error', description: updateState.message });
            } else {
                toast({ title: 'Success', description: updateState.message });
                setIsEditing(false);
            }
        }
    }, [updateState, toast]);

    const handleItemChange = (itemId: string, field: keyof QuotationItem, value: string | number) => {
        setItems(prevItems =>
            prevItems.map(item => {
                if (item.id === itemId) {
                    const newItem = { ...item, [field]: typeof value === 'string' && (field !== 'title' && field !== 'description') ? parseFloat(value) || 0 : value };
                    const itemSubtotal = newItem.quantity * newItem.rate;

                    if(field === 'marginPercentage') {
                        const newMarginAmount = itemSubtotal * ((newItem.marginPercentage || 0) / 100);
                        newItem.marginAmount = parseFloat(newMarginAmount.toFixed(2));
                    } else if (field === 'marginAmount') {
                         if (itemSubtotal > 0) {
                            const newMarginPercent = ((newItem.marginAmount || 0) / itemSubtotal) * 100;
                            newItem.marginPercentage = parseFloat(newMarginPercent.toFixed(2));
                        } else {
                            newItem.marginPercentage = 0;
                        }
                    }
                    return newItem;
                }
                return item;
            })
        );
    };

    const handleAddNewItem = () => {
        const newItem: QuotationItem = {
            id: `manual-${Date.now()}`,
            title: 'New Item',
            description: '',
            quantity: 1,
            rate: 0,
            marginPercentage: 0,
            marginAmount: 0,
        };
        setItems(prevItems => [...prevItems, newItem]);
    };

    const handleRemoveItem = (itemId: string) => {
        setItems(prevItems => prevItems.filter(item => item.id !== itemId));
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank', 'height=800,width=800');
        if (printWindow) {
            const printContent = ReactDOMServer.renderToString(
                <QuotationPrintLayout
                    quotation={{ ...quotation, items, totalCost: preTaxTotal, subtotal: subtotal }}
                    companyProfile={companyProfile}
                    currency={currency}
                    appSettings={appSettings}
                />
            );
            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.focus();
        }
    };

    const handleEditClick = () => {
        setOriginalItems(JSON.parse(JSON.stringify(items))); // Deep copy
        setIsEditing(true);
    };

    const handleCancelClick = () => {
        setItems(originalItems);
        setIsEditing(false);
    };
    
    const handleChangeStatus = async (newStatus: Quotation['status']) => {
        setIsChangingStatus(true);
        const result = await updateQuotationStatus(quotation.id, newStatus);
        if (result.success) {
            toast({ title: 'Success', description: result.message });
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.message });
        }
        setIsChangingStatus(false);
    };

    const handleCreateSalesOrder = async () => {
        setIsCreatingSO(true);
        const result = await createSalesOrderFromQuotation(quotation.id);
        if (result.salesOrderId) {
            toast({
                title: 'Success',
                description: 'Sales Order created successfully.',
            });
            router.push(`/sales/sales-orders`);
        } else {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: result.message || 'Failed to create Sales Order.',
            });
        }
        setIsCreatingSO(false);
    };

    return (
        <form ref={formRef} action={updateDispatch}>
            <input type="hidden" name="id" value={quotation.id} />
            <input type="hidden" name="items" value={JSON.stringify(items)} />
            <input type="hidden" name="subtotal" value={subtotal} />
            <input type="hidden" name="marginAmount" value={totalMargin} />
            <input type="hidden" name="totalCost" value={totalCost} />
            
            <Card className="p-4 md:p-6">
                <CardHeader className="p-0">
                    <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                        <div>
                             {isEditing ? (
                                <div className="space-y-1">
                                    <Input 
                                        name="title" 
                                        defaultValue={quotation.title} 
                                        className="text-3xl font-bold font-headline h-auto p-0 border-0 shadow-none focus-visible:ring-0" 
                                    />
                                     {updateState.errors?.title && <p className="text-red-500 text-xs">{updateState.errors.title[0]}</p>}
                                </div>
                            ) : (
                                <h1 className="text-3xl font-bold font-headline">{quotation.title}</h1>
                            )}
                            <p className="text-muted-foreground">Quotation #{quotation.id}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap justify-end">
                             <Button type="button" variant="outline" onClick={handlePrint}>
                                <Printer className="mr-2 h-4 w-4" />
                                Print
                            </Button>
                            {isEditing ? (
                                <>
                                <Button type="submit">
                                    <Save className="mr-2 h-4 w-4" />
                                    Save
                                </Button>
                                <Button type="button" variant="ghost" onClick={handleCancelClick}>
                                    <X className="mr-2 h-4 w-4" />
                                    Cancel
                                </Button>
                                </>
                            ) : (
                                <Button type="button" variant="outline" onClick={handleEditClick}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                </Button>
                            )}
                            <Badge variant="outline" className={`capitalize text-lg border-0 ${statusColors[quotation.status]}`}>{quotation.status}</Badge>
                        </div>
                    </div>
                     <div className="border-t my-4" />
                    <div className="flex items-center gap-2 flex-wrap">
                        {quotation.status === 'draft' && (
                            <>
                                <Button type="button" size="sm" onClick={() => handleChangeStatus('sent')} disabled={isChangingStatus}><Send className="mr-2 h-4 w-4" />Mark as Sent</Button>
                                <Button type="button" size="sm" variant="secondary" onClick={() => handleChangeStatus('approved')} disabled={isChangingStatus}><CheckCircle2 className="mr-2 h-4 w-4" />Approve</Button>
                            </>
                        )}
                        {quotation.status === 'sent' && (
                             <>
                                <Button type="button" size="sm" onClick={() => handleChangeStatus('approved')} disabled={isChangingStatus}><CheckCircle2 className="mr-2 h-4 w-4" />Approve</Button>
                                <Button type="button" size="sm" variant="destructive" onClick={() => handleChangeStatus('rejected')} disabled={isChangingStatus}><XCircle className="mr-2 h-4 w-4" />Reject</Button>
                            </>
                        )}
                         {(quotation.status === 'approved' || quotation.status === 'rejected') && (
                                <Button type="button" size="sm" variant="outline" onClick={() => handleChangeStatus('draft')} disabled={isChangingStatus}><Redo className="mr-2 h-4 w-4" />Re-draft</Button>
                         )}
                         {quotation.status === 'approved' && (
                                <Button type="button" size="sm" onClick={handleCreateSalesOrder} disabled={isCreatingSO}>
                                    <ShoppingBag className="mr-2 h-4 w-4" />
                                    {isCreatingSO ? 'Creating...' : 'Create Sales Order'}
                                </Button>
                            )}
                        {quotation.status === 'converted' && (
                            <Button type="button" size="sm" variant="outline" onClick={() => handleChangeStatus('approved')} disabled={isChangingStatus}><Redo className="mr-2 h-4 w-4" />Revert to Approved</Button>
                        )}
                    </div>

                     <div className="grid md:grid-cols-2 gap-4 pt-6 text-sm">
                        <div>
                            <h3 className="font-semibold mb-2">Billed To:</h3>
                            <div className="text-muted-foreground">
                                <p className="font-bold text-foreground">{quotation.customer}</p>
                                <p>123 Customer Lane</p>
                                <p>City, State, 12345</p>
                            </div>
                        </div>
                        <div className="text-left md:text-right">
                             <h3 className="font-semibold mb-2">From:</h3>
                            <div className="text-muted-foreground">
                                <p className="font-bold text-foreground">{companyProfile?.companyName}</p>
                                <p>{companyProfile?.address}</p>
                                 <p>TRN: {companyProfile?.trnNumber}</p>
                            </div>
                        </div>
                    </div>

                </CardHeader>
                <CardContent className="p-0 mt-6">
                    <div className="rounded-lg border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-2/5 p-3">Item</TableHead>
                                    <TableHead className="w-[100px] text-right p-3">Qty</TableHead>
                                    <TableHead className="w-[120px] text-right p-3">Rate</TableHead>
                                    <TableHead className="w-[120px] text-right p-3">Amount</TableHead>
                                    {isEditing && <TableHead className="w-[200px] text-right p-3">Margin</TableHead>}
                                    {isEditing && <TableHead className="w-[50px] p-3"></TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell className="p-2 align-top">
                                            <div className="flex items-start gap-4">
                                                {item.imageUrl && (
                                                    <Image src={item.imageUrl} alt={item.title} width={64} height={64} className="rounded-md object-cover w-16 h-16" data-ai-hint="product item" />
                                                )}
                                                <div className="flex-1">
                                                    {isEditing ? (
                                                        <>
                                                        <Input 
                                                            value={item.title}
                                                            onChange={(e) => handleItemChange(item.id, 'title', e.target.value)}
                                                            className="font-medium"
                                                        />
                                                        <Textarea 
                                                            value={item.description}
                                                            onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                                                            className="text-xs text-muted-foreground mt-1"
                                                            rows={2}
                                                        />
                                                        </>
                                                    ) : (
                                                        <>
                                                        <p className="font-medium">{item.title}</p>
                                                        <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">{item.description}</p>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="p-2 align-top text-right">
                                            {isEditing ? (
                                                <Input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                                                    className="text-right h-8"
                                                />
                                            ) : (
                                                item.quantity
                                            )}
                                        </TableCell>
                                        <TableCell className="p-2 align-top text-right">
                                            {isEditing ? (
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    value={item.rate}
                                                    onChange={(e) => handleItemChange(item.id, 'rate', e.target.value)}
                                                    className="text-right h-8"
                                                />
                                            ) : (
                                                <span>{currency?.symbol} {(item.rate).toFixed(2)}</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="p-2 align-top text-right font-medium">
                                            {currency?.symbol} { (item.quantity * item.rate).toFixed(2) }
                                        </TableCell>
                                        {isEditing && (
                                            <TableCell className="p-2 align-top text-right space-y-1">
                                                <div className="flex items-center gap-1 justify-end">
                                                    <Input type="number" value={item.marginPercentage} onChange={(e) => handleItemChange(item.id, 'marginPercentage', e.target.value)} className="w-20 h-7 text-right" placeholder="%" />
                                                    <span>%</span>
                                                </div>
                                                 <div className="flex items-center gap-1 justify-end">
                                                    <span className="text-xs mr-1">{currency?.symbol}</span>
                                                    <Input type="number" value={item.marginAmount} onChange={(e) => handleItemChange(item.id, 'marginAmount', e.target.value)} className="w-24 h-7 text-right" placeholder="Amt" />
                                                </div>
                                            </TableCell>
                                        )}
                                        {isEditing && (
                                            <TableCell className="p-2 align-top text-right">
                                                <Button variant="ghost" size="icon" type="button" onClick={() => handleRemoveItem(item.id)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="flex justify-between mt-4">
                         {isEditing ? (
                            <Button type="button" variant="outline" onClick={handleAddNewItem}>
                                <Plus className="h-4 w-4 mr-2"/>
                                Add Item
                            </Button>
                        ) : <div></div>}
                        <div className="w-full md:w-1/3 text-right space-y-2">
                             <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>{currency?.symbol} {subtotal.toFixed(2)}</span>
                            </div>
                             <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Margin</span>
                                <span>{currency?.symbol} {totalMargin.toFixed(2)}</span>
                            </div>
                             <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Tax ({taxPercentage}%)</span>
                                <span>{currency?.symbol} {taxAmount.toFixed(2)}</span>
                            </div>
                             <div className="flex justify-between items-center border-t pt-2">
                                <span className="font-semibold text-lg">Grand Total</span>
                                <span className="font-bold text-xl">{currency?.symbol} {totalCost.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                     <div className="border-t mt-6 pt-4 text-xs text-muted-foreground">
                        <h4 className="font-semibold text-sm mb-2 text-foreground">Terms & Conditions</h4>
                        <p className="whitespace-pre-line">{appSettings?.quotationSettings?.termsAndConditions}</p>
                    </div>
                </CardContent>
            </Card>
        </form>
    )
}
