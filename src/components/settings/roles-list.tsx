
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import type { UserRole } from '@/lib/db';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Edit } from 'lucide-react';
import { EditRoleDialog } from './edit-role-dialog';

interface RolesListProps {
  data: UserRole[];
}

export function RolesList({ data }: RolesListProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [selectedRole, setSelectedRole] = React.useState<UserRole | null>(null);

  const handleEdit = (role: UserRole) => {
    setSelectedRole(role);
    setIsEditDialogOpen(true);
  };
  
  const columns: ColumnDef<UserRole>[] = [
    {
      accessorKey: 'name',
      header: 'Role Name',
      cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => <div className="text-muted-foreground">{row.original.description}</div>,
    },
    {
        accessorKey: 'permissions',
        header: 'Permissions',
        cell: ({ row }) => (
            <div className="flex flex-wrap gap-1">
            {Object.entries(row.original.permissions).map(([key, value]) => (
                value ? <Badge key={key} variant="secondary">{key.replace(/_/g, ' ')}</Badge> : null
            ))}
            </div>
        ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex justify-end">
            <Button variant="ghost" size="icon" onClick={() => handleEdit(row.original)}>
                <Edit className="h-4 w-4" />
            </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
        <Card>
        <CardHeader className="p-4">
            <CardTitle>User Roles</CardTitle>
            <CardDescription>
            Define roles to control what users can see and do within the application.
            </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
            <div className="rounded-md border">
            <Table>
                <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                        {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                            )}
                        </TableHead>
                    ))}
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
                        <TableCell key={cell.id}>
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
                        No roles found.
                    </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
            </div>
        </CardContent>
        </Card>
        {selectedRole && (
            <EditRoleDialog 
                isOpen={isEditDialogOpen}
                setIsOpen={setIsEditDialogOpen}
                role={selectedRole}
            />
        )}
    </>
  );
}
