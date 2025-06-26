import Link from "next/link";
import { Car } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-secondary/50">
        <div className="mb-8">
            <Link href="/" className="flex items-center justify-center gap-2">
                <Car className="h-10 w-10 text-primary" />
                <span className="text-3xl font-bold text-primary font-headline">Mallu Vandi</span>
            </Link>
        </div>
      {children}
    </div>
  );
}
