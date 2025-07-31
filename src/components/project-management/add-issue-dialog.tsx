
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
import { createIssue, getNextIssueId } from '@/app/project-management/issues/actions';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '../ui/textarea';
import type { Task } from './tasks-list';

const initialState = { message: '', errors: {} };

function SubmitButton() {
    return <Button type="submit">Create Issue</Button>;
}

interface AddIssueDialogProps {
    tasks: Task[];
}

export function AddIssueDialog({ tasks }: AddIssueDialogProps) {
  const [state, dispatch] = useActionState(createIssue, initialState);
  const [isOpen, setIsOpen] = React.useState(false);
  const [nextId, setNextId] = React.useState('');

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
      }
    }
  }, [state, toast]);

  React.useEffect(() => {
    if (isOpen) {
      getNextIssueId().then(setNextId);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Issue
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Issue</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new issue.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={dispatch} className="grid gap-4 py-4">
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="id" className="text-right">
              Issue ID
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
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="taskId" className="text-right">
                Related Task
            </Label>
            <Select name="taskId">
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a task" />
              </SelectTrigger>
              <SelectContent>
                {tasks.map((task) => (
                    <SelectItem key={task.id} value={task.id}>{task.id} - {task.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state.errors?.taskId && (
                <p className="col-span-4 text-red-500 text-xs text-right">{state.errors.taskId[0]}</p>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Type
            </Label>
            <Select name="type">
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bug">Bug</SelectItem>
                <SelectItem value="feature-request">Feature Request</SelectItem>
                <SelectItem value="documentation">Documentation</SelectItem>
              </SelectContent>
            </Select>
            {state.errors?.type && (
                <p className="col-span-4 text-red-500 text-xs text-right">{state.errors.type[0]}</p>
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
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            {state.errors?.status && (
                <p className="col-span-4 text-red-500 text-xs text-right">{state.errors.status[0]}</p>
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

