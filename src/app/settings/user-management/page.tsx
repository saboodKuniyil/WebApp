
import { UsersList } from "@/components/settings/users-list";
import { getUsers as fetchUsers } from '@/lib/db';
import type { User } from "@/lib/db";
import { unstable_noStore as noStore } from 'next/cache';

async function getUsers(): Promise<User[]> {
  noStore();
  try {
    const users = await fetchUsers();
    return users;
  } catch (error) {
    console.error('Failed to read database:', error);
    return [];
  }
}

export default async function UserManagementPage() {
  const users = await getUsers();

  return (
    <main className="flex-1 space-y-4 p-2 md:p-4 pt-4">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">User Management</h1>
      </div>
      <UsersList data={users} />
    </main>
  );
}
