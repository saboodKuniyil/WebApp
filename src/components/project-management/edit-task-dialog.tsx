
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
import { updateTask } from '@/app/project-management/tasks/actions';
import { useToast } from '@/hooks/use-toast';
import type { Project } from './projects-list';
import type { Task } from './tasks-list';
import type { TaskBlueprint } from './task-blueprints-list';
import { Textarea } from '../ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { useModules } from '@/context/modules-context';

const initialState = { message: '', errors: {} };

function SubmitButton() {
    return <Button type="submit">Save Changes</Button>;
}

interface EditTaskDialogProps {
    task: Task;
    projects: Project[];
    taskBlueprints: TaskBlueprint[];
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

export function EditTaskDialog({ task, projects, taskBlueprints, isOpen, setIsOpen }: EditTaskDialogProps) {
  const [state, dispatch] = useActionState(updateTask, initialState);
  
  const [startDate, setStartDate] = React.useState<Date | undefined>(
    task.startDate ? parseISO(task.startDate) : undefined
  );
  const [endDate, setEndDate] = React.useState<Date | undefined>(
    task.endDate ? parseISO(task.endDate) : undefined
  );
  const [selectedProjectId, setSelectedProjectId] = React.useState<string>(task.projectId);
  const { currency } = useModules();
  
  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const selectedBlueprint = taskBlueprints.find(b => b.id === selectedProject?.taskBlueprintId);
  const availableStatuses = selectedBlueprint?.statuses ?? [];

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

  React.useEffect(() => {
    setStartDate(task.startDate ? parseISO(task.startDate) : undefined);
    setEndDate(task.endDate ? parseISO(task.endDate) : undefined);
    setSelectedProjectId(task.projectId);
  }, [task]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Update the task details below.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={dispatch} className="grid gap-4 py-4">
          <input type="hidden" name="id" value={task.id} />
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="id-display" className="text-right">
              Task ID
            </Label>
            <Input id="id-display" className="col-span-3" value={task.id} readOnly disabled />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input id="title" name="title" className="col-span-3" defaultValue={task.title} />
            {state.errors?.title && (
              <p className="col-span-4 text-red-500 text-xs text-right">{state.errors.title[0]}</p>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="projectId" className="text-right">
                Project <span className="text-destructive">*</span>
            </Label>
            <Select name="projectId" defaultValue={task.projectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>{project.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state.errors?.projectId && (
                <p className="col-span-4 text-red-500 text-xs text-right">{state.errors.projectId[0]}</p>
            )}
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="text-right pt-2">
              Description
            </Label>
            <Textarea id="description" name="description" className="col-span-3" defaultValue={task.description} />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="budget" className="text-right">
                  Budget ({currency?.symbol})
                </Label>
                <Input id="budget" name="budget" type="number" step="0.01" className="col-span-3" defaultValue={task.budget} />
              </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="assignee" className="text-right">
              Assignee
            </Label>
            <Input id="assignee" name="assignee" className="col-span-3" defaultValue={task.assignee} />
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
            <Select name="status" defaultValue={task.status} disabled={!selectedProjectId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder={selectedProjectId ? "Select a status" : "Select a project first"} />
              </SelectTrigger>
              <SelectContent>
                {availableStatuses.map((status) => (
                  <SelectItem key={status.name} value={status.name.toLowerCase().replace(/\s/g, '-')}>{status.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="label" className="text-right">
              Label
            </Label>
            <Select name="label" defaultValue={task.label}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a label" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bug">Bug</SelectItem>
                <SelectItem value="feature">Feature</SelectItem>
                <SelectItem value="documentation">Documentation</SelectItem>
              </SelectContent>
            </Select>
          </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="priority" className="text-right">
                Priority
                </Label>
                <Select name="priority" defaultValue={task.priority}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a priority" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                </SelectContent>
                </Select>
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
