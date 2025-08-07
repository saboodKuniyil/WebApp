
'use client';

import * as React from 'react';
import {
  CaretSortIcon,
  ChevronDownIcon,
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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { AddAccountDialog } from './add-account-dialog';
import type { Account } from '@/lib/db';
import { useModules } from '@/context/modules-context';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface ChartOfAccountsListProps {
  data: Account[];
}

const accountTypes = [
    'Assets', 'Liabilities', 'Equity', 'Income', 'Expense'
];

export function ChartOfAccountsList({ data }: ChartOfAccountsListProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  
  const { currency } = useModules();

  const formatCurrency = React.useCallback((amount: number) => {
    if (!currency) {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.code }).format(amount);
  }, [currency]);

  const columns: ColumnDef<Account>[] = React.useMemo(() => [
    {
      accessorKey: 'id',
      header: 'Code',
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Account Name
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
    },
    {
        accessorKey: 'type',
        header: 'Account Type',
        cell: ({ row }) => <Badge variant="outline">{row.getValue('type')}</Badge>,
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
        }
    },
    {
      accessorKey: 'description',
      header: 'Description',
    },
    {
      accessorKey: 'balance',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="text-right w-full"
        >
          Balance
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="text-right font-mono">{formatCurrency(row.getValue('balance'))}</div>,
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
            <CardTitle>Accounts</CardTitle>
            <CardDescription>A list of all financial accounts in your organization.</CardDescription>
        </CardHeader>
        <CardContent>
             <div className="w-full">
                <div className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-2">
                     <Input
                        placeholder="Filter by account name..."
                        value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
                        onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
                        className="max-w-sm"
                      />
                      <Select
                          value={(table.getColumn('type')?.getFilterValue() as string) ?? ''}
                          onValueChange={(value) =>
                              table.getColumn('type')?.setFilterValue(value === 'all' ? '' : value)
                          }
                      >
                          <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Filter by type" />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="all">All Types</SelectItem>
                              {accountTypes.map((type) => (
                                  <SelectItem key={type} value={type}>
                                      {type}
                                  </SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <AddAccountDialog />
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
                          .map((column) => (
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
                            <TableHead key={header.id}>
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
                              <TableCell key={cell.id}>
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
                <div className="flex items-center justify-end space-x-2 py-4">
                  <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
                  </div>
                  <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                    Next
                  </Button>
                </div>
              </div>
        </CardContent>
    </Card>
   
  );
}
