import { cn } from "@/lib/utils";
import { Megaphone } from "lucide-react";

export function AdPlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center bg-muted/50 border-2 border-dashed border-muted-foreground/30 rounded-lg text-muted-foreground",
        className
      )}
    >
      <Megaphone className="h-8 w-8 mb-2" />
      <span className="font-semibold text-sm">Advertisement</span>
    </div>
  );
}
