
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
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import type { UserRole, Permissions } from '@/lib/db';
import { updateUserRole } from '@/app/settings/user-management/roles/actions';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';

const initialState = { message: '', errors: {} };

interface EditRoleDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  role: UserRole;
}

const permissionLabels: Record<keyof Permissions, string> = {
    view_dashboard: 'View Dashboard',
    manage_projects: 'Manage Projects',
    manage_tasks: 'Manage Tasks',
    manage_purchase_module: 'Manage Purchase Module',
    manage_crm_module: 'Manage CRM Module',
    manage_payroll_module: 'Manage Payroll Module',
    manage_settings: 'Manage Settings',
    manage_users: 'Manage Users',
};

export function EditRoleDialog({ isOpen, setIsOpen, role }: EditRoleDialogProps) {
  const [state, dispatch] = useActionState(updateUserRole, initialState);
  const { toast } = useToast();
  const [permissions, setPermissions] = React.useState<Permissions>(role.permissions);

  React.useEffect(() => {
    if (state.message) {
      if (state.errors && Object.keys(state.errors).length > 0) {
        toast({ variant: 'destructive', title: 'Error', description: state.message });
      } else {
        toast({ title: 'Success', description: state.message });
        setIsOpen(false);
      }
    }
  }, [state, toast, setIsOpen]);

  React.useEffect(() => {
    setPermissions(role.permissions);
  }, [role]);

  const handlePermissionChange = (key: keyof Permissions, value: boolean) => {
    setPermissions(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Role</DialogTitle>
          <DialogDescription>Update the role's details and permissions.</DialogDescription>
        </DialogHeader>
        <form action={dispatch} className="space-y-4">
          <input type="hidden" name="id" value={role.id} />
          <input type="hidden" name="permissions" value={JSON.stringify(permissions)} />
          
          <div className="space-y-2">
            <Label htmlFor="name">Role Name</Label>
            <Input id="name" name="name" defaultValue={role.name} />
            {state.errors?.name && <p className="text-red-500 text-xs">{state.errors.name[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" defaultValue={role.description} />
             {state.errors?.description && <p className="text-red-500 text-xs">{state.errors.description[0]}</p>}
          </div>
          
          <div className="space-y-2">
            <Label>Permissions</Label>
            <ScrollArea className="h-48 rounded-md border p-4">
                <div className="space-y-4">
                    {(Object.keys(permissions) as Array<keyof Permissions>).map((key) => (
                        <div key={key} className="flex items-center justify-between">
                            <Label htmlFor={key} className="font-normal">
                                {permissionLabels[key] || key}
                            </Label>
                            <Switch
                                id={key}
                                checked={permissions[key]}
                                onCheckedChange={(checked) => handlePermissionChange(key, checked)}
                            />
                        </div>
                    ))}
                </div>
            </ScrollArea>
          </div>
          
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
