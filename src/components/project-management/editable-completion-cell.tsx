
'use client';

import * as React from 'react';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { updateTaskCompletion } from '@/app/project-management/tasks/actions';
import type { Task } from './tasks-list';

interface EditableCompletionCellProps {
  task: Task;
}

export function EditableCompletionCell({ task }: EditableCompletionCellProps) {
  const { toast } = useToast();
  const [completion, setCompletion] = React.useState(task.completionPercentage ?? 0);
  const [isPending, startTransition] = React.useTransition();

  const handleCompletionChange = (value: number[]) => {
    const newCompletion = value[0];
    setCompletion(newCompletion);

    startTransition(async () => {
      const result = await updateTaskCompletion(task.id, newCompletion);
      if (!result.success) {
        toast({
          variant: 'destructive',
          title: 'Error updating task',
          description: result.message,
        });
        // Revert to original value on error
        setCompletion(task.completionPercentage ?? 0);
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Slider
        value={[completion]}
        onValueChange={handleCompletionChange}
        max={100}
        step={1}
        className="w-24"
        disabled={isPending}
      />
      <span className="text-sm text-muted-foreground w-10 text-right">
        {completion}%
      </span>
    </div>
  );
}
