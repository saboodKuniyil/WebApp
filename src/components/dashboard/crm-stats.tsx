
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Briefcase } from "lucide-react";
import Link from "next/link";
import { Skeleton } from '../ui/skeleton';

type Stats = {
    todaysAppointments: number;
    newLeads: number;
    activeDeals: number;
};

export function CrmStats() {
    const [stats, setStats] = React.useState<Stats | null>(null);

    React.useEffect(() => {
        // Mock data fetching - in a real app, these would hit a database
        async function fetchStats() {
            const todaysAppointments = 5;
            const newLeads = 12;
            const activeDeals = 8;
            setStats({ todaysAppointments, newLeads, activeDeals });
        }
        fetchStats();
    }, []);
    
    const statCards = [
        {
            title: "Today's Appointments",
            value: stats?.todaysAppointments,
            Icon: Calendar,
            href: "/crm/calendar"
        },
        {
            title: "New Leads (this week)",
            value: stats?.newLeads,
            Icon: Users,
            href: "/crm/leads"
        },
        {
            title: "Active Deals",
            value: stats?.activeDeals,
            Icon: Briefcase,
            href: "/crm/deals"
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
