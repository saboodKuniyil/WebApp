'use server';

import { redirect } from 'next/navigation';
import { analyzeSalesTrends, type AnalyzeSalesTrendsInput } from '@/ai/flows/analyze-sales-trends';

export async function signup(formData: FormData) {
  // In a real app, you'd create a new user in your database.
  // For this example, we'll just log the email and redirect.
  const email = formData.get('email');
  const name = formData.get('name');
  console.log(`New user signing up: ${name} (${email})`);
  redirect('/dashboard');
}

export async function logout() {
  // In a real app, you'd invalidate the user's session here.
  redirect('/');
}

export async function getSalesAnalysis() {
  // In a real application, this data would come from your database.
  const weeklySalesData: AnalyzeSalesTrendsInput['weeklySalesData'] = [
    { weekStartDate: '2024-06-24', totalSales: 12500 },
    { weekStartDate: '2024-07-01', totalSales: 13200 },
    { weekStartDate: '2024-07-08', totalSales: 11800 },
    { weekStartDate: '2024-07-15', totalSales: 14500 },
  ];

  try {
    const analysis = await analyzeSalesTrends({ weeklySalesData });
    return analysis;
  } catch (error) {
    console.error('Error analyzing sales trends:', error);
    // Return a user-friendly error message
    return {
      summary: 'Could not analyze sales data at this time.',
      suggestedStrategies: 'There was an issue connecting to the analysis service. Please try again later.',
    };
  }
}
