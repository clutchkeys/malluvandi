import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Twitter, Instagram, Linkedin, Phone, MapPin } from 'lucide-react';
import { Separator } from './ui/separator';
import { Button } from './ui/button';

export function Footer() {
  return (
    <footer className="bg-footer text-footer-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8">

          {/* Logo and Tagline */}
          <div className="md:col-span-4 lg:col-span-2 space-y-4">
            <Link href="/">
              <Image
                src="https://ik.imagekit.io/qctc8ch4l/malluvandi.png?updatedAt=1751041703463"
                alt="Mallu Vandi Logo"
                width={160}
                height={40}
                className="brightness-0 invert"
              />
            </Link>
            <p className="text-sm text-footer-muted-foreground max-w-sm">
              Your trusted marketplace for quality pre-owned cars in Kerala. We provide a seamless and transparent car buying and selling experience.
            </p>
            <div className="flex space-x-2 pt-2">
                <Button size="icon" variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20"><Facebook size={20} /></Button>
                <Button size="icon" variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20"><Twitter size={20} /></Button>
                <Button size="icon" variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20"><Instagram size={20} /></Button>
                <Button size="icon" variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20"><Linkedin size={20} /></Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
             <h3 className="font-semibold mb-4 text-lg">Quick Links</h3>
             <ul className="space-y-3 text-sm">
                <li><Link href="/about" className="text-footer-muted-foreground hover:text-footer-primary transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="text-footer-muted-foreground hover:text-footer-primary transition-colors">Contact</Link></li>
                <li><Link href="/" className="text-footer-muted-foreground hover:text-footer-primary transition-colors">All Listings</Link></li>
             </ul>
          </div>

          {/* Legal */}
          <div className="space-y-2">
             <h3 className="font-semibold mb-4 text-lg">Legal</h3>
             <ul className="space-y-3 text-sm">
                <li><Link href="/privacy" className="text-footer-muted-foreground hover:text-footer-primary transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-footer-muted-foreground hover:text-footer-primary transition-colors">Terms of Service</Link></li>
             </ul>
          </div>
          
          {/* Get in Touch */}
          <div className="space-y-2">
            <h3 className="font-semibold mb-4 text-lg">Get in Touch</h3>
            <ul className="space-y-3 text-sm text-footer-muted-foreground">
              <li className="flex items-start gap-3"><MapPin size={16} className="mt-1 shrink-0 text-footer-primary" /> <span>123 Car Street, Kochi, Kerala, 682001</span></li>
              <li className="flex items-center gap-3"><Phone size={14} className="shrink-0 text-footer-primary" /> <a href="tel:9633377313" className="hover:text-footer-primary transition-colors">9633377313</a></li>
            </ul>
          </div>
        </div>
        
        <Separator className="my-8 bg-white/10" />
        
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          <div className="text-center text-sm text-footer-muted-foreground">
            &copy; {new Date().getFullYear()} Mallu Vandi. All rights reserved.
          </div>
           <div className="flex items-center gap-4 text-sm text-footer-muted-foreground">
              <div className="flex items-center gap-2">
                <span>Powered by</span>
                <a href="#" className="hover:opacity-80 transition-opacity">
                    <Image src="https://ik.imagekit.io/qctc8ch4l/advalix.png?updatedAt=1751041755492" alt="Advalix Logo" width={80} height={20} className="brightness-0 invert" />
                </a>
              </div>
              <span>Made by <a href="#" className="font-semibold hover:text-footer-primary transition-colors">@alxvgh</a></span>
          </div>
        </div>
      </div>
    </footer>
  );
}
