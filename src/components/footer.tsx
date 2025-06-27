import Link from 'next/link';
import { Car, Facebook, Twitter, Instagram, Linkedin, Phone, MapPin } from 'lucide-react';
import { Separator } from './ui/separator';

export function Footer() {
  return (
    <footer className="bg-card border-t text-card-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          <div className="md:col-span-4 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Car className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-primary font-headline">Mallu Vandi</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Your trusted marketplace for quality pre-owned cars in Kerala.
            </p>
            <div className="flex space-x-4">
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors"><Facebook size={20} /></Link>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors"><Twitter size={20} /></Link>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors"><Instagram size={20} /></Link>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors"><Linkedin size={20} /></Link>
            </div>
          </div>
          
          <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
               <h3 className="font-semibold mb-4">Quick Links</h3>
               <ul className="space-y-2 text-sm">
                  <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
                  <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
                  <li><Link href="/" className="text-muted-foreground hover:text-primary transition-colors">Listings</Link></li>
               </ul>
            </div>
            <div>
               <h3 className="font-semibold mb-4">Legal</h3>
               <ul className="space-y-2 text-sm">
                  <li><Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
               </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Get in Touch</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2"><MapPin size={16} className="mt-1 shrink-0" /> <span>123 Car Street, Kochi, Kerala, 682001</span></li>
                <li className="flex items-center gap-2"><Phone size={14} /> <a href="tel:9633377313" className="hover:text-primary transition-colors">9633377313</a></li>
              </ul>
            </div>
             <div>
                <h3 className="font-semibold mb-4">Credits</h3>
                <div className="text-sm text-muted-foreground space-y-2">
                    <p>Powered by <a href="#" className="font-semibold hover:text-primary transition-colors">Advalix</a></p>
                    <p>Made by <a href="#" className="font-semibold hover:text-primary transition-colors">@alxvgh</a></p>
                </div>
             </div>
          </div>
        </div>
        <Separator className="my-8" />
        <div className="text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Mallu Vandi. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
