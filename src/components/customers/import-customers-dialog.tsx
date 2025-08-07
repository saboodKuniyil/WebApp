
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { importCustomersFromCsv } from '@/app/customers/actions';

interface ImportCustomersDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function ImportCustomersDialog({ isOpen, setIsOpen }: ImportCustomersDialogProps) {
  const [isPending, startTransition] = React.useTransition();
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
      toast({
        variant: 'destructive',
        title: 'Invalid File Type',
        description: 'Please select a valid .csv file.',
      });
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast({
        variant: 'destructive',
        title: 'No File Selected',
        description: 'Please select a CSV file to import.',
      });
      return;
    }

    startTransition(async () => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const csvData = e.target?.result as string;
        const result = await importCustomersFromCsv(csvData);

        if (result.message.includes('success')) {
          toast({
            title: 'Success',
            description: result.message,
          });
          setIsOpen(false);
          setSelectedFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } else {
          toast({
            variant: 'destructive',
            title: 'Import Failed',
            description: result.message,
          });
        }
      };
      reader.readAsText(selectedFile);
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import Customers from CSV</DialogTitle>
          <DialogDescription>
            Select a CSV file to import. The file should contain columns: name, email, phone, address, status.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="csv-file" className="text-right">
              CSV File
            </Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleImport} disabled={isPending || !selectedFile}>
            {isPending ? 'Importing...' : 'Import Customers'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
