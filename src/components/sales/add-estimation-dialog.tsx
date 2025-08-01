

'use client';

import * as React from 'react';
import { useActionState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Plus, Trash2, GripVertical, ChevronDown } from 'lucide-react';
import { createEstimation, getNextEstimationId } from '@/app/sales/estimations/actions';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';
import { useModules } from '@/context/modules-context';
import type { Product } from '../purchase/products-list';
import type { EstimationItem, EstimationTask } from './estimations-list';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card } from '../ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger as AccordionTriggerPrimitive } from '../ui/accordion';
import { Textarea } from '../ui/textarea';

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionTriggerPrimitive>,
  React.ComponentPropsWithoutRef<typeof AccordionTriggerPrimitive>
>(({ className, children, ...props }, ref) => (
  <AccordionTriggerPrimitive
    ref={ref}
    className="py-0 hover:no-underline"
    {...props}
  >
    {children}
  </AccordionTriggerPrimitive>
));
AccordionTrigger.displayName = AccordionTriggerPrimitive.displayName

const initialState = { message: '', errors: {} };

interface AddEstimationDialogProps {
    products: Product[];
}

function SubmitButton() {
    return <Button type="submit">Create Estimation</Button>;
}

export function AddEstimationDialog({ products }: AddEstimationDialogProps) {
    const [state, dispatch] = useActionState(createEstimation, initialState);
    const [isOpen, setIsOpen] = React.useState(false);
    const [nextId, setNextId] = React.useState('');
    const [tasks, setTasks] = React.useState<EstimationTask[]>([]);
    const [totalCost, setTotalCost] = React.useState(0);
    
    // State for adding a product item
    const [selectedProduct, setSelectedProduct] = React.useState<string>('');
    const [productQuantity, setProductQuantity] = React.useState(1);
    
    // State for adding an ad-hoc item
    const [adhocName, setAdhocName] = React.useState('');
    const [adhocQuantity, setAdhocQuantity] = React.useState(1);
    const [adhocCost, setAdhocCost] = React.useState(0);

    // State for adding a new task
    const [newTaskTitle, setNewTaskTitle] = React.useState('');
    const [newTaskDescription, setNewTaskDescription] = React.useState('');
    
    const { toast } = useToast();
    const formRef = React.useRef<HTMLFormElement>(null);
    const { currency } = useModules();
    const taskCounterRef = React.useRef(1001);

    const formatCurrency = React.useCallback((amount: number) => {
        if (!currency) {
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
        }
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.code }).format(amount);
    }, [currency]);

    const resetForm = React.useCallback(() => {
        formRef.current?.reset();
        setTasks([]);
        setTotalCost(0);
        setSelectedProduct('');
        setProductQuantity(1);
        setAdhocName('');
        setAdhocQuantity(1);
        setAdhocCost(0);
        setNewTaskTitle('');
        setNewTaskDescription('');
    }, []);

    React.useEffect(() => {
        if (state.message) {
            if (state.errors && Object.keys(state.errors).length > 0) {
                toast({ variant: 'destructive', title: 'Error', description: state.message });
            } else {
                toast({ title: 'Success', description: state.message });
                setIsOpen(false);
                resetForm();
            }
        }
    }, [state, toast, resetForm]);

    React.useEffect(() => {
        if (isOpen) {
            getNextEstimationId().then(setNextId);
        }
    }, [isOpen]);

    React.useEffect(() => {
        const newTotalCost = tasks.reduce((acc, task) => acc + task.totalCost, 0);
        setTotalCost(newTotalCost);
    }, [tasks]);

    const updateTaskCosts = (updatedTasks: EstimationTask[]) => {
        const newTasks = updatedTasks.map(task => {
            const taskTotal = task.items.reduce((acc, item) => acc + (item.cost * item.quantity), 0);
            return { ...task, totalCost: taskTotal };
        });
        setTasks(newTasks);
    };

    const handleAddItemToTask = (taskId: string, item: EstimationItem) => {
        const updatedTasks = tasks.map(task => {
            if (task.id === taskId) {
                return { ...task, items: [...task.items, item] };
            }
            return task;
        });
        updateTaskCosts(updatedTasks);
    };
    
    const handleAddProduct = (taskId: string) => {
        const product = products.find(p => p.id === selectedProduct);
        if (!product || !selectedProduct) return;
        
        handleAddItemToTask(taskId, {
            id: product.id,
            name: product.name,
            quantity: productQuantity,
            cost: product.salesPrice,
            type: 'product',
        });
        setSelectedProduct('');
        setProductQuantity(1);
    };

    const handleAddAdhocItem = (taskId: string) => {
        if (!adhocName || adhocQuantity <= 0 || adhocCost < 0) return;
        handleAddItemToTask(taskId, {
            id: `adhoc-${Date.now()}`,
            name: adhocName,
            quantity: adhocQuantity,
            cost: adhocCost,
            type: 'adhoc',
        });
        setAdhocName('');
        setAdhocQuantity(1);
        setAdhocCost(0);
    };
    
    const handleRemoveItem = (taskId: string, itemId: string) => {
        const updatedTasks = tasks.map(task => {
            if (task.id === taskId) {
                return { ...task, items: task.items.filter(item => item.id !== itemId) };
            }
            return task;
        });
        updateTaskCosts(updatedTasks);
    };

    const handleAddTask = () => {
        if (!newTaskTitle.trim()) return;
        const newTask: EstimationTask = {
            id: `ET-${taskCounterRef.current++}`,
            title: newTaskTitle,
            description: newTaskDescription,
            items: [],
            totalCost: 0
        };
        setTasks([...tasks, newTask]);
        setNewTaskTitle('');
        setNewTaskDescription('');
    };

    const handleRemoveTask = (taskId: string) => {
        const updatedTasks = tasks.filter(task => task.id !== taskId);
        updateTaskCosts(updatedTasks);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Estimation
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Create New Estimation</DialogTitle>
                    <DialogDescription>Build a cost sheet by adding tasks, and then products or ad-hoc items to each task.</DialogDescription>
                </DialogHeader>
                <form ref={formRef} action={dispatch}>
                    <input type="hidden" name="id" value={nextId} />
                    <input type="hidden" name="tasks" value={JSON.stringify(tasks)} />
                    <input type="hidden" name="totalCost" value={totalCost} />
                    <ScrollArea className="h-[70vh] pr-4">
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="id-display" className="text-right">Estimation ID</Label>
                                <Input id="id-display" value={nextId} readOnly className="col-span-3 font-mono bg-muted" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="title" className="text-right">Title</Label>
                                <Input id="title" name="title" className="col-span-3" />
                                {state.errors?.title && <p className="col-span-4 text-red-500 text-xs text-right">{state.errors.title[0]}</p>}
                            </div>

                            <Card className="p-4 space-y-2">
                                <Label>Add a New Task/Scope</Label>
                                <div className="space-y-2">
                                    <Input 
                                        placeholder="Task Title (e.g., Kitchen Cabinets, Living Room Flooring)"
                                        value={newTaskTitle}
                                        onChange={e => setNewTaskTitle(e.target.value)}
                                    />
                                    <Textarea
                                        placeholder="Task Description (optional)"
                                        value={newTaskDescription}
                                        onChange={e => setNewTaskDescription(e.target.value)}
                                        rows={2}
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <Button type="button" onClick={handleAddTask}><Plus className="h-4 w-4 mr-2" />Add Task</Button>
                                </div>
                            </Card>

                            <div className="space-y-2">
                                <Label>Estimation Breakdown</Label>
                                <Card className="p-2 space-y-2">
                                    {tasks.length > 0 ? (
                                        <Accordion type="multiple" className="w-full space-y-2">
                                            {tasks.map(task => (
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
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10" onClick={(e) => { e.stopPropagation(); handleRemoveTask(task.id);}}>
                                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <AccordionContent className="p-2 space-y-4">
                                                        {task.description && <p className="text-sm text-muted-foreground border-b pb-4 mb-4 whitespace-pre-wrap">{task.description}</p>}
                                                         {task.items.map(item => (
                                                            <div key={item.id} className="grid grid-cols-[1fr_80px_80px_80px_40px] items-center gap-x-4 p-2 border rounded-md text-sm">
                                                                <span className="truncate" title={item.name}>{item.name}</span>
                                                                <span className="text-right">{item.quantity}</span>
                                                                <span className="text-right">{formatCurrency(item.cost)}</span>
                                                                <span className="text-right font-semibold">{formatCurrency(item.cost * item.quantity)}</span>
                                                                <Button type="button" variant="ghost" size="icon" className="h-6 w-6 justify-self-end" onClick={() => handleRemoveItem(task.id, item.id)}>
                                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                        
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
                                                                        <Button type="button" onClick={() => handleAddProduct(task.id)}><Plus className="h-4 w-4 mr-2" />Add</Button>
                                                                    </div>
                                                                </TabsContent>
                                                                <TabsContent value="adhoc" className="pt-4">
                                                                    <div className="flex items-end gap-2">
                                                                        <div className="flex-1 space-y-1"><Label>Item Name</Label><Input value={adhocName} onChange={e => setAdhocName(e.target.value)} /></div>
                                                                        <div className="space-y-1"><Label>Quantity</Label><Input type="number" value={adhocQuantity} onChange={e => setAdhocQuantity(Number(e.target.value))} className="w-24" min="1" /></div>
                                                                        <div className="space-y-1"><Label>Cost per Item</Label><Input type="number" value={adhocCost} onChange={e => setAdhocCost(Number(e.target.value))} className="w-28" /></div>
                                                                        <Button type="button" onClick={() => handleAddAdhocItem(task.id)}><Plus className="h-4 w-4 mr-2" />Add</Button>
                                                                    </div>
                                                                </TabsContent>
                                                            </Tabs>
                                                        </Card>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            ))}
                                        </Accordion>
                                    ) : (
                                        <div className="text-center text-muted-foreground py-8">No tasks added yet. Add a task to begin.</div>
                                    )}
                                </Card>
                                {state.errors?.tasks && <p className="text-red-500 text-xs text-right">{state.errors.tasks[0]}</p>}
                            </div>

                             <div className="flex justify-end">
                                <div className="text-right space-y-1 p-4 rounded-md border w-64 bg-background">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Grand Total:</span>
                                        <span className="font-bold text-xl">{formatCurrency(totalCost)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline" onClick={resetForm}>Cancel</Button></DialogClose>
                        <SubmitButton />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
