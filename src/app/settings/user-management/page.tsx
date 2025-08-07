
import { UsersList } from "@/components/settings/users-list";
import { getUsers as fetchUsers } from '@/lib/db';
import type { User } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

async function getUsers(): Promise<User[]> {
    const users = await fetchUsers();
    return users;
}

export default async function UserManagementPage() {
  const users = await getUsers();

  return (
    <main className="flex-1 space-y-4 p-2 md:p-4 pt-4">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage your organization's users and their roles.</CardDescription>
        </CardHeader>
        <CardContent>
            <UsersList data={users} />
        </CardContent>
      </Card>
    </main>
  );
}
