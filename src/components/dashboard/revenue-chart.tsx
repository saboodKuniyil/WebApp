
'use client';

import * as React from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';


const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function RevenueChart() {
  const [data, setData] = React.useState<any[] | null>(null);

  React.useEffect(() => {
    // Generate data on the client side to avoid hydration mismatch
    const chartData = months.map(month => ({
      name: month,
      total: Math.floor(Math.random() * 5000) + 1000
    }));
    setData(chartData);
  }, []);


  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
        <CardDescription>A summary of your revenue for the current year.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          {data ? (
            <BarChart data={data}>
              <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
              <Tooltip
                  contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      borderColor: 'hsl(var(--border))',
                  }}
              />
              <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <Skeleton className="w-full h-full" />
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
