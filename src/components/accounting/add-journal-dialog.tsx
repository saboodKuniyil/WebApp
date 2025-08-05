
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
import { CalendarIcon, PlusCircle, Trash2 } from 'lucide-react';
import { createJournal, getNextJournalId } from '@/app/accounting/journals/actions';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '../ui/textarea';
import type { JournalEntry, Account } from '@/lib/db';
import { useModules } from '@/context/modules-context';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';

const initialState = { message: '', errors: {} };

interface AddJournalDialogProps {
  accounts: Account[];
}

export function AddJournalDialog({ accounts }: AddJournalDialogProps) {
  const [state, dispatch] = useActionState(createJournal, initialState);
  const [isOpen, setIsOpen] = React.useState(false);
  const [nextId, setNextId] = React.useState('');
  const [date, setDate] = React.useState<Date>();
  const [entries, setEntries] = React.useState<Partial<JournalEntry>[]>([{}, {}]);
  const [totalDebits, setTotalDebits] = React.useState(0);
  const [totalCredits, setTotalCredits] = React.useState(0);

  const { toast } = useToast();
  const formRef = React.useRef<HTMLFormElement>(null);
  const { currency } = useModules();

  const formatCurrency = React.useCallback((amount: number) => {
    if (!currency) {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.code }).format(amount);
  }, [currency]);

  const resetForm = React.useCallback(() => {
    formRef.current?.reset();
    setDate(undefined);
    setEntries([{}, {}]);
  }, []);

  React.useEffect(() => {
    if (state.message) {
      if (state.errors && Object.keys(state.errors).length > 0) {
        toast({ variant: 'destructive', title: 'Error', description: state.message });
      } else {
        toast({ title: 'Success', description: state.message });
        setIsOpen(false);
        resetForm();
      }
    }
  }, [state, toast, resetForm]);

  React.useEffect(() => {
    if (isOpen) {
      getNextJournalId().then(setNextId);
    }
  }, [isOpen]);

  React.useEffect(() => {
    const debits = entries.reduce((sum, entry) => sum + (entry.debit || 0), 0);
    const credits = entries.reduce((sum, entry) => sum + (entry.credit || 0), 0);
    setTotalDebits(debits);
    setTotalCredits(credits);
  }, [entries]);

  const handleEntryChange = (index: number, field: keyof JournalEntry, value: string | number) => {
    const newEntries = [...entries];
    if (field === 'debit' || field === 'credit') {
        (newEntries[index] as any)[field] = value === '' ? undefined : Number(value);
    } else {
        (newEntries[index] as any)[field] = value;
    }
    setEntries(newEntries);
  };

  const addEntryRow = () => {
    setEntries([...entries, {}]);
  };

  const removeEntryRow = (index: number) => {
    if (entries.length > 2) {
      const newEntries = entries.filter((_, i) => i !== index);
      setEntries(newEntries);
    }
  };

  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Journal
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>New Manual Journal</DialogTitle>
          <DialogDescription>Record transactions that don't fit into other categories.</DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={dispatch}>
          <input type="hidden" name="id" value={nextId} />
          <input type="hidden" name="date" value={date?.toISOString() ?? ''} />
          <input type="hidden" name="entries" value={JSON.stringify(entries)} />
          <ScrollArea className="h-[60vh] pr-4">
          <div className="grid gap-4 py-4">
             <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label>Date</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                            variant={'outline'}
                            className={cn('w-full justify-start text-left font-normal', !date && 'text-muted-foreground')}
                            >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, 'PPP') : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={date} onSelect={setDate} initialFocus /></PopoverContent>
                    </Popover>
                    {state.errors?.date && <p className="text-red-500 text-xs">{state.errors.date[0]}</p>}
                </div>
                 <div className="space-y-2">
                    <Label>Journal ID</Label>
                    <Input value={nextId} readOnly className="bg-muted" />
                </div>
            </div>
             <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea name="notes" placeholder="Describe the purpose of this journal entry..." />
                {state.errors?.notes && <p className="text-red-500 text-xs">{state.errors.notes[0]}</p>}
             </div>
             <div>
                <div className="grid grid-cols-[1fr_120px_120px_40px] gap-2 mb-2 text-sm font-medium">
                    <span>Account</span>
                    <span className="text-right">Debits</span>
                    <span className="text-right">Credits</span>
                    <span></span>
                </div>
                <div className="space-y-2">
                    {entries.map((entry, index) => (
                        <div key={index} className="grid grid-cols-[1fr_120px_120px_40px] gap-2 items-center">
                            <Select value={entry.accountId} onValueChange={(value) => handleEntryChange(index, 'accountId', value)}>
                                <SelectTrigger><SelectValue placeholder="Select Account" /></SelectTrigger>
                                <SelectContent>
                                    {accounts.map(acc => <SelectItem key={acc.id} value={acc.id}>{acc.name} ({acc.id})</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Input type="number" step="0.01" placeholder="0.00" className="text-right" value={entry.debit || ''} onChange={(e) => handleEntryChange(index, 'debit', e.target.value)} />
                            <Input type="number" step="0.01" placeholder="0.00" className="text-right" value={entry.credit || ''} onChange={(e) => handleEntryChange(index, 'credit', e.target.value)} />
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeEntryRow(index)} disabled={entries.length <= 2}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                </div>
                {state.errors?.entries && <p className="text-red-500 text-xs mt-2">{state.errors.entries[0]}</p>}
                <Button type="button" variant="outline" size="sm" onClick={addEntryRow} className="mt-2">Add another line</Button>
             </div>
             <div className="flex justify-end mt-4">
                <div className="w-64 space-y-2 text-sm">
                    <div className="flex justify-between border-t pt-2">
                        <span>Total Debits:</span>
                        <span className="font-mono">{formatCurrency(totalDebits)}</span>
                    </div>
                    <div className="flex justify-between">
                         <span>Total Credits:</span>
                        <span className="font-mono">{formatCurrency(totalCredits)}</span>
                    </div>
                     <div className={cn("flex justify-between border-t pt-2 font-semibold", isBalanced ? 'text-green-600' : 'text-destructive')}>
                        <span>Difference:</span>
                        <span className="font-mono">{formatCurrency(totalDebits - totalCredits)}</span>
                    </div>
                </div>
             </div>
          </div>
          </ScrollArea>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button type="submit" disabled={!isBalanced || totalDebits === 0}>Create Journal</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
