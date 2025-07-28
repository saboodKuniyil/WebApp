import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingDown, TrendingUp } from "lucide-react";

export function FinancialStats() {
    const stats = [
        {
            title: "Total Revenue",
            amount: "$45,231.89",
            description: "+20.1% from last month",
            Icon: TrendingUp,
            color: "text-green-500",
        },
        {
            title: "Total Expenses",
            amount: "$12,876.54",
            description: "+15.3% from last month",
            Icon: TrendingDown,
            color: "text-red-500",
        },
        {
            title: "Profit",
            amount: "$32,355.35",
            description: "+22.4% from last month",
            Icon: DollarSign,
            color: "text-primary",
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
                        <div className="text-2xl font-bold">{stat.amount}</div>
                        <p className="text-xs text-muted-foreground">{stat.description}</p>
                    </CardContent>
                </Card>
            ))}
        </>
    );
}
