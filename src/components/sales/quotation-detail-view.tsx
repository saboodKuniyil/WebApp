
'use client'

import * as React from 'react';
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Product } from "@/components/purchase/products-list";
import type { Quotation } from "./quotations-list";
import { Button } from "../ui/button"
import { Pencil, Trash2 } from "lucide-react"
import { useModules } from '@/context/modules-context';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

interface QuotationDetailViewProps {
    quotation: Quotation;
    products: Product[];
}

const statusColors: Record<Quotation['status'], string> = {
    draft: 'bg-gray-500/20 text-gray-700 dark:text-gray-300',
    sent: 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
    approved: 'bg-green-500/20 text-green-700 dark:text-green-300',
    rejected: 'bg-red-500/20 text-red-700 dark:text-red-300',
};


export function QuotationDetailView({ quotation, products }: QuotationDetailViewProps) {
    const { currency, companyProfile } = useModules();

    const formatCurrency = React.useCallback((amount: number) => {
        if (!currency) {
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
        }
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.code }).format(amount);
    }, [currency]);
    
    return (
        <Card className="p-4 md:p-6">
            <CardHeader className="p-0">
                <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold font-headline">{quotation.title}</h1>
                        <p className="text-muted-foreground">Quotation #{quotation.id}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" disabled>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit Quotation</span>
                        </Button>
                        <Button variant="destructive" size="icon" disabled>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete Quotation</span>
                        </Button>
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
                                <TableHead className="w-2/5">Item</TableHead>
                                <TableHead className="w-1/5 text-right">Qty</TableHead>
                                <TableHead className="w-1/5 text-right">Rate</TableHead>
                                <TableHead className="w-1/5 text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {quotation.tasks.map(task => (
                                <React.Fragment key={task.id}>
                                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                                        <TableCell colSpan={4} className="font-bold text-base p-3">
                                            {task.title}
                                        </TableCell>
                                    </TableRow>
                                    {task.items.map(item => {
                                        const product = products.find(p => p.id === item.id);
                                        const description = item.type === 'product' ? product?.description : 'Ad-hoc item';
                                        return (
                                            <TableRow key={item.id}>
                                                <TableCell className="p-3">
                                                    <div className="font-medium">{item.name}</div>
                                                    <div className="text-xs text-muted-foreground truncate">{description}</div>
                                                </TableCell>
                                                <TableCell className="p-3 text-right">{item.quantity}</TableCell>
                                                <TableCell className="p-3 text-right">{formatCurrency(item.cost)}</TableCell>
                                                <TableCell className="p-3 text-right font-medium">{formatCurrency(item.cost * item.quantity)}</TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </React.Fragment>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <div className="flex justify-end mt-4">
                    <div className="w-full md:w-1/3 text-right space-y-2">
                         <div className="flex justify-between items-center border-t pt-2">
                            <span className="font-semibold text-lg">Grand Total</span>
                            <span className="font-bold text-xl">{formatCurrency(quotation.totalCost)}</span>
                        </div>
                    </div>
                </div>
                 <div className="border-t mt-6 pt-4 text-xs text-muted-foreground">
                    <h4 className="font-semibold text-sm mb-2 text-foreground">Terms & Conditions</h4>
                    <p>1. Payment to be made within 30 days of the invoice date.</p>
                    <p>2. Any additional work not mentioned in this quotation will be charged separately.</p>
                    <p>3. This quotation is valid for 15 days from the date of issue.</p>
                </div>
            </CardContent>
        </Card>
    )
}
