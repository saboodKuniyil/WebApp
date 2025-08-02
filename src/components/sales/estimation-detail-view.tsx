
'use client'

import * as React from 'react';
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Product } from "@/components/purchase/products-list";
import type { Estimation } from "./estimations-list";
import { Button } from "../ui/button"
import { Pencil, Trash2, FileText, GripVertical } from "lucide-react"
import { useModules } from '@/context/modules-context';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { EditEstimationDialog } from './edit-estimation-dialog';
import { DeleteEstimationDialog } from './delete-estimation-dialog';

interface EstimationDetailViewProps {
    estimation: Estimation;
    products: Product[];
}

export function EstimationDetailView({ estimation, products }: EstimationDetailViewProps) {
    const { currency } = useModules();
    const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

    const formatCurrency = React.useCallback((amount: number) => {
        if (!currency) {
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
        }
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.code }).format(amount);
    }, [currency]);
    
    return (
        <div className="space-y-6">
             <Card>
                <CardHeader className="p-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle className="text-3xl font-bold font-headline">{estimation.title}</CardTitle>
                            <CardDescription>{estimation.id}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                             <Button variant="outline" size="icon" onClick={() => setIsEditDialogOpen(true)}>
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit Estimation</span>
                            </Button>
                            <Button variant="destructive" size="icon" onClick={() => setIsDeleteDialogOpen(true)}>
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete Estimation</span>
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 p-4 pt-0">
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <p className="font-semibold">Date Created</p>
                            <p>{estimation.createdDate}</p>
                        </div>
                    </div>
                     <div className="flex justify-end">
                        <div className="text-right space-y-1 p-4 rounded-md border w-80 bg-background">
                            <div className="flex justify-between items-baseline">
                                <span className="text-lg text-muted-foreground">Grand Total:</span>
                                <span className="font-bold text-3xl">{formatCurrency(estimation.totalCost)}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="p-4 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center"><FileText className="mr-2 h-5 w-5" />Estimation Breakdown</CardTitle>
                        <CardDescription>A list of tasks and items for this estimation.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                   <Accordion type="multiple" className="w-full space-y-2" defaultValue={estimation.tasks.map(t => t.id)}>
                        {estimation.tasks.map(task => (
                            <AccordionItem key={task.id} value={task.id} className="border bg-background rounded-md px-4">
                                <div className="flex items-center w-full py-2">
                                <AccordionTrigger>
                                    <div className="flex items-center gap-2">
                                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <span className="font-semibold text-lg">{task.title}</span>
                                            <p className="text-xs text-muted-foreground font-mono">{task.id}</p>
                                        </div>
                                    </div>
                                    </AccordionTrigger>
                                    <div className="flex-1" />
                                    <div className="flex items-center gap-4 pl-4">
                                        <span className="text-muted-foreground font-medium">{formatCurrency(task.totalCost)}</span>
                                    </div>
                                </div>
                                <AccordionContent className="p-2 space-y-2">
                                    {task.description && <p className="text-sm text-muted-foreground border-b pb-2 mb-2 whitespace-pre-wrap">{task.description}</p>}
                                    <div className="grid grid-cols-[1fr_80px_80px_80px] items-center gap-x-4 px-2 text-xs text-muted-foreground font-medium">
                                        <span>Material / Service</span>
                                        <span className="text-right">Qty</span>
                                        <span className="text-right">Rate</span>
                                        <span className="text-right">Total</span>
                                    </div>
                                    {task.items.map(item => (
                                        <div key={item.id} className="grid grid-cols-[1fr_80px_80px_80px] items-center gap-x-4 p-2 border rounded-md text-sm">
                                            <span className="truncate" title={item.name}>{item.name}</span>
                                            <span className="text-right">{item.quantity}</span>
                                            <span className="text-right">{formatCurrency(item.cost)}</span>
                                            <span className="text-right font-semibold">{formatCurrency(item.cost * item.quantity)}</span>
                                        </div>
                                    ))}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>
            <EditEstimationDialog 
                isOpen={isEditDialogOpen}
                setIsOpen={setIsEditDialogOpen}
                estimation={estimation}
                products={products}
            />
            <DeleteEstimationDialog
                isOpen={isDeleteDialogOpen}
                setIsOpen={setIsDeleteDialogOpen}
                estimation={estimation}
            />
        </div>
    )
}
