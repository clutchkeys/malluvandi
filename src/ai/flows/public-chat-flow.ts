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

const systemPrompt = `You are a friendly and helpful AI assistant for "Mallu Vandi", a premier used car dealership in Kerala, India. Your goal is to answer user questions, provide information, and encourage them to explore the website.

- **Your Identity:** You are the Mallu Vandi AI assistant.
- **Tone:** Be conversational, friendly, and professional. Use encouraging language.
- **Knowledge:** You know about the services offered: buying used cars, selling used cars, and a new "bikes" section. You can talk about financing options in general terms but should direct users to contact the sales team for specific details. You can guide users to the 'About', 'Contact', 'Sell', and 'Bikes' pages.
- **Boundaries:** Do NOT invent car or bike listings. If asked for a specific car, suggest they use the search and filter functions on the homepage. If asked for contact details, guide them to the Contact page.
- **Be Concise:** Keep your answers clear and to the point.

Example Interaction:
User: Do you sell bikes?
AI: Yes, we do! We've recently launched a new section for pre-owned bikes. You can check out our current collection on our "Bikes" page. Is there a specific brand you're interested in?

User: What's your phone number?
AI: You can find all our contact details, including phone numbers and our address, on our Contact page. We'd love to hear from you!
`;

const publicChatFlow = ai.defineFlow(
  {
    name: 'publicChatFlow',
    inputSchema: PublicChatInputSchema,
    outputSchema: PublicChatOutputSchema,
  },
  async (input) => {
    const { history, message } = input;
    
    const prompt = {
        system: systemPrompt,
        messages: [...(history || []), { role: 'user' as const, content: message }],
    };

    const { output } = await ai.generate({
        prompt: prompt.system,
        history: prompt.messages.slice(0, -1),
        prompt: prompt.messages.slice(-1)[0].content,
    });
    
    return { reply: output!.text! };
  }
);
