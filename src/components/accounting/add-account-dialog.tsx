
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
import { createAccount, getNextAccountId, accountTypes } from '@/app/accounting/chart-of-accounts/actions';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '../ui/textarea';

const initialState = { message: '', errors: {} };

export function AddAccountDialog() {
  const [state, dispatch] = useActionState(createAccount, initialState);
  const [isOpen, setIsOpen] = React.useState(false);
  const [nextId, setNextId] = React.useState('');
  const [selectedType, setSelectedType] = React.useState('');
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
        setSelectedType('');
      }
    }
  }, [state, toast]);

  React.useEffect(() => {
    if (isOpen && selectedType) {
        const typePrefix = selectedType.substring(0, 3).toUpperCase();
        getNextAccountId(typePrefix).then(setNextId);
    } else {
        setNextId('');
    }
  }, [isOpen, selectedType]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Account
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Account</DialogTitle>
          <DialogDescription>Fill in the details to create a new account.</DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={dispatch} className="grid gap-4 py-4">
          <Input id="id" name="id" type="hidden" value={nextId} />
          
          <div className="space-y-2">
            <Label htmlFor="type">Account Type</Label>
            <Select name="type" onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Select an account type" />
              </SelectTrigger>
              <SelectContent>
                {accountTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state.errors?.type && <p className="text-red-500 text-xs">{state.errors.type[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Account Name</Label>
            <Input id="name" name="name" />
            {state.errors?.name && <p className="text-red-500 text-xs">{state.errors.name[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="id-display">Account Code</Label>
            <Input id="id-display" value={nextId} readOnly className="bg-muted" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" />
          </div>

          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button type="submit" disabled={!nextId}>Create Account</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
