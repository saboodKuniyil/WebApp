


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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { AddEstimationDialog } from './add-estimation-dialog';
import type { Product } from '../purchase/products-list';
import { useModules } from '@/context/modules-context';
import { CreateTaskFromEstimationDialog } from './create-task-from-estimation-dialog';
import { getProjects, getTaskBlueprints } from '@/lib/db';
import type { Project } from '../project-management/projects-list';
import type { TaskBlueprint } from '../project-management/task-blueprints-list';


export type EstimationItem = {
    id: string; // Can be product ID or a generated ID for adhoc items
    name: string;
    quantity: number;
    cost: number;
    type: 'product' | 'adhoc';
};

export type EstimationTask = {
    id: string;
    title: string;
    description?: string;
    items: EstimationItem[];
    totalCost: number;
}

export type Estimation = {
    id: string;
    title: string;
    customerName: string;
    tasks: EstimationTask[];
    totalCost: number;
    createdDate: string;
};

const getColumns = (
    formatCurrency: (amount: number) => string,
    handleOpenDialog: (estimation: Estimation) => void,
): ColumnDef<Estimation>[] => [
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
    header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          ID
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
    ),
    cell: ({ row }) => (
        <Link href={`/sales/estimations/${row.original.id}`} className="font-medium hover:underline">
            {row.getValue('id')}
        </Link>
    ),
  },
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => (
        <Link href={`/sales/estimations/${row.original.id}`} className="font-medium hover:underline">
            {row.getValue('title')}
        </Link>
    ),
  },
  {
    accessorKey: 'customerName',
    header: 'Customer',
    cell: ({ row }) => <div>{row.getValue('customerName')}</div>,
  },
  {
    accessorKey: 'totalCost',
    header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Total Cost
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
    ),
    cell: ({ row }) => <div>{formatCurrency(row.getValue('totalCost'))}</div>,
  },
  {
    accessorKey: 'createdDate',
    header: 'Date',
    cell: ({ row }) => <div>{row.getValue('createdDate')}</div>,
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const estimation = row.original;

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
                <Link href={`/sales/estimations/${estimation.id}`}>View Estimation</Link>
            </DropdownMenuItem>
             <DropdownMenuItem onClick={() => handleOpenDialog(estimation)}>Create Task from Estimation</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">Delete Estimation</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

interface EstimationsListProps {
  data: Estimation[];
  products: Product[];
}

export function EstimationsList({ data, products }: EstimationsListProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  
  const [isCreateTaskDialogOpen, setIsCreateTaskDialogOpen] = React.useState(false);
  const [selectedEstimation, setSelectedEstimation] = React.useState<Estimation | null>(null);
  
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [taskBlueprints, setTaskBlueprints] = React.useState<TaskBlueprint[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);


  const { currency } = useModules();

  const handleOpenCreateTaskDialog = (estimation: Estimation) => {
    setSelectedEstimation(estimation);
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
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    }
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency.code,
    }).format(amount);
  }, [currency]);

  const columns = React.useMemo(() => getColumns(formatCurrency, handleOpenCreateTaskDialog), [formatCurrency]);

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
    <>
    <Card>
      <CardHeader className="p-2">
        <CardTitle>All Estimations</CardTitle>
        <CardDescription>A list of all cost estimations.</CardDescription>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        <div className="w-full">
          <div className="flex items-center justify-between py-2">
            <Input
              placeholder="Filter estimations by title..."
              value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
              onChange={(event) => table.getColumn('title')?.setFilterValue(event.target.value)}
              className="max-w-sm h-8"
            />
            <div className="flex space-x-2">
              <AddEstimationDialog products={products} />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="ml-auto h-8">
                    Columns <ChevronDownIcon className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {table.getAllColumns().filter((column) => column.getCanHide()).map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="p-2">
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="p-2">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end space-x-2 py-2">
            <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <div className="space-x-2">
              <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                Previous
              </Button>
              <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                Next
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    {selectedEstimation && !isLoading && (
        <CreateTaskFromEstimationDialog 
            isOpen={isCreateTaskDialogOpen}
            setIsOpen={setIsCreateTaskDialogOpen}
            estimation={selectedEstimation}
            projects={projects}
            taskBlueprints={taskBlueprints}
        />
    )}
    </>
  );
}
