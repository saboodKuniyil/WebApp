
'use client'

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, FileText, Calendar, User, DollarSign, Briefcase } from "lucide-react"
import { useModules } from "@/context/modules-context"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger as AccordionTriggerPrimitive } from '@/components/ui/accordion'
import { EditEstimationDialog } from './edit-estimation-dialog';
import { DeleteEstimationDialog } from './delete-estimation-dialog';
import type { Estimation, EstimationTask, EstimationItem } from './estimations-list';
import type { Product } from '../purchase/products-list';
import { CreateTaskFromEstimationDialog } from './create-task-from-estimation-dialog';
import { getProjects, getTaskBlueprints } from '@/lib/db';
import type { Project } from '../project-management/projects-list';
import type { TaskBlueprint } from '../project-management/task-blueprints-list';
import { Skeleton } from '../ui/skeleton';
import { Dialog, DialogContent } from '@/components/ui/dialog';


const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionTriggerPrimitive>,
  React.ComponentPropsWithoutRef<typeof AccordionTriggerPrimitive>
>(({ className, children, ...props }, ref) => (
  <AccordionTriggerPrimitive
    ref={ref}
    className="py-2 hover:no-underline"
    {...props}
  >
    {children}
  </AccordionTriggerPrimitive>
));
AccordionTrigger.displayName = AccordionTriggerPrimitive.displayName

interface EstimationDetailViewProps {
    estimation: Estimation;
    products: Product[];
}

export function EstimationDetailView({ estimation, products }: EstimationDetailViewProps) {
    const { currency } = useModules();
    const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

    const [isCreateTaskDialogOpen, setIsCreateTaskDialogOpen] = React.useState(false);
    const [selectedEstimationTask, setSelectedEstimationTask] = React.useState<EstimationTask | null>(null);
    
    const [projects, setProjects] = React.useState<Project[]>([]);
    const [taskBlueprints, setTaskBlueprints] = React.useState<TaskBlueprint[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    const handleOpenCreateTaskDialog = (task: EstimationTask) => {
        setSelectedEstimationTask(task);
        setIsCreateTaskDialogOpen(true);
    };

    React.useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            const [fetchedProjects, fetchedTaskBlueprints] = await Promise.all([
                getProjects(),
                getTaskBlueprints()
            ]);
            setProjects(fetchedProjects);
            setTaskBlueprints(fetchedTaskBlueprints);
            setIsLoading(false);
        }
        fetchData();
    }, []);
    
    const formatCurrency = React.useCallback((amount: number) => {
        if (!currency) {
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
        }
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.code }).format(amount);
    }, [currency]);
    
    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return 'Not set';
        const date = new Date(dateString.includes('T') ? dateString : `${dateString}T00:00:00Z`);
        return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(date);
    };

    return (
        <>
        <div className="space-y-6">
            <Card>
                <CardHeader className="p-4 border-b">
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle className="text-3xl font-bold font-headline flex items-center gap-2">
                                <FileText className="h-8 w-8 text-primary" />
                                {estimation.title}
                            </CardTitle>
                            <CardDescription className="font-mono mt-1">{estimation.id}</CardDescription>
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
                <CardContent className="p-4 space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="font-semibold">Date Created</p>
                                <p>{formatDate(estimation.createdDate)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <User className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="font-semibold">Customer</p>
                                <p>{estimation.customerName}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 col-span-2 justify-end">
                            <div className="text-right">
                                <p className="font-semibold text-muted-foreground">Total Estimated Cost</p>
                                <p className="text-3xl font-bold text-primary">{formatCurrency(estimation.totalCost)}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="p-4">
                    <CardTitle>Estimation Breakdown</CardTitle>
                    <CardDescription>Detailed list of tasks and items for this estimation.</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                     <Accordion type="multiple" className="w-full space-y-2" defaultValue={estimation.tasks.map(t => t.id)}>
                        {estimation.tasks.map(task => (
                            <AccordionItem key={task.id} value={task.id} className="border bg-muted/50 rounded-md px-4">
                                <div className="flex items-center w-full py-2">
                                    <AccordionTrigger>
                                        <div className="text-left">
                                            <span className="font-semibold text-lg">{task.title}</span>
                                            <p className="text-xs text-muted-foreground font-mono">{task.id}</p>
                                        </div>
                                    </AccordionTrigger>
                                    <div className="flex-1" />
                                    <div className="flex items-center gap-4 pl-4">
                                        <span className="text-muted-foreground font-medium">{formatCurrency(task.totalCost)}</span>
                                         <Button size="sm" variant="outline" onClick={() => handleOpenCreateTaskDialog(task)}>
                                            <Briefcase className="mr-2 h-4 w-4" />
                                            Create Task
                                        </Button>
                                    </div>
                                </div>
                                <AccordionContent className="p-2 space-y-2">
                                     {task.description && <p className="text-sm text-muted-foreground border-b pb-2 mb-2 whitespace-pre-wrap">{task.description}</p>}
                                     <div className="grid grid-cols-[1fr_80px_80px_80px] items-center gap-x-4 px-2 text-xs text-muted-foreground font-medium">
                                        <span>Item</span>
                                        <span className="text-right">Qty</span>
                                        <span className="text-right">Rate</span>
                                        <span className="text-right">Total</span>
                                    </div>
                                     {task.items.map(item => (
                                        <div key={item.id} className="grid grid-cols-[1fr_80px_80px_80px] items-center gap-x-4 p-2 border rounded-md text-sm bg-background">
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
        {selectedEstimationTask && !isLoading ? (
            <CreateTaskFromEstimationDialog 
                isOpen={isCreateTaskDialogOpen}
                setIsOpen={setIsCreateTaskDialogOpen}
                estimationTask={selectedEstimationTask}
                customerName={estimation.customerName}
                projects={projects}
                taskBlueprints={taskBlueprints}
            />
        ) : (
             <Dialog open={isCreateTaskDialogOpen} onOpenChange={setIsCreateTaskDialogOpen}>
                <DialogContent>
                    <div className="flex items-center justify-center p-8">
                        <Skeleton className="h-20 w-full" />
                    </div>
                </DialogContent>
            </Dialog>
        )}
        </>
    )
}
