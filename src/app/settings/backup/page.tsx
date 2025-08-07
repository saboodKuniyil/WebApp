
import { BackupSettings } from "@/components/settings/backup-settings";

export default function BackupPage() {
  return (
    <main className="flex-1 space-y-4 p-2 md:p-4 pt-4">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Backup & Restore</h1>
      </div>
      <div className="grid gap-6 lg:grid-cols-1">
        <BackupSettings />
      </div>
    </main>
  );
}
