import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-secondary/50">
        <div className="mb-8">
            <Link href="/">
                <Image
                    src="https://ik.imagekit.io/qctc8ch4l/malluvandi.png?updatedAt=1751041703463"
                    alt="Mallu Vandi Logo"
                    width={200}
                    height={50}
                    priority
                />
            </Link>
        </div>
      {children}
    </div>
  );
}
