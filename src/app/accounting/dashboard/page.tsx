
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Scale, BookOpen } from "lucide-react";

export default function AccountingDashboardPage() {

    const stats = [
        {
            title: "Total Receivables",
            value: "$12,450.00",
            Icon: DollarSign,
        },
        {
            title: "Total Payables",
            value: "$8,230.50",
            Icon: DollarSign,
        },
        {
            title: "Net Income (YTD)",
            value: "$45,890.75",
            Icon: Scale,
        },
    ];

  return (
    <main className="flex-1 space-y-4 p-2 md:p-4 pt-4">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Accounting Dashboard</h1>
      </div>
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
