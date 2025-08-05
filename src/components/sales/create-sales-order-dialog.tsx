

'use client';

import * as React from 'react';
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
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlusCircle, ShoppingBag } from 'lucide-react';
import { createSalesOrderFromQuotation } from '@/app/sales/sales-orders/actions';
import { useToast } from '@/hooks/use-toast';
import type { Quotation } from './quotations-list';
import { useRouter } from 'next/navigation';

const initialState = { salesOrderId: undefined, message: '' };

function SubmitButton() {
    return <Button type="submit"><ShoppingBag className="mr-2 h-4 w-4" />Create Sales Order</Button>;
}

interface CreateSalesOrderDialogProps {
    quotations: Quotation[];
}

export function CreateSalesOrderDialog({ quotations }: CreateSalesOrderDialogProps) {
  const [state, dispatch] = useActionState(createSalesOrderFromQuotation, initialState);
  const [isOpen, setIsOpen] = React.useState(false);
  const { toast } = useToast();
  const formRef = React.useRef<HTMLFormElement>(null);
  const router = useRouter();

  const approvedQuotations = React.useMemo(() => {
    return quotations.filter(q => q.status === 'approved');
  }, [quotations]);


  React.useEffect(() => {
    if(state.message) {
        if(state.salesOrderId) {
            toast({
                title: 'Success',
                description: state.message,
            });
            setIsOpen(false);
            formRef.current?.reset();
            router.push(`/sales/sales-orders`); // Or refresh the current page
        } else {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: state.message,
            });
        }
    }
  }, [state, toast, router]);
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Sales Order
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Sales Order from Quotation</DialogTitle>
          <DialogDescription>
            Select an approved quotation to generate a sales order from.
          </DialogDescription>
        </DialogHeader>
        <form 
            ref={formRef} 
            action={(formData) => {
                const quotationId = formData.get('quotationId') as string;
                if(quotationId) {
                    dispatch(quotationId);
                } else {
                    toast({variant: 'destructive', title: 'Error', description: 'Please select a quotation.'});
                }
            }} 
            className="grid gap-4 py-4"
        >
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quotationId" className="text-right">
              Quotation
            </Label>
             <Select name="quotationId">
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select an approved quotation" />
              </SelectTrigger>
              <SelectContent>
                {approvedQuotations.length > 0 ? (
                    approvedQuotations.map((q) => (
                        <SelectItem key={q.id} value={q.id}>{q.title} ({q.id})</SelectItem>
                    ))
                ) : (
                    <div className="text-center text-sm text-muted-foreground p-4">No approved quotations available.</div>
                )}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
