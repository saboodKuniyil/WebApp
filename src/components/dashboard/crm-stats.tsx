
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Briefcase } from "lucide-react";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";

// Mock data functions - in a real app, these would hit a database
async function getTodaysAppointments() {
    noStore();
    return 5;
}

async function getNewLeads() {
    noStore();
    return 12;
}

async function getActiveDeals() {
    noStore();
    return 8;
}

export async function CrmStats() {
    const todaysAppointments = await getTodaysAppointments();
    const newLeads = await getNewLeads();
    const activeDeals = await getActiveDeals();
    
    const stats = [
        {
            title: "Today's Appointments",
            value: todaysAppointments,
            Icon: Calendar,
            href: "/crm/calendar"
        },
        {
            title: "New Leads (this week)",
            value: newLeads,
            Icon: Users,
            href: "/crm/leads"
        },
        {
            title: "Active Deals",
            value: activeDeals,
            Icon: Briefcase,
            href: "/crm/deals"
        },
    ];

    return (
        <>
            {stats.map((stat) => (
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
