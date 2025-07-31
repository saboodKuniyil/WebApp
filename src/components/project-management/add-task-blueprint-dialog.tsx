
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
import type { BlueprintStatus } from './task-blueprints-list';
import { Slider } from '../ui/slider';
import Draggable from 'react-draggable';

const initialState = { message: '', errors: {} };

function SubmitButton() {
    return <Button type="submit">Create Blueprint</Button>;
}

export function AddTaskBlueprintDialog() {
  const [state, dispatch] = useActionState(createTaskBlueprint, initialState);
  const [isOpen, setIsOpen] = React.useState(false);
  const [nextId, setNextId] = React.useState('');
  const [statuses, setStatuses] = React.useState<BlueprintStatus[]>([
    { name: 'To Do', completionPercentage: 0 },
    { name: 'In Progress', completionPercentage: 50 },
    { name: 'Done', completionPercentage: 100 },
  ]);
  const [newStatusName, setNewStatusName] = React.useState('');
  const nodeRef = React.useRef(null);
  const [mounted, setMounted] = React.useState(false);

  const { toast } = useToast();
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

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
        setStatuses([
            { name: 'To Do', completionPercentage: 0 },
            { name: 'In Progress', completionPercentage: 50 },
            { name: 'Done', completionPercentage: 100 },
        ]);
      }
    }
  }, [state, toast]);

  React.useEffect(() => {
    if (isOpen) {
      getNextTaskBlueprintId().then(setNextId);
    }
  }, [isOpen]);
  
  const handleAddStatus = () => {
    if (newStatusName.trim() && !statuses.some(s => s.name === newStatusName.trim())) {
      setStatuses([...statuses, { name: newStatusName.trim(), completionPercentage: 0 }]);
      setNewStatusName('');
    }
  };

  const handleRemoveStatus = (statusToRemove: string) => {
    setStatuses(statuses.filter(status => status.name !== statusToRemove));
  };
  
  const handleStatusChange = (index: number, field: keyof BlueprintStatus, value: string | number) => {
    const newStatuses = [...statuses];
    (newStatuses[index] as any)[field] = value;
    setStatuses(newStatuses);
  };
  
  if (!mounted) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Blueprint
        </Button>
      </DialogTrigger>
      <Draggable nodeRef={nodeRef} handle=".dialog-header">
        <DialogContent ref={nodeRef} className="sm:max-w-[600px]">
          <DialogHeader className="dialog-header cursor-move">
            <DialogTitle>Add New Task Blueprint</DialogTitle>
            <DialogDescription>
              Define a new set of statuses and their completion percentages.
            </DialogDescription>
          </DialogHeader>
          <form ref={formRef} action={dispatch} className="grid gap-4 py-4">
              <input type="hidden" name="statuses" value={JSON.stringify(statuses)} />
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
                          value={newStatusName}
                          onChange={(e) => setNewStatusName(e.target.value)}
                          placeholder="Add a new status name"
                          onKeyDown={(e) => {
                              if(e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddStatus();
                              }
                          }}
                      />
                      <Button type="button" onClick={handleAddStatus}>Add</Button>
                  </div>
                  <div className="space-y-4">
                      {statuses.map((status, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 border rounded-md">
                              <Input 
                                  value={status.name}
                                  onChange={(e) => handleStatusChange(index, 'name', e.target.value)}
                                  className="flex-1"
                              />
                              <div className="flex items-center gap-2 w-48">
                                  <Slider
                                      value={[status.completionPercentage]}
                                      onValueChange={(val) => handleStatusChange(index, 'completionPercentage', val[0])}
                                      max={100}
                                      step={1}
                                      className="flex-1"
                                  />
                                  <span className="text-sm text-muted-foreground w-12 text-right">{status.completionPercentage}%</span>
                              </div>
                              <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveStatus(status.name)}>
                                  <X className="h-4 w-4" />
                              </Button>
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
      </Draggable>
    </Dialog>
  );
}
