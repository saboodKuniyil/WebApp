

'use client'

import * as React from 'react';
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Product } from "@/components/purchase/products-list";
import type { Estimation, EstimationTask } from "./estimations-list";
import { Button } from "../ui/button"
import { Pencil, Trash2, FileText, GripVertical, FileSignature, Briefcase, User, Send, CheckCircle2, XCircle, Redo } from "lucide-react"
import { useModules } from '@/context/modules-context';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { EditEstimationDialog } from './edit-estimation-dialog';
import { DeleteEstimationDialog } from './delete-estimation-dialog';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { AddTaskDialog } from '../project-management/add-task-dialog';
import { getProjects, getTaskBlueprints } from '@/lib/db';
import type { Project } from '../project-management/projects-list';
import type { TaskBlueprint } from '../project-management/task-blueprints-list';
import type { Customer } from '@/lib/db';
import Image from 'next/image';
import { updateEstimationStatus } from '@/app/sales/estimations/actions';


interface EstimationDetailViewProps {
    estimation: Estimation;
    products: Product[];
    customers: Customer[];
}

const statusColors: Record<Estimation['status'], string> = {
    draft: 'bg-gray-500/20 text-gray-700 dark:text-gray-300',
    sent: 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
    approved: 'bg-green-500/20 text-green-700 dark:text-green-300',
    rejected: 'bg-red-500/20 text-red-700 dark:text-red-300',
};

export function EstimationDetailView({ estimation, products, customers }: EstimationDetailViewProps) {
    const { currency } = useModules();
    const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
    const [isChangingStatus, setIsChangingStatus] = React.useState(false);
    const { toast } = useToast();
    
    // State for AddTaskDialog
    const [projects, setProjects] = React.useState<Project[]>([]);
    const [taskBlueprints, setTaskBlueprints] = React.useState<TaskBlueprint[]>([]);
    const [isLoadingProjects, setIsLoadingProjects] = React.useState(true);


    React.useEffect(() => {
        async function loadProjectsAndBlueprints() {
            const [loadedProjects, loadedBlueprints] = await Promise.all([
                getProjects(),
                getTaskBlueprints()
            ]);
            setProjects(loadedProjects);
            setTaskBlueprints(loadedBlueprints);
            setIsLoadingProjects(false);
        }
        loadProjectsAndBlueprints();
    }, []);
    
    const handleChangeStatus = async (newStatus: Estimation['status']) => {
        setIsChangingStatus(true);
        const result = await updateEstimationStatus(estimation.id, newStatus);
        if (result.success) {
            toast({ title: 'Success', description: result.message });
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.message });
        }
        setIsChangingStatus(false);
    };

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
                             <Badge variant="outline" className={`capitalize text-lg border-0 ${statusColors[estimation.status]}`}>{estimation.status}</Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 p-4 pt-0">
                     <div className="border-t my-4" />
                      <div className="flex items-center gap-2 flex-wrap">
                        {estimation.status === 'draft' && (
                             <Button type="button" size="sm" onClick={() => handleChangeStatus('sent')} disabled={isChangingStatus}><Send className="mr-2 h-4 w-4" />Mark as Sent</Button>
                        )}
                        {(estimation.status === 'draft' || estimation.status === 'sent') && (
                             <Button type="button" size="sm" variant="secondary" onClick={() => handleChangeStatus('approved')} disabled={isChangingStatus}><CheckCircle2 className="mr-2 h-4 w-4" />Approve</Button>
                        )}
                         {estimation.status === 'sent' && (
                             <Button type="button" size="sm" variant="destructive" onClick={() => handleChangeStatus('rejected')} disabled={isChangingStatus}><XCircle className="mr-2 h-4 w-4" />Reject</Button>
                         )}
                         {(estimation.status === 'approved' || estimation.status === 'rejected') && (
                            <Button type="button" size="sm" variant="outline" onClick={() => handleChangeStatus('draft')} disabled={isChangingStatus}><Redo className="mr-2 h-4 w-4" />Re-draft</Button>
                         )}
                    </div>
                    <div className="border-t my-4" />

                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <p className="font-semibold">Date Created</p>
                            <p>{estimation.createdDate}</p>
                        </div>
                        {estimation.customerName && (
                            <div>
                                <p className="font-semibold flex items-center gap-1"><User className="h-4 w-4" /> Customer</p>
                                <p>{estimation.customerName}</p>
                            </div>
                        )}
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
                                        <AddTaskDialog 
                                            projects={projects} 
                                            taskBlueprints={taskBlueprints}
                                            defaultTitle={task.title}
                                            defaultDescription={task.description}
                                            defaultBudget={task.totalCost}
                                            trigger={
                                                <Button variant="outline" size="sm">
                                                    <Briefcase className="mr-2 h-3 w-3" />
                                                    Create Task
                                                </Button>
                                            } 
                                        />
                                        <span className="text-muted-foreground font-medium">{formatCurrency(task.totalCost)}</span>
                                    </div>
                                </div>
                                <AccordionContent className="p-2 space-y-2">
                                    {task.description && <p className="text-sm text-muted-foreground border-b pb-2 mb-2 whitespace-pre-wrap">{task.description}</p>}
                                    <div className="grid grid-cols-[80px_1fr_80px_80px_80px] items-center gap-x-4 px-2 text-xs text-muted-foreground font-medium">
                                        <span>Image</span>
                                        <span>Material / Service</span>
                                        <span className="text-right">Qty</span>
                                        <span className="text-right">Rate</span>
                                        <span className="text-right">Total</span>
                                    </div>
                                    {task.items.map(item => (
                                         <div key={item.id} className="p-2 border-b">
                                            <div className="grid grid-cols-[80px_1fr_80px_80px_80px] items-center gap-x-4 text-sm">
                                                 {item.imageUrl ? (
                                                    <Image src={item.imageUrl} alt={item.name} width={64} height={64} className="rounded-md object-cover h-16 w-16" data-ai-hint="product item" />
                                                ) : <div className="h-16 w-16 bg-muted rounded-md" />}
                                                <span className="truncate font-medium" title={item.name}>{item.name}</span>
                                                <span className="text-right">{item.quantity}</span>
                                                <span className="text-right">{formatCurrency(item.cost)}</span>
                                                <span className="text-right font-semibold">{formatCurrency(item.cost * item.quantity)}</span>
                                            </div>
                                            {(item.size || item.color || item.model || item.notes) && (
                                                <div className="text-xs text-muted-foreground mt-1 pt-1 border-t">
                                                    <div className="grid grid-cols-3 gap-x-4">
                                                        {item.size && <div><strong>Size:</strong> {item.size}</div>}
                                                        {item.color && <div><strong>Color:</strong> {item.color}</div>}
                                                        {item.model && <div><strong>Model:</strong> {item.model}</div>}
                                                    </div>
                                                    {item.notes && <p className="mt-1 whitespace-pre-wrap"><strong>Notes:</strong> {item.notes}</p>}
                                                </div>
                                            )}
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
                customers={customers}
            />
            <DeleteEstimationDialog
                isOpen={isDeleteDialogOpen}
                setIsOpen={setIsDeleteDialogOpen}
                estimation={estimation}
            />
        </div>
    )
}
