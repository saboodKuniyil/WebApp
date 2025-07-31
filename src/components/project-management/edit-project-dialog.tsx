
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
import { CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { updateProject } from '@/app/project-management/projects/actions';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '../ui/textarea';
import type { Project } from './projects-list';
import type { TaskBlueprint } from './task-blueprints-list';

const initialState = { message: '', errors: {} };

// Mock customers - in a real app, this would come from an API
const customers = [
    { id: 'CUST-001', name: 'Innovate Inc.' },
    { id: 'CUST-002', name: 'Quantum Solutions' },
    { id: 'CUST-003', name: 'Synergy Corp' },
    { id: 'CUST-004', name: 'Apex Logistics' },
];

function SubmitButton() {
    return <Button type="submit">Save Changes</Button>;
}

interface EditProjectDialogProps {
  project: Project;
  taskBlueprints: TaskBlueprint[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function EditProjectDialog({ project, taskBlueprints, isOpen, setIsOpen }: EditProjectDialogProps) {
  const [state, dispatch] = useActionState(updateProject, initialState);
  const [startDate, setStartDate] = React.useState<Date | undefined>(
    project.startDate ? new Date(project.startDate) : undefined
  );
  const [endDate, setEndDate] = React.useState<Date | undefined>(
    project.endDate ? new Date(project.endDate) : undefined
  );

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
      }
    }
  }, [state, toast, setIsOpen]);
  
  // Reset date states when project changes
  React.useEffect(() => {
    setStartDate(project.startDate ? new Date(project.startDate) : undefined);
    setEndDate(project.endDate ? new Date(project.endDate) : undefined);
  }, [project]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>
            Update the project details below.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={dispatch} className="grid gap-4 py-4">
          <input type="hidden" name="id" value={project.id} />
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="id-display" className="text-right">
              Project ID
            </Label>
            <Input id="id-display" className="col-span-3" value={project.id} readOnly disabled />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input id="title" name="title" className="col-span-3" defaultValue={project.title} />
            {state.errors?.title && (
              <p className="col-span-4 text-red-500 text-xs text-right">{state.errors.title[0]}</p>
            )}
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="text-right pt-2">
              Description
            </Label>
            <Textarea id="description" name="description" className="col-span-3" defaultValue={project.description} />
            {state.errors?.description && (
              <p className="col-span-4 text-red-500 text-xs text-right">{state.errors.description[0]}</p>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="manager" className="text-right">
              Manager
            </Label>
            <Input id="manager" name="manager" className="col-span-3" defaultValue={project.manager} />
            {state.errors?.manager && (
              <p className="col-span-4 text-red-500 text-xs text-right">{state.errors.manager[0]}</p>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="customer" className="text-right">
                Customer
            </Label>
            <Select name="customer" defaultValue={project.customer}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.name}>{customer.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state.errors?.customer && (
                <p className="col-span-4 text-red-500 text-xs text-right">{state.errors.customer[0]}</p>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">
              Start Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'col-span-3 justify-start text-left font-normal',
                    !startDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <input type="hidden" name="startDate" value={startDate?.toISOString() ?? ''} />
            {state.errors?.startDate && (
              <p className="col-span-4 text-red-500 text-xs text-right">{state.errors.startDate[0]}</p>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">
              End Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'col-span-3 justify-start text-left font-normal',
                    !endDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <input type="hidden" name="endDate" value={endDate?.toISOString() ?? ''} />
            {state.errors?.endDate && (
              <p className="col-span-4 text-red-500 text-xs text-right">{state.errors.endDate[0]}</p>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select name="status" defaultValue={project.status}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on-hold">On Hold</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
              </SelectContent>
            </Select>
            {state.errors?.status && (
                <p className="col-span-4 text-red-500 text-xs text-right">{state.errors.status[0]}</p>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="taskBlueprintId" className="text-right">
              Task Blueprint
            </Label>
            <Select name="taskBlueprintId" defaultValue={project.taskBlueprintId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a blueprint" />
              </SelectTrigger>
              <SelectContent>
                {taskBlueprints.map((bp) => (
                    <SelectItem key={bp.id} value={bp.id}>{bp.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state.errors?.taskBlueprintId && (
                <p className="col-span-4 text-red-500 text-xs text-right">{state.errors.taskBlueprintId[0]}</p>
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
