'use client';

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsOfServicePage() {
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
            <CardTitle className="text-3xl font-bold text-center">Terms of Service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p><strong>Last Updated:</strong> {date}</p>

            <h2 className="text-xl font-semibold text-foreground pt-4">1. Agreement to Terms</h2>
            <p>By using the Mallu Vandi website ("Site"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Site.</p>

            <h2 className="text-xl font-semibold text-foreground pt-4">2. User Accounts</h2>
            <p>When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Site.</p>

            <h2 className="text-xl font-semibold text-foreground pt-4">3. Prohibited Activities</h2>
            <p>You may not access or use the Site for any purpose other than that for which we make the Site available. Prohibited activity includes, but is not limited to:
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>Engaging in any automated use of the system, such as using scripts to send comments or messages.</li>
                <li>Interfering with, disrupting, or creating an undue burden on the Site or the networks or services connected to the Site.</li>
                <li>Attempting to impersonate another user or person.</li>
                <li>Using any information obtained from the Site in order to harass, abuse, or harm another person.</li>
              </ul>
            </p>
            
            <h2 className="text-xl font-semibold text-foreground pt-4">4. Intellectual Property</h2>
            <p>The Site and its original content, features, and functionality are and will remain the exclusive property of Mallu Vandi and its licensors. The Site is protected by copyright, trademark, and other laws of both the country and foreign countries.</p>

            <h2 className="text-xl font-semibold text-foreground pt-4">5. Disclaimer</h2>
            <p>The Site is provided on an "as-is" and "as-available" basis. You agree that your use of the Site and our services will be at your sole risk. To the fullest extent permitted by law, we disclaim all warranties, express or implied, in connection with the site and your use thereof.</p>

            <h2 className="text-xl font-semibold text-foreground pt-4">6. Contact Us</h2>
            <p>In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us.</p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
