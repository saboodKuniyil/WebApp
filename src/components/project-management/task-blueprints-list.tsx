
'use client';

import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { AddTaskBlueprintDialog } from './add-task-blueprint-dialog';

export type TaskBlueprint = {
  id: string;
  name: string;
  statuses: string[];
};

export const columns: ColumnDef<TaskBlueprint>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => <div>{row.getValue('id')}</div>,
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
  },
  {
    accessorKey: 'statuses',
    header: 'Statuses',
    cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
            {(row.getValue('statuses') as string[]).map((status) => (
                <Badge key={status} variant="secondary">{status}</Badge>
            ))}
      </div>
    ),
  },
];

interface TaskBlueprintsListProps {
  data: TaskBlueprint[];
}

export function TaskBlueprintsList({ data }: TaskBlueprintsListProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Card>
        <CardHeader className="p-2">
            <CardTitle>Blueprints</CardTitle>
            <CardDescription>A list of all task blueprints in your organization.</CardDescription>
        </CardHeader>
        <CardContent className="p-2 pt-0">
            <div className="w-full">
            <div className="flex items-center justify-end py-2">
                <AddTaskBlueprintDialog />
            </div>
            <div className="rounded-md border">
                <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => {
                        return (
                            <TableHead key={header.id} className="p-2">
                            {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                )}
                            </TableHead>
                        );
                        })}
                    </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                        <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && 'selected'}
                        >
                        {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id} className="p-2">
                            {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                            )}
                            </TableCell>
                        ))}
                        </TableRow>
                    ))
                    ) : (
                    <TableRow>
                        <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                        >
                        No results.
                        </TableCell>
                    </TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
            </div>
        </CardContent>
    </Card>
  );
}
