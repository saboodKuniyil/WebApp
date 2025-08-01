
'use client';

import * as React from 'react';
import {
  CaretSortIcon,
  ChevronDownIcon,
  DotsHorizontalIcon,
} from '@radix-ui/react-icons';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { AddTaskDialog } from './add-task-dialog';
import type { Project } from './projects-list';
import type { TaskBlueprint } from './task-blueprints-list';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Progress } from '../ui/progress';
import { updateTaskStatus } from '@/app/project-management/tasks/actions';
import { useToast } from '@/hooks/use-toast';

export type Task = {
  id: string;
  title: string;
  description?: string;
  status: 'in-progress' | 'done' | 'backlog' | 'todo' | 'canceled' | string; // Allow any string for dynamic statuses
  label: 'bug' | 'feature' | 'documentation';
  priority: 'low' | 'medium' | 'high';
  assignee: string;
  projectId: string;
  startDate?: string;
  endDate?: string;
  completionPercentage?: number;
};


const statusColors: Record<string, string> = {
    'in-progress': 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
    'done': 'bg-green-500/20 text-green-700 dark:text-green-300',
    'backlog': 'bg-gray-500/20 text-gray-700 dark:text-gray-300',
    'todo': 'bg-purple-500/20 text-purple-700 dark:text-purple-300',
    'canceled': 'bg-red-500/20 text-red-700 dark:text-red-300',
    'in-development': 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300',
    'in-review': 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300',
    'merged': 'bg-pink-500/20 text-pink-700 dark:text-pink-300',
}

const priorityColors = {
    'low': 'text-green-600',
    'medium': 'text-yellow-600',
    'high': 'text-red-600',
}

// Helper function to format dates consistently
const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    // Append 'T00:00:00Z' to treat date strings as UTC, preventing timezone shifts.
    const date = new Date(dateString.includes('T') ? dateString : `${dateString}T00:00:00Z`);
    return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'numeric', day: 'numeric', timeZone: 'UTC' }).format(date);
};

const getColumns = (
    projects: Project[], 
    taskBlueprints: TaskBlueprint[],
    onStatusChange: (taskId: string, newStatus: string) => void
): ColumnDef<Task>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'id',
    header: 'Task ID',
    cell: ({ row }) => <div>{row.getValue('id')}</div>,
  },
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => (
        <Link href={`/project-management/tasks/${row.original.id}`} className="font-medium hover:underline max-w-xs truncate block">
            {row.getValue('title')}
        </Link>
    ),
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => <div className="max-w-xs truncate">{row.getValue('description') ?? 'N/A'}</div>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
        const task = row.original;
        const project = projects.find(p => p.id === task.projectId);
        const blueprint = taskBlueprints.find(b => b.id === project?.taskBlueprintId);
        const availableStatuses = blueprint?.statuses ?? [];

        return (
             <Select
                value={task.status}
                onValueChange={(newStatus) => onStatusChange(task.id, newStatus)}
            >
                <SelectTrigger className={`w-36 h-8 capitalize border-0 shadow-none focus:ring-0 text-left justify-start font-medium px-2 ${statusColors[task.status]}`}>
                    <SelectValue>
                        <Badge variant="outline" className={`capitalize border-0 bg-transparent`}>{task.status}</Badge>
                    </SelectValue>
                </SelectTrigger>
                <SelectContent>
                    {availableStatuses.map(status => (
                        <SelectItem key={status.name} value={status.name.toLowerCase().replace(/\s/g, '-')}>{status.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'priority',
    header: 'Priority',
    cell: ({ row }) => <div className={`capitalize font-medium ${priorityColors[row.getValue('priority') as Task['priority']]}`}>{row.getValue('priority')}</div>,
  },
   {
    accessorKey: 'startDate',
    header: 'Start Date',
    cell: ({ row }) => <div>{formatDate(row.getValue('startDate'))}</div>,
  },
  {
    accessorKey: 'endDate',
    header: 'End Date',
    cell: ({ row }) => <div>{formatDate(row.getValue('endDate'))}</div>,
  },
  {
    accessorKey: 'completionPercentage',
    header: 'Completion',
    cell: ({ row }) => {
        const percentage = row.getValue('completionPercentage') as number ?? 0;
        return (
            <div className="flex items-center gap-2">
                <Progress value={percentage} className="h-2 w-24" />
                <span className="text-sm text-muted-foreground w-10 text-right">
                    {percentage}%
                </span>
            </div>
        )
    },
  },
  {
    accessorKey: 'projectId',
    header: 'Project',
    cell: ({ row, table }) => {
        const projects = (table.options.meta as { projects: Project[] })?.projects ?? [];
        const project = projects.find(p => p.id === row.getValue('projectId'));
        return <div>{project?.title ?? row.getValue('projectId')}</div>;
    },
  },
  {
    accessorKey: 'assignee',
    header: 'Assignee',
    cell: ({ row }) => <div className="flex items-center gap-2">
        <Avatar className="h-6 w-6">
            <AvatarImage src={`https://placehold.co/100x100.png?text=${row.getValue<string>('assignee').charAt(0)}`} />
            <AvatarFallback>{row.getValue<string>('assignee').charAt(0)}</AvatarFallback>
        </Avatar>
        {row.getValue('assignee')}
    </div>,
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const task = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <DotsHorizontalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>
                <Link href={`/project-management/tasks/${task.id}`} className="w-full">
                    View Task
                </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Edit Task</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Delete Task</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

interface TasksListProps {
    data: Task[];
    projects: Project[];
    taskBlueprints: TaskBlueprint[];
}

export function TasksList({ data, projects, taskBlueprints }: TasksListProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [mounted, setMounted] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const { toast } = useToast();


  const handleStatusChange = React.useCallback((taskId: string, newStatus: string) => {
        startTransition(async () => {
            const result = await updateTaskStatus(taskId, newStatus);
            if(result.message.includes('success')) {
                 toast({
                    title: 'Success',
                    description: result.message,
                });
            } else {
                 toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: result.message,
                });
            }
        })
  }, [toast]);
  
  const columns = React.useMemo(() => getColumns(projects, taskBlueprints, handleStatusChange), [projects, taskBlueprints, handleStatusChange]);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    meta: {
      projects,
    }
  });

  return (
     <Card>
        <CardHeader className="p-2">
            <CardTitle>Tasks</CardTitle>
            <CardDescription>A list of all tasks for the current project.</CardDescription>
        </CardHeader>
        <CardContent className="p-2 pt-0">
            <div className="w-full">
            <div className="flex items-center justify-between py-2">
                <Input
                placeholder="Filter tasks by title..."
                value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
                onChange={(event) =>
                    table.getColumn('title')?.setFilterValue(event.target.value)
                }
                className="max-w-sm h-8"
                />
                 <div className="flex items-center gap-2">
                    {mounted && <Select
                        value={(table.getColumn('projectId')?.getFilterValue() as string) ?? ''}
                        onValueChange={(value) =>
                            table.getColumn('projectId')?.setFilterValue(value === 'all' ? '' : value)
                        }
                    >
                        <SelectTrigger className="w-[180px] h-8">
                            <SelectValue placeholder="Filter by project" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Projects</SelectItem>
                            {projects.map((project) => (
                                <SelectItem key={project.id} value={project.id}>
                                    {project.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>}
                </div>
                <div className="flex space-x-2">
                <AddTaskDialog projects={projects} taskBlueprints={taskBlueprints} />
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="ml-auto h-8">
                    Columns <ChevronDownIcon className="ml-2 h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => {
                        return (
                        <DropdownMenuCheckboxItem
                            key={column.id}
                            className="capitalize"
                            checked={column.getIsVisible()}
                            onCheckedChange={(value) =>
                            column.toggleVisibility(!!value)
                            }
                        >
                            {column.id}
                        </DropdownMenuCheckboxItem>
                        );
                    })}
                </DropdownMenuContent>
                </DropdownMenu>
                </div>
            </div>
            <div className="rounded-md border">
                <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => {
                        return (
                            <TableHead key={header.id} className="p-2">
                            {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                )}
                            </TableHead>
                        );
                        })}
                    </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                        <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && 'selected'}
                        >
                        {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id} className="p-2">
                            {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                            )}
                            </TableCell>
                        ))}
                        </TableRow>
                    ))
                    ) : (
                    <TableRow>
                        <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                        >
                        No results.
                        </TableCell>
                    </TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-2">
                <div className="flex-1 text-sm text-muted-foreground">
                {table.getFilteredSelectedRowModel().rows.length} of{' '}
                {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Next
                </Button>
                </div>
            </div>
            </div>
        </CardContent>
    </Card>
  );
}
