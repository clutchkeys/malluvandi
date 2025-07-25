
import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Twitter, Instagram, Linkedin, Phone, MapPin, Youtube } from 'lucide-react';
import { Separator } from './ui/separator';
import { Button } from './ui/button';
import { Input } from './ui/input';

export function Footer() {
  return (
    <footer className="bg-card text-card-foreground border-t">
      <div className="container mx-auto px-4 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Logo and Tagline */}
          <div className="lg:col-span-1 space-y-4">
            <Link href="/">
              <Image
                src="https://ik.imagekit.io/qctc8ch4l/malluvandinew_tSKcC79Yr?updatedAt=1751042574078"
                alt="Mallu Vandi Logo"
                width={160}
                height={40}
              />
            </Link>
            <p className="text-sm text-muted-foreground">
              Your trusted partner for buying & selling quality pre-owned cars in Kerala.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
             <h3 className="font-semibold mb-4 text-base">Quick Links</h3>
             <ul className="space-y-3 text-sm">
                <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
                <li><Link href="/" className="text-muted-foreground hover:text-primary transition-colors">All Listings</Link></li>
                <li><Link href="/sell" className="text-muted-foreground hover:text-primary transition-colors">Sell Your Car</Link></li>
             </ul>
          </div>
          
          {/* Get in Touch */}
          <div className="space-y-2">
            <h3 className="font-semibold mb-4 text-base">Get in Touch</h3>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li className="flex items-start gap-3"><MapPin size={16} className="mt-1 shrink-0 text-primary" /> <span>123 Car Street, Kochi, Kerala, 682001</span></li>
              <li className="flex items-center gap-3"><Phone size={14} className="shrink-0 text-primary" /> <a href="tel:9633377313" className="hover:text-primary transition-colors">9633377313</a></li>
            </ul>
             <div className="flex space-x-2 pt-2">
                <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-primary"><Facebook size={20} /></Button>
                <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-primary"><Twitter size={20} /></Button>
                <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-primary"><Instagram size={20} /></Button>
                <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-primary"><Youtube size={20} /></Button>
            </div>
          </div>
          
           {/* Newsletter */}
          <div className="space-y-4">
              <h3 className="font-semibold mb-4 text-base">Subscribe to our Newsletter</h3>
              <p className="text-sm text-muted-foreground">Get the latest listings and offers delivered right to your inbox.</p>
              <div className="flex w-full max-w-sm items-center space-x-2">
                  <Input type="email" placeholder="Email" />
                  <Button type="submit">Subscribe</Button>
              </div>
          </div>

        </div>
        
        <Separator className="my-8 bg-border" />
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-y-4 sm:gap-y-0">
          <div className="text-center sm:text-left text-sm text-muted-foreground">
             <span>&copy; {new Date().getFullYear()} Mallu Vandi. Powered by </span>
             <Link href="https://advalix.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center align-middle hover:text-primary">
                 <Image src="https://ik.imagekit.io/qctc8ch4l/advalixnew_zl_QmfPfa?updatedAt=1751042510689" alt="Advalix Logo" width={60} height={15} className="object-contain dark:invert" />
             </Link>
             <span> and made by Alxvgh.</span>
           </div>
           <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

    