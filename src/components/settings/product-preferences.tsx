
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryActions } from './category-actions';


export type Subcategory = {
  name: string;
  abbreviation: string;
};

export type ProductCategory = {
  name: string;
  abbreviation: string;
  productType: string;
  subcategories: Subcategory[];
};

interface ProductPreferencesProps {
  data: ProductCategory[];
}

const productTypes = ["Finished Good", "Raw Material", "Service"];


export const columns: ColumnDef<ProductCategory>[] = [
    {
      accessorKey: 'name',
      header: 'Category Name',
      cell: ({ row }) => {
        const category = row.original;
        return <div className="font-medium">{category.name} <span className="text-muted-foreground">({category.abbreviation})</span></div>;
      }
    },
    {
      accessorKey: 'subcategories',
      header: 'Subcategories',
      cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
              {(row.getValue('subcategories') as Subcategory[]).map((sub) => (
                  <Badge key={sub.name} variant="secondary">{sub.name} ({sub.abbreviation})</Badge>
              ))}
        </div>
      ),
    },
    {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
            return <CategoryActions category={row.original} />
        },
    }
  ];

export function ProductPreferences({ data }: ProductPreferencesProps) {

  const tables = productTypes.reduce((acc, type) => {
    acc[type] = useReactTable({
      data: data.filter(d => d.productType === type),
      columns,
      getCoreRowModel: getCoreRowModel(),
    });
    return acc;
  }, {} as Record<string, ReturnType<typeof useReactTable<ProductCategory>>>);
  
  return (
      <Card>
          <CardHeader>
              <CardTitle>Categories</CardTitle>
              <CardDescription>Manage your product categories and subcategories by product type.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={productTypes[0]}>
                <div className="flex justify-between items-center py-2">
                    <TabsList>
                        {productTypes.map((type) => (
                             <TabsTrigger key={type} value={type}>{type}</TabsTrigger>
                        ))}
                    </TabsList>
                    <AddCategoryDialog />
                </div>
                {productTypes.map(type => (
                    <TabsContent key={type} value={type}>
                        <div className="rounded-md border">
                            <Table>
                            <TableHeader>
                                {tables[type].getHeaderGroups().map((headerGroup) => (
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
                                {tables[type].getRowModel().rows?.length ? (
                                tables[type].getRowModel().rows.map((row) => (
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
                                    No categories found for this type.
                                    </TableCell>
                                </TableRow>
                                )}
                            </TableBody>
                            </Table>
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
          </CardContent>
      </Card>
  );
}
    
