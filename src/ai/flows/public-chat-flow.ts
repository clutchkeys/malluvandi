
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
  reply: z.string().describe("The AI assistant's text reply. This should be a friendly and helpful message."),
  cars: z.array(CarSchema).optional().describe("A list of cars to display to the user, if relevant to the query."),
});
export type PublicChatOutput = z.infer<typeof PublicChatOutputSchema>;

export async function publicChat(input: PublicChatInput): Promise<PublicChatOutput> {
  return publicChatFlow(input);
}

// Tool to get a general list of cars
const getCarListings = ai.defineTool(
    {
        name: 'getCarListings',
        description: 'Returns a list of available car listings from the dealership inventory. Use this when the user asks broadly what cars are available or asks for a list of cars without specifying a particular model.',
        inputSchema: z.object({
            count: z.number().optional().default(10).describe("The number of car listings to return."),
        }),
        outputSchema: z.array(CarSchema),
    },
    async ({ count }) => {
        if (!db) return [];
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

// New tool to find a specific car, case-insensitively
const findCar = ai.defineTool(
    {
        name: 'findCar',
        description: 'Searches the inventory for a specific car model. Use this when the user asks if a particular car is in stock (e.g., "Do you have a Toyota Etios?", "Is the Swift available?").',
        inputSchema: z.object({
            model: z.string().describe("The model of the car the user is asking about, e.g., 'Etios', 'Swift'."),
            brand: z.string().optional().describe("The brand of the car, e.g., 'Toyota', 'Maruti Suzuki'."),
        }),
        outputSchema: z.array(CarSchema),
    },
    async ({ model, brand }) => {
        if (!db) return [];
        const carsRef = collection(db, 'cars');
        const q = query(carsRef, where('status', '==', 'approved'));
        const querySnapshot = await getDocs(q);
        
        const allCars = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Car));

        const searchModel = model.toLowerCase();
        const searchBrand = brand?.toLowerCase();
        
        const foundCars = allCars.filter(car => {
            const carModel = car.model.toLowerCase();
            const carBrand = car.brand.toLowerCase();

            const modelMatch = carModel.includes(searchModel);
            const brandMatch = searchBrand ? carBrand.includes(searchBrand) : true;

            return modelMatch && brandMatch;
        });

        return foundCars.map(data => ({
            id: data.id,
            brand: data.brand,
            model: data.model,
            year: data.year,
            price: data.price,
            images: data.images || [],
            kmRun: data.kmRun,
            fuel: data.fuel,
            transmission: data.transmission,
        }));
    }
);

const systemPrompt = `You are a friendly, enthusiastic, and helpful AI sales assistant for "Mallu Vandi", a premier used car dealership in Kerala, India. Your primary goal is to engage customers, help them find their perfect vehicle, and encourage them to take the next step.

- **Your Identity:** You are the Mallu Vandi AI assistant.
- **Tone:** Be conversational, persuasive, friendly, and professional. Use encouraging and positive language. Create excitement about finding a new car!
- **Searching for Specific Cars:** When a user asks if you have a specific model (e.g., "Do you have a Swift?", "Looking for Toyota Etios"), you MUST use the 'findCar' tool to search the inventory. Extract the model and, if provided, the brand from the user's message to use in the tool.
- **Searching for General Cars:** When a user asks a broad question like "what cars do you have?" or asks for a list, you MUST use the 'getCarListings' tool. If the query is very broad, ask a clarifying question first (e.g., "We have lots of great cars! Are you looking for a specific type, like a hatchback or an SUV, or do you have a budget in mind?").
- **Responding with Cars**: When your tools return one or more cars, you MUST pass this list back in the 'cars' field of your response. Your text 'reply' should be a friendly message like "Yes, we do! Here is the Toyota Etios we have in stock. Let me know if you'd like to know more!" or "Of course! Here are some great cars we have available right now.". Do NOT list the cars in the text reply yourself.
- **If Car Not Found**: If the 'findCar' tool returns an empty list, inform the user that the specific model is not currently available but offer to show them similar cars, using their request to find alternatives (e.g. "I don't have that specific model in stock right now... would you like to see a list of our other available Toyota cars?").
- **Boundaries:** Do NOT invent car or bike listings. If asked for contact details, guide them to the Contact page.
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

    const llmResponse = await ai.generate({
        system: systemPrompt,
        history: history || [],
        prompt: message,
        tools: [getCarListings, findCar],
        output: {
            schema: PublicChatOutputSchema,
        }
    });

    if (!llmResponse.output) {
      return { reply: "Sorry, I couldn't process that request. Please try again." };
    }
    
    // Ensure that if a tool was called and returned cars, they are in the final output.
    const toolOutputs = llmResponse.toolRequest?.tool?.outputs;
    if (toolOutputs && Array.isArray(toolOutputs) && toolOutputs.length > 0) {
        // Assuming the tool output is the array of cars
        const carsFromTool = toolOutputs[0] as Car[];
        if (carsFromTool && carsFromTool.length > 0) {
            llmResponse.output.cars = carsFromTool;
        }
    }

    return llmResponse.output;
  }
);
