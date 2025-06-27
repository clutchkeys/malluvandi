import Link from 'next/link';
import { Car } from 'lucide-react';
import { Separator } from './ui/separator';

export function Footer() {
  return (
    <footer className="bg-card border-t mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Car className="h-7 w-7 text-primary" />
              <span className="text-xl font-bold text-primary font-headline">Mallu Vandi</span>
            </div>
            <div className="flex justify-center gap-6 text-sm text-muted-foreground">
                <Link href="/about" className="hover:text-primary transition-colors">About Us</Link>
                <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
                <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            </div>
            <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Mallu Vandi. All rights reserved.</p>
        </div>
        <Separator className="my-6" />
        <div className="text-center text-xs text-muted-foreground">
          <p>Powered by <a href="#" className="font-semibold hover:text-primary">Advalix</a></p>
          <p>Made by <a href="#" className="font-semibold hover:text-primary">@alxvgh</a></p>
        </div>
      </div>
    </footer>
  );
}
