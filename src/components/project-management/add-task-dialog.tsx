
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
import { CalendarIcon, PlusCircle } from 'lucide-react';
import { createTask, getNextTaskId } from '@/app/project-management/tasks/actions';
import { useToast } from '@/hooks/use-toast';
import type { Project } from './projects-list';
import type { TaskBlueprint } from './task-blueprints-list';
import { Textarea } from '../ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Slider } from '../ui/slider';


const initialState = { message: '', errors: {} };

function SubmitButton() {
    return <Button type="submit">Create Task</Button>;
}

interface AddTaskDialogProps {
    projects: Project[];
    taskBlueprints: TaskBlueprint[];
    defaultProjectId?: string;
    trigger?: React.ReactNode;
}

export function AddTaskDialog({ projects, taskBlueprints, defaultProjectId, trigger }: AddTaskDialogProps) {
  const [state, dispatch] = useActionState(createTask, initialState);
  const [isOpen, setIsOpen] = React.useState(false);
  const [nextId, setNextId] = React.useState('');
  const [startDate, setStartDate] = React.useState<Date>();
  const [endDate, setEndDate] = React.useState<Date>();
  const [completionPercentage, setCompletionPercentage] = React.useState([0]);
  const [selectedProjectId, setSelectedProjectId] = React.useState<string>(defaultProjectId || '');

  const { toast } = useToast();
  const formRef = React.useRef<HTMLFormElement>(null);
  
  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const selectedBlueprint = taskBlueprints.find(b => b.id === selectedProject?.taskBlueprintId);
  const availableStatuses = selectedBlueprint?.statuses ?? [];

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
        setCompletionPercentage([0]);
        setSelectedProjectId(defaultProjectId || '');
      }
    }
  }, [state, toast, defaultProjectId]);

  React.useEffect(() => {
    if (isOpen) {
      getNextTaskId().then(setNextId);
    }
  }, [isOpen]);

  React.useEffect(() => {
    if(defaultProjectId) {
        setSelectedProjectId(defaultProjectId)
    }
  }, [defaultProjectId]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger ? trigger : (
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Task
            </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new task.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={dispatch} className="grid gap-4 py-4">
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="id" className="text-right">
              Task ID
            </Label>
            <Input id="id" name="id" className="col-span-3" value={nextId} readOnly />
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
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="projectId" className="text-right">
                Project
            </Label>
            <Select name="projectId" value={selectedProjectId} onValueChange={setSelectedProjectId} disabled={!!defaultProjectId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>{project.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {defaultProjectId && <input type="hidden" name="projectId" value={defaultProjectId} />}
            {state.errors?.projectId && (
                <p className="col-span-4 text-red-500 text-xs text-right">{state.errors.projectId[0]}</p>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="assignee" className="text-right">
              Assignee
            </Label>
            <Input id="assignee" name="assignee" className="col-span-3" />
             {state.errors?.assignee && (
              <p className="col-span-4 text-red-500 text-xs text-right">{state.errors.assignee[0]}</p>
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
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select name="status" disabled={!selectedProjectId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder={selectedProjectId ? "Select a status" : "Select a project first"} />
              </SelectTrigger>
              <SelectContent>
                {availableStatuses.map((status) => (
                  <SelectItem key={status} value={status.toLowerCase().replace(/\s/g, '-')}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state.errors?.status && (
                <p className="col-span-4 text-red-500 text-xs text-right">{state.errors.status[0]}</p>
            )}
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="label" className="text-right">
              Label
            </Label>
            <Select name="label">
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a label" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bug">Bug</SelectItem>
                <SelectItem value="feature">Feature</SelectItem>
                <SelectItem value="documentation">Documentation</SelectItem>
              </SelectContent>
            </Select>
            {state.errors?.label && (
                <p className="col-span-4 text-red-500 text-xs text-right">{state.errors.label[0]}</p>
            )}
          </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="priority" className="text-right">
                Priority
                </Label>
                <Select name="priority">
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a priority" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                </SelectContent>
                </Select>
                {state.errors?.priority && (
                    <p className="col-span-4 text-red-500 text-xs text-right">{state.errors.priority[0]}</p>
                )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="completionPercentage" className="text-right">
                  Completion
                </Label>
                <div className="col-span-3 flex items-center gap-4">
                    <Slider
                        name="completionPercentage"
                        defaultValue={[0]}
                        value={completionPercentage}
                        onValueChange={setCompletionPercentage}
                        max={100}
                        step={1}
                        className="flex-1"
                    />
                    <span className="text-sm text-muted-foreground w-12 text-right">{completionPercentage[0]}%</span>
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
