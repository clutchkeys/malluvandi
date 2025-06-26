import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Car } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-card shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <Car className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-primary font-headline">Mallu Vandi</span>
        </Link>
        <nav>
          <Button asChild>
            <Link href="/login">Employee Login</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
