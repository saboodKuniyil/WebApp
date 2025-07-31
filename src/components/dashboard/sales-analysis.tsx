'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lightbulb, TrendingUp } from 'lucide-react';

export function SalesAnalysis() {
  const analysis = {
    summary: 'Sales have shown a consistent upward trend over the past month, with a notable peak in the third week.',
    suggestedStrategies: 'Capitalize on the current momentum by launching a targeted marketing campaign. Offer a limited-time discount to new customers to further boost sales.',
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>AI Sales Analysis</CardTitle>
        <CardDescription>Weekly sales trends and suggestions</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-6 text-sm">
          <div>
            <h3 className="font-semibold mb-2 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-primary" />
              Trend Summary
            </h3>
            <p className="text-muted-foreground">{analysis.summary}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2 flex items-center">
              <Lightbulb className="h-4 w-4 mr-2 text-accent" />
              Suggested Strategies
            </h3>
            <p className="text-muted-foreground whitespace-pre-line">{analysis.suggestedStrategies}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
