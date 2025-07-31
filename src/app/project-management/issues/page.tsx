
import { IssuesList } from "@/components/project-management/issues-list";

export default function IssuesPage() {
  return (
    <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Issues</h1>
      </div>
      <IssuesList />
    </main>
  );
}
