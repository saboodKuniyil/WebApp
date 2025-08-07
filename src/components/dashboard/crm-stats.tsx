
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Briefcase } from "lucide-react";
import Link from "next/link";

type Stats = {
    todaysAppointments: number;
    newLeads: number;
    activeDeals: number;
};

export function CrmStats() {
    // In a real app, this data would be fetched from a database
    // For now, we'll use mock data.
    const stats: Stats = {
        todaysAppointments: 5,
        newLeads: 12,
        activeDeals: 8,
    };
    
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
                            <div className="text-2xl font-bold">{stat.value}</div>
                        </CardContent>
                    </Link>
                </Card>
            ))}
        </>
    );
}
