
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
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import type { Car } from '@/lib/types';


const PublicChatInputSchema = z.object({
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).optional(),
  message: z.string().describe('The latest message from the user.'),
});
export type PublicChatInput = z.infer<typeof PublicChatInputSchema>;


const CarSchema = z.object({
    id: z.string(),
    brand: z.string(),
    model: z.string(),
    year: z.number().optional(),
    price: z.number().optional(),
    images: z.array(z.string()),
    kmRun: z.number().optional(),
    fuel: z.string().optional(),
    transmission: z.string().optional(),
});

const PublicChatOutputSchema = z.object({
  reply: z.string().describe("The AI assistant's text reply. This should be a friendly and helpful message, acknowledging the user's query and mentioning that the requested car listings are being displayed."),
  cars: z.array(CarSchema).optional().describe("A list of cars to display to the user, if relevant to the query. Only populate this when the user is asking to see cars."),
});
export type PublicChatOutput = z.infer<typeof PublicChatOutputSchema>;

export async function publicChat(input: PublicChatInput): Promise<PublicChatOutput> {
  return publicChatFlow(input);
}

// 1. Define a tool for the AI to get car listings from inventory
const getCarListings = ai.defineTool(
    {
        name: 'getCarListings',
        description: 'Returns a list of available car listings from the dealership inventory. Use this when the user asks what cars are available, asks for a list of cars, or asks for specific types of cars (e.g., "any SUVs?").',
        inputSchema: z.object({
            count: z.number().optional().default(10).describe("The number of car listings to return."),
        }),
        outputSchema: z.array(CarSchema),
    },
    async ({ count }) => {
        if (!db) {
            console.error("Firestore is not initialized.");
            return [];
        }
        const carsRef = collection(db, 'cars');
        const q = query(
            carsRef, 
            where('status', '==', 'approved'),
            limit(count || 10)
        );
        const querySnapshot = await getDocs(q);
        const cars = querySnapshot.docs.map(doc => {
            const data = doc.data() as Car;
            return {
                id: doc.id,
                brand: data.brand,
                model: data.model,
                year: data.year,
                price: data.price,
                images: data.images || [],
                kmRun: data.kmRun,
                fuel: data.fuel,
                transmission: data.transmission,
            };
        });
        return cars;
    }
);


const systemPrompt = `You are a friendly, enthusiastic, and helpful AI sales assistant for "Mallu Vandi", a premier used car dealership in Kerala, India. Your primary goal is to engage customers, help them find their perfect vehicle, and encourage them to take the next step (like inquiring or visiting).

- **Your Identity:** You are the Mallu Vandi AI assistant.
- **Tone:** Be conversational, persuasive, friendly, and professional. Use encouraging and positive language. Create excitement about finding a new car!
- **Inventory Knowledge:** When a user asks what cars you have, or asks for a list of available cars, you MUST use the 'getCarListings' tool to see the current inventory. If the user asks a very broad question like "what cars do you have?", ask a clarifying question first (e.g., "We have lots of great cars! Are you looking for a specific type, like a hatchback or an SUV, or do you have a budget in mind?"). Only use the tool if the user provides some specifics or asks to see everything.
- **Responding with Cars**: When your tools return a list of cars, you MUST pass this list back in the 'cars' field of your response. Your text 'reply' should be a friendly message like "Absolutely! Here are some of the great cars we have in stock right now. Let me know if any of these catch your eye!". Do not list the cars in the text reply yourself.
- **Boundaries:** Do NOT invent car or bike listings. If asked for a specific car not in your tool's output, inform the user it's not currently available but suggest they check back soon or look at similar available models. If asked for contact details, guide them to the Contact page.
- **Be Concise:** Keep your answers clear and to the point, but warm and engaging.
`;

const publicChatFlow = ai.defineFlow(
  {
    name: 'publicChatFlow',
    inputSchema: PublicChatInputSchema,
    outputSchema: PublicChatOutputSchema,
  },
  async (input) => {
    const { history, message } = input;

    const { output } = await ai.generate({
        system: systemPrompt,
        history: history || [],
        prompt: message,
        tools: [getCarListings],
        output: {
            schema: PublicChatOutputSchema,
        }
    });

    if (!output) {
      return { reply: "Sorry, I couldn't process that request. Please try again." };
    }
    
    return output;
  }
);
