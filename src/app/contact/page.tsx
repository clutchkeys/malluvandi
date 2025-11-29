
'use client'
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, MapPin, Clock } from "lucide-react";

interface ContactPageProps {}

export default function ContactPage({}: ContactPageProps) {
  const phoneNumbers = ['9847916352', '9544916352'];
  const address = "Pullikal, Malapuram, Kerala, 673637";
  const callingHours = "10:00 AM - 12:00 PM";

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Contact Us</CardTitle>
            <CardDescription className="text-center">Have a question? We'd love to hear from you. Reach out to us via phone or visit our office.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2 text-center">Our Location</h3>
               <div className="flex items-center justify-center p-4 border rounded-lg">
                <MapPin className="mr-4 h-6 w-6 text-primary" />
                <span className="text-md font-medium text-center">{address}</span>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2 text-center">Give us a Call</h3>
              {phoneNumbers.map((phone, index) => (
                <a 
                  key={index} 
                  href={`tel:${phone}`} 
                  className="flex items-center justify-center p-4 border rounded-lg hover:bg-muted transition-colors mb-2"
                >
                  <Phone className="mr-4 h-6 w-6 text-primary" />
                  <span className="text-lg font-semibold tracking-wider">{phone}</span>
                </a>
              ))}
               <div className="flex items-center justify-center p-3 text-sm text-muted-foreground bg-muted/50 rounded-lg mt-4">
                  <Clock className="mr-3 h-5 w-5" />
                  <span>Please call between: <strong>{callingHours}</strong></span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
