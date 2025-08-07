
'use client'

import * as React from 'react';
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { SalesOrder, CompanyProfile, AppSettings, Invoice } from "@/lib/db";
import { Button } from "../ui/button"
import { Printer, ShoppingBag, FileText, CheckCircle2, XCircle, Ban, Redo } from "lucide-react"
import { useModules } from '@/context/modules-context';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import Image from 'next/image';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { updateSalesOrderStatus, createInvoiceFromSalesOrder } from '@/app/sales/sales-orders/actions';
import { useRouter } from 'next/navigation';

interface SalesOrderDetailViewProps {
    salesOrder: SalesOrder;
}

const statusColors: Record<SalesOrder['status'], string> = {
    open: 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
    'in-progress': 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300',
    fulfilled: 'bg-green-500/20 text-green-700 dark:text-green-300',
    canceled: 'bg-red-500/20 text-red-700 dark:text-red-300',
    invoiced: 'bg-purple-500/20 text-purple-700 dark:text-purple-300',
};


export function SalesOrderDetailView({ salesOrder }: SalesOrderDetailViewProps) {
    const { currency, companyProfile, appSettings } = useModules();
    const [isChangingStatus, setIsChangingStatus] = React.useState(false);
    const [isCreatingInvoice, setIsCreatingInvoice] = React.useState(false);
    const { toast } = useToast();
    const router = useRouter();


    const subtotal = salesOrder.items.reduce((acc, item) => acc + item.quantity * item.rate, 0);
    const taxPercentage = appSettings?.quotationSettings?.taxPercentage ?? 0;
    const taxAmount = subtotal * (taxPercentage / 100);
    const totalCost = subtotal + taxAmount;
    
    const handleChangeStatus = async (newStatus: SalesOrder['status']) => {
        setIsChangingStatus(true);
        const result = await updateSalesOrderStatus(salesOrder.id, newStatus);
        if (result.message.includes('success')) {
            toast({ title: 'Success', description: result.message });
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.message });
        }
        setIsChangingStatus(false);
    };

    const handleCreateInvoice = async () => {
        setIsCreatingInvoice(true);
        const result = await createInvoiceFromSalesOrder(salesOrder.id);
        if (result.invoiceId) {
            toast({ title: 'Success', description: result.message });
            router.push(`/sales/invoices/${result.invoiceId}`);
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.message });
        }
        setIsCreatingInvoice(false);
    };

    return (
        <Card className="p-4 md:p-6">
            <CardHeader className="p-0">
                <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold font-headline">Sales Order</h1>
                        <p className="text-muted-foreground">#{salesOrder.id}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                         <Button type="button" variant="outline" disabled>
                            <Printer className="mr-2 h-4 w-4" />
                            Print
                        </Button>
                        <Badge variant="outline" className={`capitalize text-lg border-0 ${statusColors[salesOrder.status]}`}>{salesOrder.status}</Badge>
                    </div>
                </div>
                 <div className="border-t my-4" />
                 <div className="flex items-center gap-2 flex-wrap">
                    {salesOrder.status === 'open' && (
                        <Button size="sm" onClick={() => handleChangeStatus('in-progress')} disabled={isChangingStatus}><ShoppingBag className="mr-2 h-4 w-4" />Start Progress</Button>
                    )}
                    {salesOrder.status === 'in-progress' && (
                        <Button size="sm" onClick={() => handleChangeStatus('fulfilled')} disabled={isChangingStatus}><CheckCircle2 className="mr-2 h-4 w-4" />Mark as Fulfilled</Button>
                    )}
                     {salesOrder.status === 'fulfilled' && (
                        <Button size="sm" onClick={handleCreateInvoice} disabled={isCreatingInvoice}><FileText className="mr-2 h-4 w-4" />{isCreatingInvoice ? 'Creating...' : 'Create Invoice'}</Button>
                    )}
                    {(salesOrder.status === 'open' || salesOrder.status === 'in-progress') && (
                        <Button size="sm" variant="destructive" onClick={() => handleChangeStatus('canceled')} disabled={isChangingStatus}><XCircle className="mr-2 h-4 w-4" />Cancel Order</Button>
                    )}
                     {salesOrder.status === 'canceled' && (
                        <Button size="sm" variant="outline" onClick={() => handleChangeStatus('open')} disabled={isChangingStatus}><Redo className="mr-2 h-4 w-4" />Re-open</Button>
                    )}
                 </div>
                 <div className="grid md:grid-cols-3 gap-4 pt-6 text-sm">
                    <div>
                        <h3 className="font-semibold mb-1">Customer:</h3>
                        <p className="text-muted-foreground">{salesOrder.customer}</p>
                    </div>
                     <div>
                        <h3 className="font-semibold mb-1">Order Date:</h3>
                        <p className="text-muted-foreground">{salesOrder.orderDate}</p>
                    </div>
                     <div>
                        <h3 className="font-semibold mb-1">Related Quotation:</h3>
                        <Button asChild variant="link" className="p-0 h-auto">
                            <Link href={`/sales/quotations/${salesOrder.quotationId}`} className="text-primary">
                                {salesOrder.quotationId}
                            </Link>
                        </Button>
                    </div>
                 </div>

            </CardHeader>
            <CardContent className="p-0 mt-6">
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-3/5 p-3">Item</TableHead>
                                <TableHead className="w-1/5 text-right p-3">Qty</TableHead>
                                <TableHead className="w-1/5 text-right p-3">Rate</TableHead>
                                <TableHead className="w-1/5 text-right p-3">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {salesOrder.items.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell className="p-2 align-top">
                                        <div className="flex items-start gap-4">
                                            {item.imageUrl && (
                                                <Image src={item.imageUrl} alt={item.title} width={64} height={64} className="rounded-md object-cover w-16 h-16" data-ai-hint="product item" />
                                            )}
                                            <div className="flex-1">
                                                <p className="font-medium">{item.title}</p>
                                                <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">{item.description}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="p-2 align-top text-right">{item.quantity}</TableCell>
                                    <TableCell className="p-2 align-top text-right">
                                        <span>{currency?.symbol} {(item.rate).toFixed(2)}</span>
                                    </TableCell>
                                    <TableCell className="p-2 align-top text-right font-medium">
                                        {currency?.symbol} { (item.quantity * item.rate).toFixed(2) }
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <div className="flex justify-end mt-4">
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
            </CardContent>
        </Card>
    )
}
