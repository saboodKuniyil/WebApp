
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, CheckSquare, AlertTriangle } from "lucide-react";
import type { Project } from "@/components/project-management/projects-list";
import type { Task } from "@/components/project-management/tasks-list";
import type { Issue } from "@/components/project-management/issues-list";
import Link from 'next/link';

interface ProjectManagementStatsProps {
    projects: Project[];
    tasks: Task[];
    issues: Issue[];
}

export function ProjectManagementStats({ projects, tasks, issues }: ProjectManagementStatsProps) {
    const activeProjects = projects.filter(p => p.status === 'in-progress').length;
    const tasksCompleted = tasks.filter(t => t.status === 'done').length;
    const openIssues = issues.filter(i => i.status === 'open').length;

    const statCards = [
        {
            title: "Active Projects",
            value: activeProjects,
            Icon: Briefcase,
            href: "/project-management/projects"
        },
        {
            title: "Tasks Completed",
            value: tasksCompleted,
            Icon: CheckSquare,
            href: "/project-management/tasks"
        },
        {
            title: "Open Issues",
            value: openIssues,
            Icon: AlertTriangle,
            href: "/project-management/issues"
        },
    ];

    return (
        <>
            {statCards.map((stat) => (
                <Card key={stat.title} className="hover:shadow-lg transition-shadow duration-300">
                    <Link href={stat.href}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                            <stat.Icon className={`h-4 w-4 text-muted-foreground`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                        </CardContent>
                    </Link>
                </Card>
            ))}
        </>
    );
}
