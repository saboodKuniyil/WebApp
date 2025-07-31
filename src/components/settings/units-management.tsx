
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Edit, Trash2, PlusCircle } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { useActionState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createUnit, updateUnit, deleteUnit } from '@/app/settings/preferences/units/actions';

export type Unit = {
  name: string;
  abbreviation: string;
};

interface UnitsManagementProps {
  data: Unit[];
}

const addInitialState = { message: '', errors: {} };
const editInitialState = { message: '', errors: {} };

function AddUnitDialog() {
  const [state, dispatch] = useActionState(createUnit, addInitialState);
  const [isOpen, setIsOpen] = React.useState(false);
  const { toast } = useToast();
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    if (state.message) {
      if (state.errors && Object.keys(state.errors).length > 0) {
        toast({ variant: 'destructive', title: 'Error', description: state.message });
      } else {
        toast({ title: 'Success', description: state.message });
        setIsOpen(false);
        formRef.current?.reset();
      }
    }
  }, [state, toast]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Unit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Unit</DialogTitle>
          <DialogDescription>Define a new unit of measurement.</DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={dispatch} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input id="name" name="name" className="col-span-3" />
            {state.errors?.name && <p className="col-span-4 text-red-500 text-xs text-right">{state.errors.name[0]}</p>}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="abbreviation" className="text-right">Abbreviation</Label>
            <Input id="abbreviation" name="abbreviation" className="col-span-3" />
            {state.errors?.abbreviation && <p className="col-span-4 text-red-500 text-xs text-right">{state.errors.abbreviation[0]}</p>}
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button type="submit">Create Unit</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditUnitDialog({ isOpen, setIsOpen, unit }: { isOpen: boolean, setIsOpen: (open: boolean) => void, unit: Unit }) {
  const [state, dispatch] = useActionState(updateUnit, editInitialState);
  const { toast } = useToast();
  
  React.useEffect(() => {
    if (state.message) {
      if (state.errors && Object.keys(state.errors).length > 0) {
        toast({ variant: 'destructive', title: 'Error', description: state.message });
      } else {
        toast({ title: 'Success', description: state.message });
        setIsOpen(false);
      }
    }
  }, [state, toast, setIsOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Unit</DialogTitle>
          <DialogDescription>Update the unit details.</DialogDescription>
        </DialogHeader>
        <form action={dispatch} className="grid gap-4 py-4">
          <input type="hidden" name="originalName" value={unit.name} />
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input id="name" name="name" defaultValue={unit.name} className="col-span-3" />
            {state.errors?.name && <p className="col-span-4 text-red-500 text-xs text-right">{state.errors.name[0]}</p>}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="abbreviation" className="text-right">Abbreviation</Label>
            <Input id="abbreviation" name="abbreviation" defaultValue={unit.abbreviation} className="col-span-3" />
            {state.errors?.abbreviation && <p className="col-span-4 text-red-500 text-xs text-right">{state.errors.abbreviation[0]}</p>}
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function UnitsManagement({ data }: UnitsManagementProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [selectedUnit, setSelectedUnit] = React.useState<Unit | null>(null);
  const { toast } = useToast();

  const handleEdit = (unit: Unit) => {
    setSelectedUnit(unit);
    setIsEditDialogOpen(true);
  };
  
  const handleDelete = (unit: Unit) => {
    setSelectedUnit(unit);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedUnit) {
      const result = await deleteUnit(selectedUnit.name);
      if (result.message.includes('success')) {
        toast({ title: 'Success', description: result.message });
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
      }
      setIsDeleteDialogOpen(false);
      setSelectedUnit(null);
    }
  };
  
  const columns: ColumnDef<Unit>[] = [
    {
      accessorKey: 'name',
      header: 'Unit Name',
      cell: ({ row }) => <div className="font-medium">{row.original.name}</div>
    },
    {
      accessorKey: 'abbreviation',
      header: 'Abbreviation',
      cell: ({ row }) => <div>{row.original.abbreviation}</div>
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
  
  return (
    <>
      <Card>
          <CardHeader className="p-2">
              <CardTitle>Units</CardTitle>
              <CardDescription>Manage your units of measurement.</CardDescription>
          </CardHeader>
          <CardContent className="p-2 pt-0">
              <div className="w-full">
              <div className="flex items-center justify-end py-2">
                  <AddUnitDialog />
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
                            No units found.
                          </TableCell>
                      </TableRow>
                      )}
                  </TableBody>
                  </Table>
              </div>
              </div>
          </CardContent>
      </Card>
      {selectedUnit && (
        <EditUnitDialog 
          isOpen={isEditDialogOpen}
          setIsOpen={setIsEditDialogOpen}
          unit={selectedUnit}
        />
      )}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the 
                <span className="font-bold"> "{selectedUnit?.name}"</span> unit.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
                Delete
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
