
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
import { PlusCircle, FileSignature } from 'lucide-react';
import { createQuotation } from '@/app/sales/quotations/actions';
import { useToast } from '@/hooks/use-toast';
import type { Estimation } from './estimations-list';
import { useRouter } from 'next/navigation';

const initialState = { message: '', errors: {} };

function SubmitButton() {
    return <Button type="submit"><FileSignature className="mr-2 h-4 w-4" />Create Quotation</Button>;
}

interface CreateQuotationDialogProps {
    estimations: Estimation[];
}

export function CreateQuotationDialog({ estimations }: CreateQuotationDialogProps) {
  const [state, dispatch] = useActionState(createQuotation, initialState);
  const [isOpen, setIsOpen] = React.useState(false);
  const { toast } = useToast();
  const formRef = React.useRef<HTMLFormElement>(null);
  const router = useRouter();


  React.useEffect(() => {
    if (state.message) {
      if (state.errors && Object.keys(state.errors).length > 0) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: state.message,
        });
      } else {
        toast({
          title: 'Success',
          description: state.message,
        });
        setIsOpen(false);
        formRef.current?.reset();
        if(state.quotationId) {
            router.push(`/sales/quotations/${state.quotationId}`);
        }
      }
    }
  }, [state, toast, router]);
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Quotation
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Quotation</DialogTitle>
          <DialogDescription>
            Select an estimation to generate a quotation from.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={dispatch} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="estimationId" className="text-right">
              Estimation
            </Label>
             <Select name="estimationId">
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select an estimation" />
              </SelectTrigger>
              <SelectContent>
                {estimations.map((est) => (
                    <SelectItem key={est.id} value={est.id}>{est.title} ({est.id})</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state.errors?.estimationId && (
              <p className="col-span-4 text-red-500 text-xs text-right">{state.errors.estimationId[0]}</p>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
