
import { RolesList } from "@/components/settings/roles-list";
import { getUserRoles } from '@/lib/db';
import type { UserRole } from "@/lib/db";

async function getRoles(): Promise<UserRole[]> {
    const roles = await getUserRoles();
    return roles;
}

export default async function RolesPage() {
  const roles = await getRoles();

  return (
    <main className="flex-1 space-y-4 p-2 md:p-4 pt-4">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Roles &amp; Permissions</h1>
      </div>
      <RolesList data={roles} />
    </main>
  );
}
