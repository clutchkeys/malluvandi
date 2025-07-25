
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Loader2, MessageSquare, Send, X, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { publicChat } from '@/ai/flows/public-chat-flow';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';

type ChatMessage = {
  role: 'user' | 'model';
  content: string;
};

const ChatInterface = ({
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    scrollAreaRef,
    isMobile,
    onClose,
  }: {
    messages: ChatMessage[];
    input: string;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (e: React.FormEvent) => void;
    isLoading: boolean;
    scrollAreaRef: React.RefObject<HTMLDivElement>;
    isMobile?: boolean;
    onClose?: () => void;
  }) => (
     <Card className="flex flex-col shadow-2xl h-full w-full border-0 md:rounded-lg overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b p-4 flex-shrink-0">
            <div className="flex items-center gap-2">
                <Bot className="h-6 w-6 text-primary" />
                <CardTitle className="text-lg">Mallu Vandi Assistant</CardTitle>
            </div>
             <Button size="icon" variant="ghost" onClick={onClose}>
                {isMobile ? <X className="h-6 w-6" /> : <ChevronsUpDown className="h-6 w-6" />}
                <span className="sr-only">Close chat</span>
            </Button>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full" viewportRef={scrollAreaRef}>
                <div className="p-4 space-y-4">
                {messages.map((message, index) => (
                    <div
                    key={index}
                    className={cn(
                        'flex items-end gap-2',
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                    >
                    {message.role === 'model' && <Bot className="h-6 w-6 flex-shrink-0 text-muted-foreground" />}
                    <div
                        className={cn(
                        'max-w-[80%] rounded-lg px-3 py-2 text-sm break-words',
                        message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        )}
                    >
                        {message.content}
                    </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-end gap-2 justify-start">
                        <Bot className="h-6 w-6 flex-shrink-0 text-muted-foreground" />
                        <div className="max-w-[80%] rounded-lg px-3 py-2 text-sm bg-muted flex items-center">
                            <Loader2 className="h-5 w-5 animate-spin" />
                        </div>
                    </div>
                )}
                </div>
            </ScrollArea>
        </CardContent>
        <CardFooter className="p-4 border-t flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
            <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask me anything..."
            disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading} size="icon">
                <Send className="h-5 w-5" />
            </Button>
        </form>
        </CardFooter>
    </Card>
);


export function AiChatPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const startChat = () => {
    if (messages.length === 0) {
        setMessages([
            {
                role: 'model',
                content: "Hello! I'm the Mallu Vandi assistant. How can I help you find your perfect ride today?",
            },
        ]);
    }
    setIsOpen(true);
  }

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const chatHistory = messages.map(m => ({ role: m.role, content: m.content }));
      const result = await publicChat({ history: chatHistory, message: userMessage.content });
      
      const aiMessage: ChatMessage = { role: 'model', content: result.reply };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI chat error:', error);
      const errorMessage: ChatMessage = {
        role: 'model',
        content: 'Sorry, I encountered an error. Please try again later.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const chatProps = {
    messages,
    input,
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value),
    handleSubmit,
    isLoading,
    scrollAreaRef,
    onClose: () => setIsOpen(false),
  };

  return (
    <>
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button size="lg" className="rounded-full shadow-lg" onClick={startChat}>
            <MessageSquare className="mr-2 h-5 w-5" />
            Chat with us
          </Button>
        </div>
      )}

      {isOpen && (
        isMobile ? (
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetContent side="bottom" className="h-[85vh] p-0 border-t-2">
              <ChatInterface {...chatProps} isMobile />
            </SheetContent>
          </Sheet>
        ) : (
          <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm h-[70vh] max-h-[600px]">
            <ChatInterface {...chatProps} />
          </div>
        )
      )}
    </>
  );
}

    