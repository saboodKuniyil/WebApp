
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
import { PlusCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

const data: Issue[] = [
    {
    id: 'ISSUE-282',
    title: 'Login button not working on Safari',
    status: 'open',
    type: 'bug',
    priority: 'high',
    created: '2024-07-20',
  },
  {
    id: 'ISSUE-281',
    title: 'Add dark mode support',
    status: 'in-progress',
    type: 'feature-request',
    priority: 'medium',
    created: '2024-07-18',
  },
  {
    id: 'ISSUE-279',
    title: 'API rate limit exceeded',
    status: 'closed',
    type: 'bug',
    priority: 'high',
    created: '2024-07-15',
  },
  {
    id: 'ISSUE-278',
    title: 'Update documentation for new endpoint',
    status: 'open',
    type: 'documentation',
    priority: 'low',
    created: '2024-07-21',
  },
];

export type Issue = {
  id: string;
  title: string;
  status: 'open' | 'in-progress' | 'closed';
  type: 'bug' | 'feature-request' | 'documentation';
  priority: 'low' | 'medium' | 'high';
  created: string;
};

const statusColors = {
    'open': 'bg-red-500/20 text-red-700 dark:text-red-300',
    'in-progress': 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
    'closed': 'bg-green-500/20 text-green-700 dark:text-green-300',
}

const typeColors = {
    'bug': 'bg-red-500/20 text-red-700 dark:text-red-300',
    'feature-request': 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
    'documentation': 'bg-gray-500/20 text-gray-700 dark:text-gray-300',
}

const priorityColors = {
    'low': 'text-green-600',
    'medium': 'text-yellow-600',
    'high': 'text-red-600',
}

export const columns: ColumnDef<Issue>[] = [
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
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => <div className="font-medium max-w-xs truncate">{row.getValue('title')}</div>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <Badge variant="outline" className={`capitalize border-0 ${statusColors[row.getValue('status') as Issue['status']]}`}>{row.getValue('status')}</Badge>,
  },
    {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => <Badge variant="outline" className={`capitalize border-0 ${typeColors[row.getValue('type') as Issue['type']]}`}>{row.getValue('type')}</Badge>,
  },
  {
    accessorKey: 'priority',
    header: 'Priority',
    cell: ({ row }) => <div className={`capitalize font-medium ${priorityColors[row.getValue('priority') as Issue['priority']]}`}>{row.getValue('priority')}</div>,
  },
    {
    accessorKey: 'created',
    header: 'Date Created',
    cell: ({ row }) => <div>{row.getValue('created')}</div>,
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const issue = row.original;

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
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(issue.id)}
            >
              View Issue
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Edit Issue</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Delete Issue</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function IssuesList() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

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
  });

  return (
    <Card>
        <CardHeader>
            <CardTitle>Issues</CardTitle>
            <CardDescription>A list of all issues for the current project.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="w-full">
            <div className="flex items-center justify-between py-4">
                <Input
                placeholder="Filter issues..."
                value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
                onChange={(event) =>
                    table.getColumn('title')?.setFilterValue(event.target.value)
                }
                className="max-w-sm"
                />
                <div className="flex space-x-2">
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Issue
                </Button>
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="ml-auto">
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
                            <TableHead key={header.id}>
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
                            <TableCell key={cell.id}>
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
            <div className="flex items-center justify-end space-x-2 py-4">
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
