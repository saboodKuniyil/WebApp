'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getSalesAnalysis } from '@/app/actions';
import { Lightbulb, TrendingUp } from 'lucide-react';
import type { AnalyzeSalesTrendsOutput } from '@/ai/flows/analyze-sales-trends';

export function SalesAnalysis() {
  const [analysis, setAnalysis] = useState<AnalyzeSalesTrendsOutput | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalysis() {
      try {
        setLoading(true);
        const result = await getSalesAnalysis();
        setAnalysis(result);
      } catch (error) {
        console.error(error);
        setAnalysis({
          summary: 'Failed to load analysis.',
          suggestedStrategies: 'Please try again later.',
        });
      } finally {
        setLoading(false);
      }
    }
    fetchAnalysis();
  }, []);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>AI Sales Analysis</CardTitle>
        <CardDescription>Weekly sales trends and suggestions</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <div className="space-y-6 text-sm">
            <div>
              <h3 className="font-semibold mb-2 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-primary" />
                Trend Summary
              </h3>
              <p className="text-muted-foreground">{analysis?.summary}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 flex items-center">
                <Lightbulb className="h-4 w-4 mr-2 text-accent" />
                Suggested Strategies
              </h3>
              <p className="text-muted-foreground whitespace-pre-line">{analysis?.suggestedStrategies}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
