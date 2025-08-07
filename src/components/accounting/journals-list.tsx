
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
import type { Journal, Account } from '@/lib/db';
import { AddJournalDialog } from './add-journal-dialog';

interface JournalsListProps {
  data: Journal[];
  accounts: Account[];
}

export function JournalsList({ data, accounts }: JournalsListProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const columns: ColumnDef<Journal>[] = React.useMemo(() => [
    {
      accessorKey: 'id',
      header: 'Journal ID',
    },
    {
      accessorKey: 'date',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Date
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
        accessorKey: 'notes',
        header: 'Notes',
    },
    {
        accessorKey: 'entries',
        header: 'Total Amount',
        cell: ({ row }) => {
            const total = row.original.entries.reduce((sum, entry) => sum + (entry.debit || 0), 0);
            return <div>{total.toFixed(2)}</div>
        }
    },
  ], []);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <Card>
        <CardHeader>
            <CardTitle>Journal Entries</CardTitle>
            <CardDescription>A record of all manual journal entries.</CardDescription>
        </CardHeader>
        <CardContent>
             <div className="w-full">
                <div className="flex items-center justify-between py-4">
                     <Input
                        placeholder="Filter by notes..."
                        value={(table.getColumn('notes')?.getFilterValue() as string) ?? ''}
                        onChange={(event) => table.getColumn('notes')?.setFilterValue(event.target.value)}
                        className="max-w-sm"
                      />
                  <div className="flex items-center gap-2">
                    <AddJournalDialog accounts={accounts} />
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
                          <TableRow key={row.id}>
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
