'use client';

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

interface AboutPageProps {}

export default function AboutPage({}: AboutPageProps) {
  const aboutImageUrl = "https://ik.imagekit.io/qctc8ch4l/aboutimg.jpg";

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">About Mallu Vandi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="relative w-full h-64 md:h-96">
              <Image 
                src={aboutImageUrl}
                alt="Our team" 
                fill
                className="rounded-lg object-cover"
                data-ai-hint="dealership interior"
              />
            </div>
            <p className="text-lg text-muted-foreground">
              Welcome to Mallu Vandi, your most trusted partner in buying and selling pre-owned cars in Kerala. Our mission is to provide a seamless, transparent, and enjoyable experience for every customer. We believe that purchasing a used car should be as exciting and reliable as buying a new one.
            </p>
            <p className="text-muted-foreground">
              Founded on the principles of quality and trust, Mallu Vandi is powered by a dedicated team of automotive experts and customer service professionals. We meticulously inspect every vehicle to ensure it meets our high standards of quality and safety. Our AI-powered tools help summarize vehicle details, making it easier for our sales team to provide you with quick and accurate information.
            </p>
            <p className="text-muted-foreground">
              Whether you are looking for your first car, a family vehicle, or an upgrade, we are here to guide you every step of the way. Thank you for choosing Mallu Vandi. Your journey to the perfect ride starts here.
            </p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
