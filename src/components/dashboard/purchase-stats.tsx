
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Users, Truck } from "lucide-react";
import { getProducts } from "@/lib/db";
import Link from 'next/link';
import { unstable_noStore as noStore } from 'next/cache';

async function fetchStats() {
    noStore();
    const products = await getProducts();
    const totalProducts = products.length;
    // Mock data for vendors and orders until implemented
    const totalVendors = 15;
    const pendingOrders = 3;

    return { totalProducts, totalVendors, pendingOrders };
}

export async function PurchaseStats() {
    const { totalProducts, totalVendors, pendingOrders } = await fetchStats();
    
    const stats = [
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
