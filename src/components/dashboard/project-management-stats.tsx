
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, CheckSquare, AlertTriangle } from "lucide-react";
import { getProjects, getTasks, getIssues } from "@/lib/db";
import Link from 'next/link';
import { Skeleton } from '../ui/skeleton';

type Stats = {
    activeProjects: number;
    tasksCompleted: number;
    openIssues: number;
};

export function ProjectManagementStats() {
    const [stats, setStats] = React.useState<Stats | null>(null);

    React.useEffect(() => {
        async function fetchStats() {
            const [projects, tasks, issues] = await Promise.all([
                getProjects(),
                getTasks(),
                getIssues(),
            ]);

            const activeProjects = projects.filter(p => p.status === 'in-progress').length;
            const tasksCompleted = tasks.filter(t => t.status === 'done').length;
            const openIssues = issues.filter(i => i.status === 'open').length;

            setStats({ activeProjects, tasksCompleted, openIssues });
        }
        fetchStats();
    }, []);

    const statCards = [
        {
            title: "Active Projects",
            value: stats?.activeProjects,
            Icon: Briefcase,
            href: "/project-management/projects"
        },
        {
            title: "Tasks Completed",
            value: stats?.tasksCompleted,
            Icon: CheckSquare,
            href: "/project-management/tasks"
        },
        {
            title: "Open Issues",
            value: stats?.openIssues,
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
                            {stats === null ? (
                                <Skeleton className="h-7 w-12" />
                            ) : (
                                <div className="text-2xl font-bold">{stat.value}</div>
                            )}
                        </CardContent>
                    </Link>
                </Card>
            ))}
        </>
    );
}
