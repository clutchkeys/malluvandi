'use server';

/**
 * @fileOverview Summarizes car details for EmployeeB to quickly understand key features and condition.
 *
 * - summarizeCarDetails - A function that summarizes car details.
 * - SummarizeCarDetailsInput - The input type for the summarizeCarDetails function.
 * - SummarizeCarDetailsOutput - The return type for the summarizeCarDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeCarDetailsInputSchema = z.object({
  brand: z.string().describe('The brand of the car.'),
  model: z.string().describe('The model of the car.'),
  year: z.number().describe('The manufacturing year of the car.'),
  color: z.string().describe('The color of the car.'),
  kmRun: z.number().describe('The kilometers the car has run.'),
  ownership: z.number().describe('The number of previous owners of the car.'),
  insurance: z.string().describe('The insurance details of the car.'),
  challans: z.string().describe('The challan details of the car.'),
  additionalDetails: z.string().describe('Any additional details about the car.'),
});
export type SummarizeCarDetailsInput = z.infer<typeof SummarizeCarDetailsInputSchema>;

const SummarizeCarDetailsOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the car details.'),
});
export type SummarizeCarDetailsOutput = z.infer<typeof SummarizeCarDetailsOutputSchema>;

export async function summarizeCarDetails(input: SummarizeCarDetailsInput): Promise<SummarizeCarDetailsOutput> {
  return summarizeCarDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeCarDetailsPrompt',
  input: {schema: SummarizeCarDetailsInputSchema},
  output: {schema: SummarizeCarDetailsOutputSchema},
  prompt: `You are an AI assistant helping to summarize car details for sales staff.

  Summarize the following car details in a concise and easy-to-understand manner.

  Brand: {{{brand}}}
  Model: {{{model}}}
  Year: {{{year}}}
  Color: {{{color}}}
  Kilometers Run: {{{kmRun}}}
  Ownership: {{{ownership}}}
  Insurance: {{{insurance}}}
  Challans: {{{challans}}}
  Additional Details: {{{additionalDetails}}}
  `,
});

const summarizeCarDetailsFlow = ai.defineFlow(
  {
    name: 'summarizeCarDetailsFlow',
    inputSchema: SummarizeCarDetailsInputSchema,
    outputSchema: SummarizeCarDetailsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
