
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Users, Truck } from "lucide-react";
import { getProducts } from "@/lib/db";
import Link from 'next/link';
import { Skeleton } from '../ui/skeleton';

type Stats = {
    totalProducts: number;
    totalVendors: number;
    pendingOrders: number;
};

export function PurchaseStats() {
    const [stats, setStats] = React.useState<Stats | null>(null);

    React.useEffect(() => {
        async function fetchStats() {
            const products = await getProducts();
            const totalProducts = products.length;
            // Mock data for vendors and orders until implemented
            const totalVendors = 15;
            const pendingOrders = 3;

            setStats({ totalProducts, totalVendors, pendingOrders });
        }
        fetchStats();
    }, []);
    
    const statCards = [
        {
            title: "Total Products",
            value: stats?.totalProducts,
            Icon: Package,
            href: "/purchase/products"
        },
        {
            title: "Total Vendors",
            value: stats?.totalVendors,
            Icon: Users,
            href: "/purchase/vendors"
        },
        {
            title: "Pending Orders",
            value: stats?.pendingOrders,
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
