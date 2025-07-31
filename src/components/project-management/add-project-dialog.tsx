
'use client';

import * as React from 'react';
import { useFormState } from 'react-dom';
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
import { CalendarIcon, PlusCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { createProject } from '@/app/project-management/projects/actions';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '../ui/textarea';


const initialState = { message: '', errors: {} };

function SubmitButton() {
    // Cannot use useFormStatus here as it's not a direct child of the form
    // We can handle pending state manually if needed
    return <Button type="submit">Create Project</Button>;
}

export function AddProjectDialog() {
  const [state, dispatch] = useFormState(createProject, initialState);
  const [isOpen, setIsOpen] = React.useState(false);
  const [startDate, setStartDate] = React.useState<Date>();
  const [endDate, setEndDate] = React.useState<Date>();
  const [projectId, setProjectId] = React.useState('');

  const { toast } = useToast();
  const formRef = React.useRef<HTMLFormElement>(null);

  const generateProjectId = () => {
      const randomPart = Math.floor(Math.random() * 1000) + 9001;
      return `PR_${randomPart}`;
  }

  React.useEffect(() => {
    if (isOpen) {
        setProjectId(generateProjectId());
    }
  }, [isOpen]);


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
        setStartDate(undefined);
        setEndDate(undefined);
      }
    }
  }, [state, toast]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Project</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new project.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={dispatch} className="grid gap-4 py-4">
           <input type="hidden" name="id" value={projectId} />
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="id-display" className="text-right">
              Project ID
            </Label>
            <Input id="id-display" name="id-display" className="col-span-3" value={projectId} readOnly />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input id="title" name="title" className="col-span-3" />
            {state.errors?.title && (
              <p className="col-span-4 text-red-500 text-xs text-right">{state.errors.title[0]}</p>
            )}
          </div>
           <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="text-right pt-2">
              Description
            </Label>
            <Textarea id="description" name="description" className="col-span-3" />
            {state.errors?.description && (
              <p className="col-span-4 text-red-500 text-xs text-right">{state.errors.description[0]}</p>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="manager" className="text-right">
              Manager
            </Label>
            <Input id="manager" name="manager" className="col-span-3" />
             {state.errors?.manager && (
              <p className="col-span-4 text-red-500 text-xs text-right">{state.errors.manager[0]}</p>
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
            <Select name="status">
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
