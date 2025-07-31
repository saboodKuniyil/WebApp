
'use client';

import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

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
import { AddCategoryDialog } from './add-category-dialog';


export type ProductCategory = {
  name: string;
  subcategories: string[];
};

export const columns: ColumnDef<ProductCategory>[] = [
  {
    accessorKey: 'name',
    header: 'Category Name',
    cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
  },
  {
    accessorKey: 'subcategories',
    header: 'Subcategories',
    cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
            {(row.getValue('subcategories') as string[]).map((sub) => (
                <Badge key={sub} variant="secondary">{sub}</Badge>
            ))}
      </div>
    ),
  },
];

interface ProductPreferencesProps {
  data: ProductCategory[];
}

export function ProductPreferences({ data }: ProductPreferencesProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Card>
        <CardHeader className="p-2">
            <CardTitle>Categories</CardTitle>
            <CardDescription>Manage your product categories and subcategories.</CardDescription>
        </CardHeader>
        <CardContent className="p-2 pt-0">
            <div className="w-full">
            <div className="flex items-center justify-end py-2">
                <AddCategoryDialog />
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
                        No categories found.
                        </TableCell>
                    </TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
            </div>
        </CardContent>
    </Card>
  );
}
