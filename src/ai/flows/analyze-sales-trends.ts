// A Genkit flow for analyzing weekly sales data and suggesting strategies.

'use server';

/**
 * @fileOverview Analyzes weekly sales trends and suggests strategies for the upcoming week.
 *
 * - analyzeSalesTrends - A function that analyzes sales trends and suggests strategies.
 * - AnalyzeSalesTrendsInput - The input type for the analyzeSalesTrends function.
 * - AnalyzeSalesTrendsOutput - The return type for the analyzeSalesTrends function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeSalesTrendsInputSchema = z.object({
  weeklySalesData: z
    .array(z.object({
      weekStartDate: z.string().describe('Start date of the week (YYYY-MM-DD).'),
      totalSales: z.number().describe('Total sales for the week.'),
    }))
    .describe('An array of weekly sales data.'),
});
export type AnalyzeSalesTrendsInput = z.infer<typeof AnalyzeSalesTrendsInputSchema>;

const AnalyzeSalesTrendsOutputSchema = z.object({
  summary: z.string().describe('A summary of the weekly sales trends.'),
  suggestedStrategies: z.string().describe('Suggested strategies for the upcoming week to improve sales performance.'),
});
export type AnalyzeSalesTrendsOutput = z.infer<typeof AnalyzeSalesTrendsOutputSchema>;

export async function analyzeSalesTrends(input: AnalyzeSalesTrendsInput): Promise<AnalyzeSalesTrendsOutput> {
  return analyzeSalesTrendsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeSalesTrendsPrompt',
  input: {schema: AnalyzeSalesTrendsInputSchema},
  output: {schema: AnalyzeSalesTrendsOutputSchema},
  prompt: `You are a sales analysis expert. Analyze the provided weekly sales data and suggest strategies for the upcoming week.

Weekly Sales Data:
{{#each weeklySalesData}}
- Week Start Date: {{weekStartDate}}, Total Sales: {{totalSales}}
{{/each}}

Based on this data, provide a summary of the sales trends and suggest strategies for the next week to improve sales performance.`,
});

const analyzeSalesTrendsFlow = ai.defineFlow(
  {
    name: 'analyzeSalesTrendsFlow',
    inputSchema: AnalyzeSalesTrendsInputSchema,
    outputSchema: AnalyzeSalesTrendsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
