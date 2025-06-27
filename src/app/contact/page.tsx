'use client'
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone } from "lucide-react";

export default function ContactPage() {
  const phoneNumbers = ['9633377313', '9847916352', '9544916352'];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Contact Us</CardTitle>
            <CardDescription className="text-center">Have a question? We'd love to hear from you. Call us on any of the numbers below.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {phoneNumbers.map((phone, index) => (
              <a 
                key={index} 
                href={`tel:${phone}`} 
                className="flex items-center justify-center p-4 border rounded-lg hover:bg-muted transition-colors"
              >
                <Phone className="mr-4 h-6 w-6 text-primary" />
                <span className="text-lg font-semibold tracking-wider">{phone}</span>
              </a>
            ))}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
