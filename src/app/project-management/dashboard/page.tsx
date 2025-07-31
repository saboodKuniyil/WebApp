
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, CheckSquare, AlertTriangle, Users } from "lucide-react";

export default function ProjectManagementDashboardPage() {

    const stats = [
        {
            title: "Active Projects",
            value: "12",
            Icon: Briefcase,
        },
        {
            title: "Tasks Completed",
            value: "234",
            Icon: CheckSquare,
        },
        {
            title: "Open Issues",
            value: "15",
            Icon: AlertTriangle,
        },
         {
            title: "Team Members",
            value: "8",
            Icon: Users,
        },
    ];

  return (
    <main className="flex-1 space-y-4 p-2 md:p-4 pt-4">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Project Management Dashboard</h1>
      </div>
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
                <Card key={stat.title} className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        <stat.Icon className={`h-4 w-4 text-muted-foreground`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                    </CardContent>
                </Card>
            ))}
        </div>
    </main>
  );
}
