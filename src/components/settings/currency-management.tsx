
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
import { createCurrency, updateCurrency, deleteCurrency, updateAppSettings } from '@/app/settings/preferences/currency/actions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useModules } from '@/context/modules-context';


export type Currency = {
  name: string;
  code: string;
  symbol: string;
};

interface CurrencyManagementProps {
  data: Currency[];
  defaultCurrency: string;
}

const addInitialState = { message: '', errors: {} };
const editInitialState = { message: '', errors: {} };

function AddCurrencyDialog() {
  const [state, dispatch] = useActionState(createCurrency, addInitialState);
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
          Add Currency
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Currency</DialogTitle>
          <DialogDescription>Define a new currency.</DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={dispatch} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input id="name" name="name" className="col-span-3" />
            {state.errors?.name && <p className="col-span-4 text-red-500 text-xs text-right">{state.errors.name[0]}</p>}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="code" className="text-right">Code</Label>
            <Input id="code" name="code" className="col-span-3" placeholder="e.g., USD" />
            {state.errors?.code && <p className="col-span-4 text-red-500 text-xs text-right">{state.errors.code[0]}</p>}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="symbol" className="text-right">Symbol</Label>
            <Input id="symbol" name="symbol" className="col-span-3" placeholder="e.g., $" />
            {state.errors?.symbol && <p className="col-span-4 text-red-500 text-xs text-right">{state.errors.symbol[0]}</p>}
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button type="submit">Create Currency</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditCurrencyDialog({ isOpen, setIsOpen, currency }: { isOpen: boolean, setIsOpen: (open: boolean) => void, currency: Currency }) {
  const [state, dispatch] = useActionState(updateCurrency, editInitialState);
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
          <DialogTitle>Edit Currency</DialogTitle>
          <DialogDescription>Update the currency details.</DialogDescription>
        </DialogHeader>
        <form action={dispatch} className="grid gap-4 py-4">
          <input type="hidden" name="originalCode" value={currency.code} />
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input id="name" name="name" defaultValue={currency.name} className="col-span-3" />
            {state.errors?.name && <p className="col-span-4 text-red-500 text-xs text-right">{state.errors.name[0]}</p>}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="code" className="text-right">Code</Label>
            <Input id="code" name="code" defaultValue={currency.code} className="col-span-3" />
            {state.errors?.code && <p className="col-span-4 text-red-500 text-xs text-right">{state.errors.code[0]}</p>}
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="symbol" className="text-right">Symbol</Label>
            <Input id="symbol" name="symbol" defaultValue={currency.symbol} className="col-span-3" />
            {state.errors?.symbol && <p className="col-span-4 text-red-500 text-xs text-right">{state.errors.symbol[0]}</p>}
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

export function CurrencyManagement({ data, defaultCurrency }: CurrencyManagementProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [selectedCurrency, setSelectedCurrency] = React.useState<Currency | null>(null);
  const [selectedDefaultCurrency, setSelectedDefaultCurrency] = React.useState(defaultCurrency);
  const [currentDefault, setCurrentDefault] = React.useState(defaultCurrency);

  const { toast } = useToast();
  const { allCurrencies, setCurrency } = useModules();

  const handleEdit = (currency: Currency) => {
    setSelectedCurrency(currency);
    setIsEditDialogOpen(true);
  };
  
  const handleDelete = (currency: Currency) => {
    setSelectedCurrency(currency);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedCurrency) {
      if (selectedCurrency.code === currentDefault) {
        toast({ variant: 'destructive', title: 'Error', description: 'Cannot delete the default currency.' });
        setIsDeleteDialogOpen(false);
        return;
      }
      const result = await deleteCurrency(selectedCurrency.code);
      if (result.message.includes('success')) {
        toast({ title: 'Success', description: result.message });
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
      }
      setIsDeleteDialogOpen(false);
      setSelectedCurrency(null);
    }
  };

  const handleSetDefaultCurrency = async () => {
    const result = await updateAppSettings({ currency: selectedDefaultCurrency });
    if (result.message.includes('success')) {
      toast({ title: 'Success', description: result.message });
      setCurrentDefault(selectedDefaultCurrency);
      const newDefaultCurrency = allCurrencies.find(c => c.code === selectedDefaultCurrency) || null;
      setCurrency(newDefaultCurrency);
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
  }
  
  const columns: ColumnDef<Currency>[] = [
    {
      accessorKey: 'name',
      header: 'Currency Name',
      cell: ({ row }) => <div className="font-medium">{row.original.name}</div>
    },
    {
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row }) => <div>{row.original.code}</div>
    },
    {
      accessorKey: 'symbol',
      header: 'Symbol',
      cell: ({ row }) => <div className="font-bold">{row.original.symbol}</div>
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
        <CardHeader className="p-4">
            <CardTitle>Default Currency</CardTitle>
            <CardDescription>Select the default currency to be used across the application.</CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="flex items-center gap-2">
            <Select value={selectedDefaultCurrency} onValueChange={setSelectedDefaultCurrency}>
                <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Select a default currency" />
                </SelectTrigger>
                <SelectContent>
                {data.map(currency => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.name} ({currency.symbol})
                    </SelectItem>
                ))}
                </SelectContent>
            </Select>
            <Button onClick={handleSetDefaultCurrency} disabled={selectedDefaultCurrency === currentDefault}>Set Default</Button>
          </div>
        </CardContent>
      </Card>
      <Card>
          <CardHeader className="p-4">
              <CardTitle>Available Currencies</CardTitle>
              <CardDescription>Manage the list of currencies available in the system.</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
              <div className="w-full">
              <div className="flex items-center justify-end py-2">
                  <AddCurrencyDialog />
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
                            No currencies found.
                          </TableCell>
                      </TableRow>
                      )}
                  </TableBody>
                  </Table>
              </div>
              </div>
          </CardContent>
      </Card>
      {selectedCurrency && (
        <EditCurrencyDialog 
          isOpen={isEditDialogOpen}
          setIsOpen={setIsEditDialogOpen}
          currency={selectedCurrency}
        />
      )}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the 
                <span className="font-bold"> "{selectedCurrency?.name}"</span> currency.
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
