
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Users, Truck } from "lucide-react";
import type { Product } from "@/components/purchase/products-list";
import Link from 'next/link';

interface PurchaseStatsProps {
    products: Product[];
}

export function PurchaseStats({ products }: PurchaseStatsProps) {
    const totalProducts = products.length;
    // Mock data for vendors and orders until implemented
    const totalVendors = 15;
    const pendingOrders = 3;
    
    const statCards = [
        {
            title: "Total Products",
            value: totalProducts,
            Icon: Package,
            href: "/purchase/products"
        },
        {
            title: "Total Vendors",
            value: totalVendors,
            Icon: Users,
            href: "/purchase/vendors"
        },
        {
            title: "Pending Orders",
            value: pendingOrders,
            Icon: Truck,
            href: "/purchase/orders"
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
