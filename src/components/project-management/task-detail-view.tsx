
'use client'

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Project } from "./projects-list"
import type { Task } from "./tasks-list"
import type { Issue } from "./issues-list"
import type { Product } from "../purchase/products-list"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import { Pencil, Trash2, Briefcase, AlertTriangle, PlusCircle, DollarSign, Wallet, Plus, Trash } from "lucide-react"
import React from "react"
import Link from "next/link"
import { EditTaskDialog } from "./edit-task-dialog"
import { DeleteTaskDialog } from "./delete-task-dialog"
import { AddIssueDialog } from "./add-issue-dialog"
import { TaskBlueprint } from "./task-blueprints-list"
import { useModules } from "@/context/modules-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { useActionState } from "react"
import { updateTask } from "@/app/project-management/tasks/actions"
import { useToast } from "@/hooks/use-toast"
import type { EstimationItem } from "../sales/estimations-list"


interface TaskDetailViewProps {
    task: Task
    project?: Project
    issues: Issue[]
    projects: Project[]
    taskBlueprints: TaskBlueprint[]
    products: Product[]
}

const statusColors: Record<Task['status'], string> = {
    'in-progress': 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
    'done': 'bg-green-500/20 text-green-700 dark:text-green-300',
    'backlog': 'bg-gray-500/20 text-gray-700 dark:text-gray-300',
    'todo': 'bg-purple-500/20 text-purple-700 dark:text-purple-300',
    'canceled': 'bg-red-500/20 text-red-700 dark:text-red-300',
};

const issueStatusColors: Record<Issue['status'], string> = {
    'open': 'bg-red-500/20 text-red-700 dark:text-red-300',
    'in-progress': 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
    'closed': 'bg-green-500/20 text-green-700 dark:text-green-300',
}

const priorityColors: Record<Task['priority'], string> = {
    'low': 'text-green-600',
    'medium': 'text-yellow-600',
    'high': 'text-red-600',
};

const labelColors: Record<Task['label'], string> = {
    'bug': 'bg-red-500/20 text-red-700 dark:text-red-300',
    'feature': 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
    'documentation': 'bg-gray-500/20 text-gray-700 dark:text-gray-300',
}

const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString.includes('T') ? dateString : `${dateString}T00:00:00Z`);
    return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(date);
};

function TaskBudgetManager({ task, products }: { task: Task, products: Product[] }) {
    const { currency } = useModules();
    const { toast } = useToast();
    const formRef = React.useRef<HTMLFormElement>(null);
    const [state, dispatch] = useActionState(updateTask, { message: '', errors: {} });

    // State for adding a product item
    const [selectedProduct, setSelectedProduct] = React.useState<string>('');
    const [productQuantity, setProductQuantity] = React.useState(1);
    
    // State for adding an ad-hoc item
    const [adhocName, setAdhocName] = React.useState('');
    const [adhocQuantity, setAdhocQuantity] = React.useState(1);
    const [adhocCost, setAdhocCost] = React.useState(0);
    
    const [budgetItems, setBudgetItems] = React.useState<EstimationItem[]>(task.budgetItems || []);

    const totalBudget = React.useMemo(() => {
        return budgetItems.reduce((acc, item) => acc + (item.cost * item.quantity), 0);
    }, [budgetItems]);

    const formatCurrency = React.useCallback((amount: number) => {
        if (!currency) {
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
        }
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.code }).format(amount);
    }, [currency]);
    
     React.useEffect(() => {
        if (state.message) {
            if (state.message.includes('success')) {
                toast({ title: 'Success', description: 'Task budget updated.' });
            } else {
                 toast({ variant: 'destructive', title: 'Error', description: state.message });
            }
        }
    }, [state, toast]);

    const handleAddItem = (item: EstimationItem) => {
        setBudgetItems(prev => [...prev, item]);
    };
    
    const handleAddProduct = () => {
        const product = products.find(p => p.id === selectedProduct);
        if (!product || !selectedProduct) return;
        
        handleAddItem({
            id: product.id,
            name: product.name,
            quantity: productQuantity,
            cost: product.salesPrice,
            type: 'product',
        });
        setSelectedProduct('');
        setProductQuantity(1);
    };

    const handleAddAdhocItem = () => {
        if (!adhocName || adhocQuantity <= 0 || adhocCost < 0) return;
        handleAddItem({
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

    const handleRemoveItem = (itemId: string) => {
        setBudgetItems(prev => prev.filter(item => item.id !== itemId));
    };


    return (
        <form action={dispatch} ref={formRef}>
            <input type="hidden" name="id" value={task.id} />
            <input type="hidden" name="title" value={task.title} />
            <input type="hidden" name="status" value={task.status} />
            <input type="hidden" name="priority" value={task.priority} />
            <input type="hidden" name="label" value={task.label} />
            <input type="hidden" name="assignee" value={task.assignee} />
            <input type="hidden" name="projectId" value={task.projectId} />
            <input type="hidden" name="budgetItems" value={JSON.stringify(budgetItems)} />
            
            <Card>
                <CardHeader className="p-4 flex flex-row items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="flex items-center"><Wallet className="mr-2 h-5 w-5" />Task Budget</CardTitle>
                        <CardDescription>Define the budget for this task.</CardDescription>
                    </div>
                     <div className="flex items-center gap-2">
                         <div className="text-right">
                            <p className="text-sm text-muted-foreground">Total Budget</p>
                            <p className="text-xl font-bold">{formatCurrency(totalBudget)}</p>
                        </div>
                        <Button type="submit">Save Budget</Button>
                    </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-4">
                     {budgetItems.map(item => (
                        <div key={item.id} className="grid grid-cols-[1fr_80px_80px_80px_40px] items-center gap-x-4 p-2 border rounded-md text-sm">
                            <span className="truncate" title={item.name}>{item.name}</span>
                            <span className="text-right">{item.quantity}</span>
                            <span className="text-right">{formatCurrency(item.cost)}</span>
                            <span className="text-right font-semibold">{formatCurrency(item.cost * item.quantity)}</span>
                            <Button type="button" variant="ghost" size="icon" className="h-6 w-6 justify-self-end" onClick={() => handleRemoveItem(item.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                    <Card className="p-4 mt-4 bg-muted/50">
                        <Tabs defaultValue="product">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="product">Add Product</TabsTrigger>
                                <TabsTrigger value="adhoc">Add Ad-hoc Item</TabsTrigger>
                            </TabsList>
                            <TabsContent value="product" className="pt-4">
                                <div className="flex items-end gap-2">
                                    <div className="flex-1 space-y-1">
                                        <Label>Product</Label>
                                        <Select onValueChange={setSelectedProduct} value={selectedProduct}><SelectTrigger><SelectValue placeholder="Select a product" /></SelectTrigger>
                                        <SelectContent>
                                            {products.map(p => 
                                                <SelectItem key={p.id} value={p.id}>
                                                    <div className="flex justify-between w-full">
                                                        <span>{p.name}</span>
                                                        <span className="text-muted-foreground ml-4">{formatCurrency(p.salesPrice)}</span>
                                                    </div>
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1"><Label>Quantity</Label><Input type="number" value={productQuantity} onChange={e => setProductQuantity(Number(e.target.value))} className="w-24" min="1" /></div>
                                    <Button type="button" onClick={handleAddProduct}><Plus className="h-4 w-4 mr-2" />Add</Button>
                                </div>
                            </TabsContent>
                            <TabsContent value="adhoc" className="pt-4">
                                <div className="flex items-end gap-2">
                                    <div className="flex-1 space-y-1"><Label>Item Name</Label><Input value={adhocName} onChange={e => setAdhocName(e.target.value)} /></div>
                                    <div className="space-y-1"><Label>Quantity</Label><Input type="number" value={adhocQuantity} onChange={e => setAdhocQuantity(Number(e.target.value))} className="w-24" min="1" /></div>
                                    <div className="space-y-1"><Label>Cost per Item</Label><Input type="number" value={adhocCost} onChange={e => setAdhocCost(Number(e.target.value))} className="w-28" /></div>
                                    <Button type="button" onClick={handleAddAdhocItem}><Plus className="h-4 w-4 mr-2" />Add</Button>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </Card>
                </CardContent>
            </Card>
        </form>
    )
}

export function TaskDetailView({ task, project, issues, projects, taskBlueprints, products }: TaskDetailViewProps) {
    const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
    const { currency } = useModules();

    const formatCurrency = React.useCallback((amount: number) => {
        if (!currency) {
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
        }
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.code }).format(amount);
    }, [currency]);
    
    const totalBudget = React.useMemo(() => {
        return (task.budgetItems || []).reduce((acc, item) => acc + (item.cost * item.quantity), 0);
    }, [task.budgetItems]);

    return (
        <div className="space-y-6">
             <Card>
                <CardHeader className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-3xl font-bold font-headline">{task.title}</CardTitle>
                            <CardDescription>{task.id}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                             <Button variant="outline" size="icon" onClick={() => setIsEditDialogOpen(true)}>
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit Task</span>
                            </Button>
                            <Button variant="destructive" size="icon" onClick={() => setIsDeleteDialogOpen(true)}>
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete Task</span>
                            </Button>
                            <Badge variant="outline" className={`capitalize text-lg border-0 ${statusColors[task.status]}`}>{task.status}</Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 p-4 pt-0">
                    {task.description && <p className="text-muted-foreground">{task.description}</p>}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <p className="font-semibold">Assignee</p>
                             <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src={`https://placehold.co/100x100.png?text=${task.assignee.charAt(0)}`} />
                                    <AvatarFallback>{task.assignee.charAt(0)}</AvatarFallback>
                                </Avatar>
                                {task.assignee}
                            </div>
                        </div>
                        <div>
                            <p className="font-semibold">Priority</p>
                            <p className={`capitalize font-medium ${priorityColors[task.priority]}`}>{task.priority}</p>
                        </div>
                        <div>
                            <p className="font-semibold">Start Date</p>
                            <p>{formatDate(task.startDate)}</p>
                        </div>
                        <div>
                            <p className="font-semibold">End Date</p>
                            <p>{formatDate(task.endDate)}</p>
                        </div>
                         <div>
                            <p className="font-semibold">Label</p>
                             <Badge variant="outline" className={`capitalize border-0 ${labelColors[task.label]}`}>{task.label}</Badge>
                        </div>
                        {project && (
                             <div>
                                <p className="font-semibold">Project</p>
                                <Button variant="link" asChild className="p-0 h-auto">
                                    <Link href={`/project-management/projects/${project.id}`} className="flex items-center gap-1">
                                        <Briefcase className="h-4 w-4" />
                                        {project.title}
                                    </Link>
                                </Button>
                            </div>
                        )}
                         <div>
                            <p className="font-semibold">Total Budget</p>
                            <p className="font-bold text-base">{formatCurrency(totalBudget)}</p>
                        </div>
                    </div>
                    <div>
                        <p className="font-semibold text-sm mb-1">Completion</p>
                        <div className="flex items-center gap-2">
                             <Progress value={task.completionPercentage} className="h-2" />
                             <span className="text-sm font-medium text-muted-foreground">{task.completionPercentage}%</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
            
            <TaskBudgetManager task={task} products={products} />

            <Card>
                <CardHeader className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle className="flex items-center"><AlertTriangle className="mr-2 h-5 w-5" />Related Issues</CardTitle>
                            <CardDescription>A list of issues associated with this task.</CardDescription>
                        </div>
                        <AddIssueDialog 
                            tasks={[task]} 
                            defaultTaskId={task.id}
                            trigger={
                                <Button size="sm">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Add Issue
                                </Button>
                            }
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="p-2">Issue ID</TableHead>
                                <TableHead className="p-2">Title</TableHead>
                                <TableHead className="p-2">Status</TableHead>
                                <TableHead className="p-2">Priority</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {issues.map((issue) => (
                                <TableRow key={issue.id}>
                                    <TableCell className="p-2">
                                         <Link href={`/project-management/issues/${issue.id}`} className="hover:underline font-medium">
                                            {issue.id}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="max-w-xs truncate p-2">
                                        <Link href={`/project-management/issues/${issue.id}`} className="hover:underline">
                                            {issue.title}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="p-2"><Badge variant="outline" className={`capitalize border-0 ${issueStatusColors[issue.status]}`}>{issue.status}</Badge></TableCell>
                                    <TableCell className="p-2"><div className={`capitalize font-medium ${priorityColors[issue.priority as keyof typeof priorityColors]}`}>{issue.priority}</div></TableCell>
                                </TableRow>
                            ))}
                            {issues.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center p-2">No issues for this task.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <EditTaskDialog task={task} projects={projects} taskBlueprints={taskBlueprints} isOpen={isEditDialogOpen} setIsOpen={setIsEditDialogOpen} />
            <DeleteTaskDialog task={task} isOpen={isDeleteDialogOpen} setIsOpen={setIsDeleteDialogOpen} />
        </div>
    )
}
