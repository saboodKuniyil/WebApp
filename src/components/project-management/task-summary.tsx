
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListTodo, Loader, CheckCircle } from "lucide-react";

export function TaskSummary() {
    const stats = [
        {
            title: "To Do",
            count: "58",
            description: "10 tasks were added this week",
            Icon: ListTodo,
            color: "text-blue-500",
        },
        {
            title: "In Progress",
            count: "24",
            description: "3 tasks moved to in-progress",
            Icon: Loader,
            color: "text-yellow-500",
        },
        {
            title: "Done",
            count: "120",
            description: "15 tasks completed this week",
            Icon: CheckCircle,
            color: "text-green-500",
        },
    ];

    return (
        <>
            {stats.map((stat) => (
                <Card key={stat.title} className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        <stat.Icon className={`h-4 w-4 text-muted-foreground ${stat.color}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stat.count}</div>
                        <p className="text-xs text-muted-foreground">{stat.description}</p>
                    </CardContent>
                </Card>
            ))}
        </>
    );
}
