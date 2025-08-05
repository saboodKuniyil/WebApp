
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

import { Button, buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
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
import { useModules } from '@/context/modules-context';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Badge } from '../ui/badge';
import type { SalesOrder } from '@/lib/db';
import type { Quotation } from './quotations-list';

interface SalesOrdersListProps {
  data: SalesOrder[];
  quotations: Quotation[];
}

const statusColors: Record<SalesOrder['status'], string> = {
    open: 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
    'in-progress': 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300',
    fulfilled: 'bg-green-500/20 text-green-700 dark:text-green-300',
    canceled: 'bg-red-500/20 text-red-700 dark:text-red-300',
};


export function SalesOrdersList({ data, quotations }: SalesOrdersListProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

  const { currency } = useModules();

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

  const columns: ColumnDef<SalesOrder>[] = React.useMemo(() => [
  {
    accessorKey: 'id',
    header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          SO ID
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
    ),
    cell: ({ row }) => (
      <Link href={`/sales/sales-orders/${row.original.id}`} className="font-medium hover:underline">
          {row.getValue('id')}
      </Link>
    ),
  },
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => (
       <Link href={`/sales/sales-orders/${row.original.id}`} className="font-medium hover:underline">
          {row.getValue('title')}
      </Link>
    ),
  },
   {
    accessorKey: 'customer',
    header: 'Customer',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <Badge variant="outline" className={`capitalize border-0 ${statusColors[row.original.status]}`}>{row.original.status}</Badge>,
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
    accessorKey: 'orderDate',
    header: 'Order Date',
    cell: ({ row }) => <div>{row.getValue('orderDate')}</div>,
  },
   {
    accessorKey: 'quotationId',
    header: 'Quotation ID',
    cell: ({ row }) => (
       <Link href={`/sales/quotations/${row.original.quotationId}`} className="font-medium hover:underline text-primary">
          {row.getValue('quotationId')}
      </Link>
    ),
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const salesOrder = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost" }), "h-8 w-8 p-0")}>
            <span className="sr-only">Open menu</span>
            <DotsHorizontalIcon className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem asChild>
                <Link href={`/sales/sales-orders/${salesOrder.id}`}>View Sales Order</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Edit Sales Order</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
                Delete Sales Order
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
], [formatCurrency]);

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
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  return (
    <>
    <Card>
      <CardHeader className="p-2">
        <CardTitle>All Sales Orders</CardTitle>
        <CardDescription>A list of all confirmed sales orders.</CardDescription>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        <div className="w-full">
          <div className="flex items-center justify-between py-2">
            <Input
              placeholder="Filter by title..."
              value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
              onChange={(event) => table.getColumn('title')?.setFilterValue(event.target.value)}
              className="max-w-sm h-8"
            />
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
                    <TableRow key={row.id}>
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
                      No sales orders found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end space-x-2 py-2">
            <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredRowModel().rows.length} row(s)
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
    </>
  );
}
