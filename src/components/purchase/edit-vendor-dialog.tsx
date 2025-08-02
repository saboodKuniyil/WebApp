
'use client';

import * as React from 'react';
import { useActionState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { updateVendorAction } from '@/app/purchase/vendors/actions';
import { useToast } from '@/hooks/use-toast';
import type { Vendor } from '@/lib/db';
import { Textarea } from '../ui/textarea';

const initialState = { message: '', errors: {} };

interface EditVendorDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  vendor: Vendor;
}

export function EditVendorDialog({ isOpen, setIsOpen, vendor }: EditVendorDialogProps) {
  const [state, dispatch] = useActionState(updateVendorAction, initialState);
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
          <DialogTitle>Edit Vendor</DialogTitle>
          <DialogDescription>Update the vendor's details.</DialogDescription>
        </DialogHeader>
        <form action={dispatch} className="grid gap-4 py-4">
          <Input id="id" name="id" type="hidden" value={vendor.id} />
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input id="name" name="name" defaultValue={vendor.name} className="col-span-3" />
            {state.errors?.name && <p className="col-span-4 text-red-500 text-xs text-right">{state.errors.name[0]}</p>}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">Email</Label>
            <Input id="email" name="email" type="email" defaultValue={vendor.email} className="col-span-3" />
            {state.errors?.email && <p className="col-span-4 text-red-500 text-xs text-right">{state.errors.email[0]}</p>}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">Phone</Label>
            <Input id="phone" name="phone" type="tel" defaultValue={vendor.phone} className="col-span-3" />
            {state.errors?.phone && <p className="col-span-4 text-red-500 text-xs text-right">{state.errors.phone[0]}</p>}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="address" className="text-right">Address</Label>
            <Textarea id="address" name="address" defaultValue={vendor.address} className="col-span-3" />
            {state.errors?.address && <p className="col-span-4 text-red-500 text-xs text-right">{state.errors.address[0]}</p>}
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">Status</Label>
            <Select name="status" defaultValue={vendor.status}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            {state.errors?.status && <p className="col-span-4 text-red-500 text-xs text-right">{state.errors.status[0]}</p>}
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
