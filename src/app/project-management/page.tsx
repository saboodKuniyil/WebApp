
import { TaskSummary } from '@/components/project-management/task-summary';
import { ProjectProgress } from '@/components/project-management/project-progress';
import { TeamActivity } from '@/components/project-management/team-activity';


export default function ProjectManagementPage() {
  return (
    <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Project Management</h1>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <TaskSummary />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <ProjectProgress />
        </div>
        <div className="lg:col-span-3">
          <TeamActivity />
        </div>
      </div>
    </main>
  );
}
