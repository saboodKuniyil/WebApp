
'use client'

import * as React from 'react';
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Invoice } from "@/lib/db";
import { Button } from "../ui/button"
import { Printer, CreditCard, Send, XCircle, Redo } from "lucide-react"
import { useModules } from '@/context/modules-context';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import Image from 'next/image';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { updateInvoiceStatus } from '@/app/sales/invoices/actions';

interface InvoiceDetailViewProps {
    invoice: Invoice;
}

const statusColors: Record<Invoice['status'], string> = {
    draft: 'bg-gray-500/20 text-gray-700 dark:text-gray-300',
    sent: 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
    paid: 'bg-green-500/20 text-green-700 dark:text-green-300',
    void: 'bg-red-500/20 text-red-700 dark:text-red-300',
};

export function InvoiceDetailView({ invoice }: InvoiceDetailViewProps) {
    const { currency, companyProfile, appSettings } = useModules();
    const [isChangingStatus, setIsChangingStatus] = React.useState(false);
    const { toast } = useToast();

    const subtotal = invoice.items.reduce((acc, item) => acc + item.quantity * item.rate, 0);
    const taxPercentage = appSettings?.quotationSettings?.taxPercentage ?? 0;
    const taxAmount = subtotal * (taxPercentage / 100);
    const totalCost = subtotal + taxAmount;

    const handleChangeStatus = async (newStatus: Invoice['status']) => {
        setIsChangingStatus(true);
        const result = await updateInvoiceStatus(invoice.id, newStatus);
        if (result.message.includes('success')) {
            toast({ title: 'Success', description: result.message });
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.message });
        }
        setIsChangingStatus(false);
    };

    return (
        <Card className="p-4 md:p-6">
            <CardHeader className="p-0">
                <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold font-headline">Invoice</h1>
                        <p className="text-muted-foreground">#{invoice.id}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                         <Button type="button" variant="outline" disabled>
                            <Printer className="mr-2 h-4 w-4" />
                            Print/PDF
                        </Button>
                        <Badge variant="outline" className={`capitalize text-lg border-0 ${statusColors[invoice.status]}`}>{invoice.status}</Badge>
                    </div>
                </div>
                 <div className="border-t my-4" />
                  <div className="flex items-center gap-2 flex-wrap">
                    {invoice.status === 'draft' && (
                         <Button size="sm" onClick={() => handleChangeStatus('sent')} disabled={isChangingStatus}><Send className="mr-2 h-4 w-4" />Mark as Sent</Button>
                    )}
                    {invoice.status === 'sent' && (
                        <Button size="sm" onClick={() => handleChangeStatus('paid')} disabled={isChangingStatus}><CreditCard className="mr-2 h-4 w-4" />Mark as Paid</Button>
                    )}
                     {(invoice.status === 'draft' || invoice.status === 'sent') && (
                        <Button size="sm" variant="destructive" onClick={() => handleChangeStatus('void')} disabled={isChangingStatus}><XCircle className="mr-2 h-4 w-4" />Void Invoice</Button>
                    )}
                    {invoice.status === 'void' && (
                         <Button size="sm" variant="outline" onClick={() => handleChangeStatus('draft')} disabled={isChangingStatus}><Redo className="mr-2 h-4 w-4" />Re-open as Draft</Button>
                    )}
                 </div>
                 <div className="grid md:grid-cols-3 gap-4 pt-6 text-sm">
                    <div>
                        <h3 className="font-semibold mb-1">Billed To:</h3>
                        <p className="text-muted-foreground">{invoice.customer}</p>
                    </div>
                     <div>
                        <h3 className="font-semibold mb-1">Invoice Date:</h3>
                        <p className="text-muted-foreground">{invoice.invoiceDate}</p>
                    </div>
                     <div>
                        <h3 className="font-semibold mb-1">Due Date:</h3>
                        <p className="text-muted-foreground">{invoice.dueDate}</p>
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
                            {invoice.items.map(item => (
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
                            <span className="font-semibold text-lg">Amount Due</span>
                            <span className="font-bold text-xl">{currency?.symbol} {totalCost.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
                 <div className="border-t mt-6 pt-4 text-xs text-muted-foreground">
                    <h4 className="font-semibold text-sm mb-2 text-foreground">Bank Details</h4>
                    <div className="grid grid-cols-2 gap-x-4">
                        <p><strong>Bank:</strong> {appSettings?.quotationSettings?.bankName}</p>
                        <p><strong>Account Number:</strong> {appSettings?.quotationSettings?.accountNumber}</p>
                        <p><strong>IBAN:</strong> {appSettings?.quotationSettings?.iban}</p>
                    </div>
                </div>
                 <div className="border-t mt-4 pt-4 text-xs text-muted-foreground">
                    <h4 className="font-semibold text-sm mb-2 text-foreground">Terms & Conditions</h4>
                    <p className="whitespace-pre-line">{appSettings?.quotationSettings?.termsAndConditions}</p>
                </div>
            </CardContent>
        </Card>
    )
}
