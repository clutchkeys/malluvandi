
'use server';

/**
 * @fileOverview A general-purpose AI assistant for the public website.
 *
 * - publicChat - A function that handles general user queries.
 * - PublicChatInput - The input type for the publicChat function.
 * - PublicChatOutput - The return type for the publicChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import type { Car } from '@/lib/types';


const PublicChatInputSchema = z.object({
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).optional(),
  message: z.string().describe('The latest message from the user.'),
});
export type PublicChatInput = z.infer<typeof PublicChatInputSchema>;

const PublicChatOutputSchema = z.object({
  reply: z.string().describe('The AI assistant\'s reply.'),
});
export type PublicChatOutput = z.infer<typeof PublicChatOutputSchema>;

export async function publicChat(input: PublicChatInput): Promise<PublicChatOutput> {
  return publicChatFlow(input);
}

// 1. Define a tool for the AI to get car models from inventory
const getAvailableCarModels = ai.defineTool(
    {
        name: 'getAvailableCarModels',
        description: 'Returns a list of unique car models currently in the dealership inventory.',
        inputSchema: z.object({}),
        outputSchema: z.array(z.string()),
    },
    async () => {
        const carsRef = collection(db, 'cars');
        const q = query(carsRef, where('status', '==', 'approved'));
        const querySnapshot = await getDocs(q);
        const cars = querySnapshot.docs.map(doc => doc.data() as Car);
        const uniqueModels = [...new Set(cars.map(car => `${car.brand} ${car.model}`))];
        return uniqueModels;
    }
);


const systemPrompt = `You are a friendly, enthusiastic, and helpful AI sales assistant for "Mallu Vandi", a premier used car dealership in Kerala, India. Your primary goal is to engage customers, help them find their perfect vehicle, and encourage them to take the next step (like inquiring or visiting).

- **Your Identity:** You are the Mallu Vandi AI assistant.
- **Tone:** Be conversational, persuasive, friendly, and professional. Use encouraging and positive language. Create excitement about finding a new car!
- **Inventory Knowledge:** When a user asks what cars you have, or asks for a list of available cars, you MUST use the 'getAvailableCarModels' tool to see the current inventory. Present these options to the user.
- **Boundaries:** Do NOT invent car or bike listings. If asked for a specific car not in your tool's output, inform the user it's not currently available but suggest they check back soon or look at similar available models. If asked for contact details, guide them to the Contact page.
- **Be Concise:** Keep your answers clear and to the point, but warm and engaging.

Example Interaction:
User: What cars do you have?
AI: (Uses getAvailableCarModels tool) We have a great selection right now, including the sporty Maruti Suzuki Swift, the family-friendly Hyundai Creta, and the rugged Mahindra Thar! What kind of driving do you usually do? I can help you pick the perfect one!
`;

const publicChatFlow = ai.defineFlow(
  {
    name: 'publicChatFlow',
    inputSchema: PublicChatInputSchema,
    outputSchema: PublicChatOutputSchema,
  },
  async (input) => {
    const { history, message } = input;

    const response = await ai.generate({
        system: systemPrompt,
        history: history || [],
        prompt: message,
        tools: [getAvailableCarModels] // 2. Make the tool available to the AI
    });
    
    return { reply: response.text };
  }
);
