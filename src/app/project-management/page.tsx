
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProjectsList } from "@/components/project-management/projects-list";
import { TasksList } from "@/components/project-management/tasks-list";
import { IssuesList } from "@/components/project-management/issues-list";

export default function ProjectManagementPage() {
  return (
    <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Project Management</h1>
      </div>
      
      <Tabs defaultValue="projects" className="space-y-4">
        <TabsList>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
        </TabsList>
        <TabsContent value="projects" className="space-y-4">
          <ProjectsList />
        </TabsContent>
        <TabsContent value="tasks" className="space-y-4">
          <TasksList />
        </TabsContent>
        <TabsContent value="issues" className="space-y-4">
          <IssuesList />
        </TabsContent>
      </Tabs>
    </main>
  );
}
