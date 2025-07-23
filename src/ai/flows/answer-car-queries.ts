'use server';

/**
 * @fileOverview A flow that provides an AI assistant chat box to help answer car-related queries from customers.
 *
 * - answerCarQueries - A function that handles the car query answering process.
 * - AnswerCarQueriesInput - The input type for the answerCarQueries function.
 * - AnswerCarQueriesOutput - The return type for the answerCarQueries function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerCarQueriesInputSchema = z.object({
  carDetails: z.string().describe('The detailed information about the car that the customer is asking about.'),
  customerQuery: z.string().describe('The query from the customer about the car.'),
});
export type AnswerCarQueriesInput = z.infer<typeof AnswerCarQueriesInputSchema>;

const AnswerCarQueriesOutputSchema = z.object({
  answer: z.string().describe('The answer to the customer query, based on the car details.'),
});
export type AnswerCarQueriesOutput = z.infer<typeof AnswerCarQueriesOutputSchema>;

export async function answerCarQueries(input: AnswerCarQueriesInput): Promise<AnswerCarQueriesOutput> {
  return answerCarQueriesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerCarQueriesPrompt',
  input: {schema: AnswerCarQueriesInputSchema},
  output: {schema: AnswerCarQueriesOutputSchema},
  prompt: `You are an AI assistant helping a salesperson answer customer queries. You are an expert on cars, car financing, loans, and taxes in India.

  You have access to the following car details:
  {{{carDetails}}}

  Answer the following customer query based on the car details provided and your general knowledge about car financing and taxes. Be helpful and encouraging.
  
  Customer Query:
  "{{{customerQuery}}}"
  `,
});

const answerCarQueriesFlow = ai.defineFlow(
  {
    name: 'answerCarQueriesFlow',
    inputSchema: AnswerCarQueriesInputSchema,
    outputSchema: AnswerCarQueriesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
