
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlusCircle } from 'lucide-react';
import { createCustomerAction, getNextCustomerId } from '@/app/crm/customers/actions';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';

const initialState = { message: '', errors: {} };

export function AddCustomerDialog() {
  const [state, dispatch] = useActionState(createCustomerAction, initialState);
  const [isOpen, setIsOpen] = React.useState(false);
  const [nextId, setNextId] = React.useState('');
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

  React.useEffect(() => {
    if (isOpen) {
      getNextCustomerId().then(setNextId);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
          <DialogDescription>Fill in the details to create a new customer.</DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={dispatch}>
          <ScrollArea className="h-[60vh] pr-4">
            <div className="grid gap-4 py-4">
              <Input id="id" name="id" type="hidden" value={nextId} />
              <div className="space-y-2">
                <Label htmlFor="name">Contact Person Name</Label>
                <Input id="name" name="name" />
                {state.errors?.name && <p className="text-red-500 text-xs">{state.errors.name[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input id="companyName" name="companyName" />
                {state.errors?.companyName && <p className="text-red-500 text-xs">{state.errors.companyName[0]}</p>}
              </div>
               <div className="space-y-2">
                <Label htmlFor="trnNumber">TRN Number</Label>
                <Input id="trnNumber" name="trnNumber" />
                {state.errors?.trnNumber && <p className="text-red-500 text-xs">{state.errors.trnNumber[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" />
                {state.errors?.email && <p className="text-red-500 text-xs">{state.errors.email[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" type="tel" />
                {state.errors?.phone && <p className="text-red-500 text-xs">{state.errors.phone[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" name="address" />
                {state.errors?.address && <p className="text-red-500 text-xs">{state.errors.address[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue="active">
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                 {state.errors?.status && <p className="text-red-500 text-xs">{state.errors.status[0]}</p>}
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="mt-4">
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button type="submit">Create Customer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
