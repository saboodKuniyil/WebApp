
import { ProfileSettings } from "@/components/settings/profile-settings";
import { getCompanyProfile } from '@/lib/db';
import type { CompanyProfile } from "@/lib/db";

async function fetchCompanyProfile(): Promise<CompanyProfile> {
  return getCompanyProfile();
}

export default async function ProfileSettingsPage() {
  const profile = await fetchCompanyProfile();
  
  return (
    <main className="flex-1 space-y-4 p-2 md:p-4 pt-4">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Profile Settings</h1>
      </div>
      <div className="grid gap-6 lg:grid-cols-1">
        <ProfileSettings profile={profile} />
      </div>
    </main>
  );
}
