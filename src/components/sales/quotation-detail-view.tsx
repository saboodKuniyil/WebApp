

'use client'

import * as React from 'react';
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Quotation, QuotationItem } from "./quotations-list";
import { Button } from "../ui/button"
import { Pencil, Save, Trash2, Plus, Printer, X } from "lucide-react"
import { useModules } from '@/context/modules-context';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { useActionState } from 'react';
import { updateQuotationAction } from '@/app/sales/quotations/actions';
import { useToast } from '@/hooks/use-toast';
import { QuotationPrintLayout } from './quotation-print-layout';
import ReactDOMServer from 'react-dom/server';


interface QuotationDetailViewProps {
    quotation: Quotation;
}

const statusColors: Record<Quotation['status'], string> = {
    draft: 'bg-gray-500/20 text-gray-700 dark:text-gray-300',
    sent: 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
    approved: 'bg-green-500/20 text-green-700 dark:text-green-300',
    rejected: 'bg-red-500/20 text-red-700 dark:text-red-300',
};

const initialState = { message: '', errors: {} };

// This function adapts the old data structure (with tasks) to the new one (with items)
const adaptQuotationData = (quotation: Quotation): QuotationItem[] => {
    if (quotation.items) {
        return quotation.items;
    }
    // @ts-ignore - Handle old data structure for backward compatibility
    if (quotation.tasks) {
         // @ts-ignore
        return quotation.tasks.map(task => ({
            id: task.id,
            title: task.title,
            description: task.description || '',
            quantity: 1,
            rate: task.totalCost,
        }));
    }
    return [];
}

export function QuotationDetailView({ quotation }: QuotationDetailViewProps) {
    const [state, dispatch] = useActionState(updateQuotationAction, initialState);
    const { currency, companyProfile, appSettings } = useModules();
    const [isEditing, setIsEditing] = React.useState(false);
    const [originalItems, setOriginalItems] = React.useState<QuotationItem[]>([]);
    const [items, setItems] = React.useState<QuotationItem[]>(adaptQuotationData(quotation));
    
    const { toast } = useToast();
    const formRef = React.useRef<HTMLFormElement>(null);

    const subtotal = items.reduce((acc, item) => acc + item.quantity * item.rate, 0);
    const taxPercentage = appSettings?.quotationSettings?.taxPercentage ?? 0;
    const taxAmount = subtotal * (taxPercentage / 100);
    const totalCost = subtotal + taxAmount;


    React.useEffect(() => {
        if (state.message) {
            if (state.errors) {
                toast({ variant: 'destructive', title: 'Error', description: state.message });
            } else {
                toast({ title: 'Success', description: state.message });
                setIsEditing(false);
            }
        }
    }, [state, toast]);

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

    const handleAddNewItem = () => {
        const newItem: QuotationItem = {
            id: `manual-${Date.now()}`,
            title: 'New Item',
            description: '',
            quantity: 1,
            rate: 0,
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
                    quotation={{ ...quotation, items, totalCost: subtotal }} // Pass subtotal as it was before tax
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

    return (
        <form ref={formRef} action={dispatch}>
            <input type="hidden" name="id" value={quotation.id} />
            <input type="hidden" name="items" value={JSON.stringify(items)} />
            <Card className="p-4 md:p-6">
                <CardHeader className="p-0">
                    <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold font-headline">{quotation.title}</h1>
                            <p className="text-muted-foreground">Quotation #{quotation.id}</p>
                        </div>
                        <div className="flex items-center gap-2">
                             <Button type="button" variant="outline" onClick={handlePrint}>
                                <Printer className="mr-2 h-4 w-4" />
                                Print View
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
                                    {isEditing && <TableHead className="w-[50px] p-3"></TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell className="p-2 align-top">
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
