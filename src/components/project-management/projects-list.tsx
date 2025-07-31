
'use client';

import * as React from 'react';
import Link from 'next/link';
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
  getExpandedRowModel,
  ExpandedState,
} from '@tanstack/react-table';

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
import { AddProjectDialog } from './add-project-dialog';
import type { Task } from './tasks-list';
import { ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import type { TaskBlueprint } from './task-blueprints-list';


export type Project = {
  id: string;
  title: string;
  description?: string;
  status: 'in-progress' | 'completed' | 'on-hold' | 'canceled';
  manager: string;
  customer: string;
  startDate: string;
  endDate: string;
  taskBlueprintId: string;
};

const statusColors: Record<Project['status'], string> = {
    'in-progress': 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
    'completed': 'bg-green-500/20 text-green-700 dark:text-green-300',
    'on-hold': 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300',
    'canceled': 'bg-red-500/20 text-red-700 dark:text-red-300',
};

const taskStatusColors: Record<Task['status'], string> = {
    'in-progress': 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
    'done': 'bg-green-500/20 text-green-700 dark:text-green-300',
    'backlog': 'bg-gray-500/20 text-gray-700 dark:text-gray-300',
    'todo': 'bg-purple-500/20 text-purple-700 dark:text-purple-300',
    'canceled': 'bg-red-500/20 text-red-700 dark:text-red-300',
}

const taskPriorityColors: Record<Task['priority'], string> = {
    'low': 'text-green-600',
    'medium': 'text-yellow-600',
    'high': 'text-red-600',
}

// Helper function to format dates consistently
const formatDate = (dateString: string) => {
    // Append 'T00:00:00Z' to treat date strings as UTC, preventing timezone shifts.
    const date = new Date(dateString.includes('T') ? dateString : `${dateString}T00:00:00Z`);
    return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'numeric', day: 'numeric', timeZone: 'UTC' }).format(date);
};

const getColumns = (tasks: Task[]): ColumnDef<Project>[] => [
  {
    id: 'expander',
    header: () => null,
    cell: ({ row }) => {
      const projectTasks = tasks.filter(t => t.projectId === row.original.id);
      return projectTasks.length > 0 ? (
        <Button
            variant="ghost"
            size="icon"
            onClick={row.getToggleExpandedHandler()}
            className="h-6 w-6"
        >
            <ChevronRight className={`h-4 w-4 transition-transform ${row.getIsExpanded() ? 'rotate-90' : ''}`} />
        </Button>
      ) : null;
    },
  },
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
    header: 'ID',
    cell: ({ row }) => <div>{row.getValue('id')}</div>,
  },
  {
    accessorKey: 'title',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Title
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
        <Link href={`/project-management/projects/${row.original.id}`} className="font-medium hover:underline">
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
    cell: ({ row }) => <Badge variant="outline" className={`capitalize border-0 ${statusColors[row.getValue('status') as Project['status']]}`}>{row.getValue('status')}</Badge>,
  },
  {
    accessorKey: 'manager',
    header: 'Project Manager',
    cell: ({ row }) => <div>{row.getValue('manager')}</div>,
  },
  {
    accessorKey: 'customer',
    header: 'Customer',
    cell: ({ row }) => <div>{row.getValue('customer')}</div>,
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
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const project = row.original;

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
            <DropdownMenuItem asChild>
                <Link href={`/project-management/projects/${project.id}`}>View Project</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Edit Project</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Delete Project</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

const SubTasksList = ({ tasks }: { tasks: Task[] }) => {
  return (
    <div className="p-2 bg-muted/50">
      <h4 className="text-sm font-semibold mb-2">Tasks</h4>
       <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Assignee</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell className="font-medium max-w-xs truncate">
                <Link href={`/project-management/tasks/${task.id}`} className="hover:underline">
                    {task.title}
                </Link>
              </TableCell>
              <TableCell><Badge variant="outline" className={`capitalize border-0 ${taskStatusColors[task.status]}`}>{task.status}</Badge></TableCell>
              <TableCell><div className={`capitalize font-medium ${taskPriorityColors[task.priority]}`}>{task.priority}</div></TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                        <AvatarImage src={`https://placehold.co/100x100.png?text=${task.assignee.charAt(0)}`} />
                        <AvatarFallback>{task.assignee.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {task.assignee}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};


interface ProjectsListProps {
  data: Project[];
  tasks: Task[];
  taskBlueprints: TaskBlueprint[];
}

export function ProjectsList({ data, tasks, taskBlueprints }: ProjectsListProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
        description: false,
    });
  const [rowSelection, setRowSelection] = React.useState({});
  const [expanded, setExpanded] = React.useState<ExpandedState>({});
  
  const columns = React.useMemo(() => getColumns(tasks), [tasks]);


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
    onExpandedChange: setExpanded,
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: (row) => tasks.some(t => t.projectId === row.original.id),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      expanded,
    },
    meta: {
      // You can add any custom meta data here if needed
    }
  });

  return (
    <Card>
        <CardHeader className="p-2">
            <CardTitle>Projects</CardTitle>
            <CardDescription>A list of all projects in your organization.</CardDescription>
        </CardHeader>
        <CardContent className="p-2 pt-0">
            <div className="w-full">
            <div className="flex items-center justify-between py-2">
                <Input
                placeholder="Filter projects..."
                value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
                onChange={(event) =>
                    table.getColumn('title')?.setFilterValue(event.target.value)
                }
                className="max-w-sm h-8"
                />
                <div className="flex space-x-2">
                <AddProjectDialog taskBlueprints={taskBlueprints} />
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="ml-auto h-8">
                    Columns <ChevronDownIcon className="ml-2 h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide() && column.id !== 'expander')
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
                        <React.Fragment key={row.id}>
                            <TableRow
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
                            {row.getIsExpanded() && (
                                <TableRow>
                                    <TableCell colSpan={columns.length}>
                                       <SubTasksList tasks={tasks.filter(t => t.projectId === row.original.id)} />
                                    </TableCell>
                                </TableRow>
                            )}
                        </React.Fragment>
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
