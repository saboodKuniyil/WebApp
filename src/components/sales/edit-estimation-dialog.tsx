

'use client';

import * as React from 'react';
import { useActionState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, GripVertical, Upload } from 'lucide-react';
import { updateEstimation } from '@/app/sales/estimations/actions';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';
import { useModules } from '@/context/modules-context';
import type { Product } from '../purchase/products-list';
import type { Estimation, EstimationItem, EstimationTask } from './estimations-list';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card } from '../ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger as AccordionTriggerPrimitive } from '../ui/accordion';
import { Textarea } from '../ui/textarea';
import type { Customer } from '@/lib/db';
import Image from 'next/image';

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

interface EditEstimationDialogProps {
    products: Product[];
    customers: Customer[];
    estimation: Estimation;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

function SubmitButton() {
    return <Button type="submit">Save Changes</Button>;
}

export function EditEstimationDialog({ products, customers, estimation, isOpen, setIsOpen }: EditEstimationDialogProps) {
    const [state, dispatch] = useActionState(updateEstimation, initialState);
    const [tasks, setTasks] = React.useState<EstimationTask[]>(estimation.tasks);
    const [totalCost, setTotalCost] = React.useState(estimation.totalCost);
    const [selectedCustomer, setSelectedCustomer] = React.useState<{id: string, name: string} | null>(
        estimation.customerId && estimation.customerName ? {id: estimation.customerId, name: estimation.customerName} : null
    );

    // State for adding a product item
    const [selectedProduct, setSelectedProduct] = React.useState<string>('');
    const [productQuantity, setProductQuantity] = React.useState(1);
    
    // State for adding an ad-hoc item
    const [adhocName, setAdhocName] = React.useState('');
    const [adhocQuantity, setAdhocQuantity] = React.useState(1);
    const [adhocCost, setAdhocCost] = React.useState(0);
    const [adhocSize, setAdhocSize] = React.useState('');
    const [adhocColor, setAdhocColor] = React.useState('');
    const [adhocModel, setAdhocModel] = React.useState('');
    const [adhocNotes, setAdhocNotes] = React.useState('');
    const [adhocImage, setAdhocImage] = React.useState<string | null>(null);
    const adhocFileInputRef = React.useRef<HTMLInputElement>(null);

    // State for adding a new task
    const [newTaskTitle, setNewTaskTitle] = React.useState('');
    const [newTaskDescription, setNewTaskDescription] = React.useState('');
    
    const { toast } = useToast();
    const { currency } = useModules();
    const taskCounterRef = React.useRef(estimation.tasks.length > 0 ? Math.max(...estimation.tasks.map(t => parseInt(t.id.replace('ET-','')))) + 1 : 1001);


    const formatCurrency = React.useCallback((amount: number) => {
        if (!currency) {
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
        }
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.code }).format(amount);
    }, [currency]);

    React.useEffect(() => {
        if (state.message) {
            if (state.errors && Object.keys(state.errors).length > 0) {
                toast({ variant: 'destructive', title: 'Error', description: state.message });
            } else {
                toast({ title: 'Success', description: state.message });
                setIsOpen(false);
            }
        }
    }, [state, toast, setIsOpen]);

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
            imageUrl: product.imageUrl,
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
            size: adhocSize,
            color: adhocColor,
            model: adhocModel,
            notes: adhocNotes,
            imageUrl: adhocImage || undefined,
        });
        setAdhocName('');
        setAdhocQuantity(1);
        setAdhocCost(0);
        setAdhocSize('');
        setAdhocColor('');
        setAdhocModel('');
        setAdhocNotes('');
        setAdhocImage(null);
        if (adhocFileInputRef.current) adhocFileInputRef.current.value = '';
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

    const handleCustomerSelect = (customerId: string) => {
        const customer = customers.find(c => c.id === customerId);
        if (customer) {
            setSelectedCustomer({id: customer.id, name: customer.name});
        }
    };
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setAdhocImage(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Edit Estimation</DialogTitle>
                    <DialogDescription>Update the details of your estimation.</DialogDescription>
                </DialogHeader>
                <form action={dispatch}>
                    <input type="hidden" name="id" value={estimation.id} />
                    <input type="hidden" name="createdDate" value={estimation.createdDate} />
                    <input type="hidden" name="tasks" value={JSON.stringify(tasks)} />
                    <input type="hidden" name="totalCost" value={totalCost} />
                    <input type="hidden" name="customerId" value={selectedCustomer?.id || ''} />
                    <input type="hidden" name="customerName" value={selectedCustomer?.name || ''} />
                    <ScrollArea className="h-[70vh] pr-4">
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="id-display">Estimation ID</Label>
                                    <Input id="id-display" value={estimation.id} readOnly className="font-mono bg-muted" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input id="title" name="title" defaultValue={estimation.title} />
                                    {state.errors?.title && <p className="text-red-500 text-xs text-right">{state.errors.title[0]}</p>}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="customer">Customer</Label>
                                <Select onValueChange={handleCustomerSelect} defaultValue={selectedCustomer?.id}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a customer" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {customers.map((customer) => (
                                            <SelectItem key={customer.id} value={customer.id}>
                                                {customer.name} ({customer.id})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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
                                        <Accordion type="multiple" className="w-full space-y-2" defaultValue={tasks.map(t => t.id)}>
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
                                                             <div key={item.id} className="p-2 border rounded-md">
                                                                <div className="grid grid-cols-[80px_1fr_80px_80px_80px_40px] items-center gap-x-4 text-sm">
                                                                    {item.imageUrl ? (
                                                                        <Image src={item.imageUrl} alt={item.name} width={64} height={64} className="rounded-md object-cover h-16 w-16" />
                                                                    ) : <div className="h-16 w-16 bg-muted rounded-md" />}
                                                                    <span className="truncate font-medium" title={item.name}>{item.name}</span>
                                                                    <span className="text-right">{item.quantity}</span>
                                                                    <span className="text-right">{formatCurrency(item.cost)}</span>
                                                                    <span className="text-right font-semibold">{formatCurrency(item.cost * item.quantity)}</span>
                                                                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6 justify-self-end" onClick={() => handleRemoveItem(task.id, item.id)}>
                                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                                    </Button>
                                                                </div>
                                                                {(item.size || item.color || item.model || item.notes) && (
                                                                     <div className="text-xs text-muted-foreground mt-1 pt-1 border-t">
                                                                        {item.size && <span>Size: {item.size} &middot; </span>}
                                                                        {item.color && <span>Color: {item.color} &middot; </span>}
                                                                        {item.model && <span>Model: {item.model}</span>}
                                                                        {item.notes && <p className="whitespace-pre-wrap">Notes: {item.notes}</p>}
                                                                    </div>
                                                                )}
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
                                                                <TabsContent value="adhoc" className="pt-4 space-y-2">
                                                                    <div className="flex items-end gap-2">
                                                                        <div className="flex-1 space-y-1"><Label>Item Name</Label><Input value={adhocName} onChange={e => setAdhocName(e.target.value)} /></div>
                                                                        <div className="space-y-1"><Label>Quantity</Label><Input type="number" value={adhocQuantity} onChange={e => setAdhocQuantity(Number(e.target.value))} className="w-24" min="1" /></div>
                                                                        <div className="space-y-1"><Label>Cost per Item</Label><Input type="number" value={adhocCost} onChange={e => setAdhocCost(Number(e.target.value))} className="w-28" /></div>
                                                                    </div>
                                                                    <div className="grid grid-cols-3 gap-2">
                                                                        <div className="space-y-1"><Label>Size</Label><Input value={adhocSize} onChange={e => setAdhocSize(e.target.value)} /></div>
                                                                        <div className="space-y-1"><Label>Color</Label><Input value={adhocColor} onChange={e => setAdhocColor(e.target.value)} /></div>
                                                                        <div className="space-y-1"><Label>Model</Label><Input value={adhocModel} onChange={e => setAdhocModel(e.target.value)} /></div>
                                                                    </div>
                                                                    <div className="space-y-1"><Label>Notes</Label><Textarea value={adhocNotes} onChange={e => setAdhocNotes(e.target.value)} /></div>
                                                                    <div className="space-y-1"><Label>Image</Label>
                                                                        <div className="flex items-center gap-2">
                                                                            {adhocImage && <Image src={adhocImage} alt="preview" width={40} height={40} className="rounded-md" />}
                                                                            <Input type="file" accept="image/*" onChange={handleImageChange} ref={adhocFileInputRef} />
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex justify-end">
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
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <SubmitButton />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
