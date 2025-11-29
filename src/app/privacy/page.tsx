
'use client';

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PrivacyPageProps {}

export default function PrivacyPolicyPage({}: PrivacyPageProps) {
  const [date, setDate] = useState('...');

  useEffect(() => {
    setDate(new Date().toLocaleDateString());
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p><strong>Last Updated:</strong> {date}</p>
            
            <h2 className="text-xl font-semibold text-foreground pt-4">1. Introduction</h2>
            <p>Mallu Vandi ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.</p>

            <h2 className="text-xl font-semibold text-foreground pt-4">2. Information We Collect</h2>
            <p>We may collect personal information from you such as your name, email address, and phone number when you register for an account or submit an inquiry. We also collect non-personal information, such as browser type and operating system, to improve our services.</p>

            <h2 className="text-xl font-semibold text-foreground pt-4">3. Use of Your Information</h2>
            <p>We may use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Create and manage your account.</li>
              <li>Facilitate the purchase and sale of vehicles.</li>
              <li>Respond to your inquiries and offer support.</li>
              <li>Send you promotional materials and updates.</li>
              <li>Improve our website and services.</li>
            </ul>

            <h2 className="text-xl font-semibold text-foreground pt-4">4. Disclosure of Your Information</h2>
            <p>We do not sell, trade, or otherwise transfer to outside parties your Personally Identifiable Information unless we provide users with advance notice. This does not include website hosting partners and other parties who assist us in operating our website, so long as those parties agree to keep this information confidential.</p>

            <h2 className="text-xl font-semibold text-foreground pt-4">5. Security of Your Information</h2>
            <p>We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.</p>

            <h2 className="text-xl font-semibold text-foreground pt-4">6. Contact Us</h2>
            <p>If you have questions or comments about this Privacy Policy, please contact us using the information on our contact page.</p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
