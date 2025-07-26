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
  year: z.number().optional().describe('The manufacturing year of the car.'),
  color: z.string().optional().describe('The color of the car.'),
  kmRun: z.number().optional().describe('The kilometers the car has run.'),
  ownership: z.number().optional().describe('The number of previous owners of the car.'),
  insurance: z.string().optional().describe('The insurance details of the car.'),
  challans: z.string().optional().describe('The challan details of the car.'),
  additionalDetails: z.string().optional().describe('Any additional details about the car.'),
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

  Summarize the following car details in a concise and easy-to-understand manner. Only include details that are provided.

  Brand: {{{brand}}}
  Model: {{{model}}}
  {{#if year}}Year: {{{year}}}{{/if}}
  {{#if color}}Color: {{{color}}}{{/if}}
  {{#if kmRun}}Kilometers Run: {{{kmRun}}}{{/if}}
  {{#if ownership}}Ownership: {{{ownership}}}{{/if}}
  {{#if insurance}}Insurance: {{{insurance}}}{{/if}}
  {{#if challans}}Challans: {{{challans}}}{{/if}}
  {{#if additionalDetails}}Additional Details: {{{additionalDetails}}}{{/if}}
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
