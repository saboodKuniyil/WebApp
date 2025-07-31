
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
import { PlusCircle, X } from 'lucide-react';
import { createTaskBlueprint, getNextTaskBlueprintId } from '@/app/project-management/task-blueprints/actions';
import { useToast } from '@/hooks/use-toast';

const initialState = { message: '', errors: {} };

function SubmitButton() {
    return <Button type="submit">Create Blueprint</Button>;
}

export function AddTaskBlueprintDialog() {
  const [state, dispatch] = useActionState(createTaskBlueprint, initialState);
  const [isOpen, setIsOpen] = React.useState(false);
  const [nextId, setNextId] = React.useState('');
  const [statuses, setStatuses] = React.useState(['To Do', 'In Progress', 'Done']);
  const [newStatus, setNewStatus] = React.useState('');

  const { toast } = useToast();
  const formRef = React.useRef<HTMLFormElement>(null);

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
        setStatuses(['To Do', 'In Progress', 'Done']);
      }
    }
  }, [state, toast]);

  React.useEffect(() => {
    if (isOpen) {
      getNextTaskBlueprintId().then(setNextId);
    }
  }, [isOpen]);
  
  const handleAddStatus = () => {
    if (newStatus.trim() && !statuses.includes(newStatus.trim())) {
      setStatuses([...statuses, newStatus.trim()]);
      setNewStatus('');
    }
  };

  const handleRemoveStatus = (statusToRemove: string) => {
    setStatuses(statuses.filter(status => status !== statusToRemove));
  };


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Blueprint
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Task Blueprint</DialogTitle>
          <DialogDescription>
            Define a new set of statuses for your tasks.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={dispatch} className="grid gap-4 py-4">
            <input type="hidden" name="statuses" value={statuses.join(',')} />
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="id" className="text-right">
              Blueprint ID
            </Label>
            <Input id="id" name="id" className="col-span-3" value={nextId} readOnly />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" name="name" className="col-span-3" />
            {state.errors?.name && (
              <p className="col-span-4 text-red-500 text-xs text-right">{state.errors.name[0]}</p>
            )}
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">
                Statuses
            </Label>
            <div className="col-span-3 space-y-2">
                <div className="flex gap-2">
                    <Input 
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        placeholder="Add a new status"
                        onKeyDown={(e) => {
                            if(e.key === 'Enter') {
                                e.preventDefault();
                                handleAddStatus();
                            }
                        }}
                    />
                    <Button type="button" onClick={handleAddStatus}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {statuses.map((status) => (
                        <div key={status} className="flex items-center gap-1 bg-secondary text-secondary-foreground rounded-md px-2 py-1 text-sm">
                            {status}
                            <button type="button" onClick={() => handleRemoveStatus(status)} className="text-muted-foreground hover:text-foreground">
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    ))}
                </div>
                 {state.errors?.statuses && (
                    <p className="text-red-500 text-xs">{state.errors.statuses[0]}</p>
                )}
            </div>
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
