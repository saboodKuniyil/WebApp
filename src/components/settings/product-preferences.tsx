
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
import { Button } from '../ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { EditCategoryDialog } from './edit-category-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { deleteProductCategory } from '@/app/settings/preferences/product-preference/actions';
import { useToast } from '@/hooks/use-toast';
import Draggable from 'react-draggable';


export type Subcategory = {
  name: string;
  abbreviation: string;
};

export type ProductCategory = {
  name: string;
  abbreviation: string;
  subcategories: Subcategory[];
};

interface ProductPreferencesProps {
  data: ProductCategory[];
}

export function ProductPreferences({ data }: ProductPreferencesProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<ProductCategory | null>(null);
  const { toast } = useToast();
  const nodeRef = React.useRef(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleEdit = (category: ProductCategory) => {
    setSelectedCategory(category);
    setIsEditDialogOpen(true);
  };
  
  const handleDelete = (category: ProductCategory) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedCategory) {
      const result = await deleteProductCategory(selectedCategory.name);
       if (result.message.includes('success')) {
        toast({ title: 'Success', description: result.message });
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
      }
      setIsDeleteDialogOpen(false);
      setSelectedCategory(null);
    }
  };
  
  const columns: ColumnDef<ProductCategory>[] = [
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
        header: 'Actions',
        cell: ({ row }) => (
            <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(row.original)}>
                    <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(row.original)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
            </div>
        ),
    }
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  
  if (!mounted) {
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
                    <div className="rounded-md border h-48 animate-pulse bg-muted"></div>
                </div>
            </CardContent>
        </Card>
    )
  }

  return (
    <>
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
      {selectedCategory && (
          <EditCategoryDialog 
              isOpen={isEditDialogOpen}
              setIsOpen={setIsEditDialogOpen}
              category={selectedCategory}
          />
      )}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <Draggable nodeRef={nodeRef} handle=".alert-dialog-header">
          <AlertDialogContent ref={nodeRef}>
              <AlertDialogHeader className="alert-dialog-header cursor-move">
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the 
                  <span className="font-bold"> "{selectedCategory?.name}"</span> category.
                  Products using this category will need to be updated manually.
              </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
                  Delete
              </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
        </Draggable>
      </AlertDialog>
    </>
  );
}
