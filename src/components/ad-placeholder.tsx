import { cn } from "@/lib/utils";
import { Megaphone } from "lucide-react";

export function AdPlaceholder({ className, shape = 'banner' }: { className?: string; shape?: 'banner' | 'square' | 'post' }) {
  
  const shapeClasses = {
    banner: 'aspect-[5/1] w-full',
    square: 'aspect-square w-full',
    post: 'flex flex-col h-full overflow-hidden shadow-md transition-all duration-300 border-border/50 rounded-lg'
  }

  if (shape === 'post') {
    return (
       <div className={cn(
        "flex flex-col items-center justify-center bg-muted/50 border-2 border-dashed border-muted-foreground/30 text-muted-foreground p-4",
        shapeClasses[shape],
        className
      )}>
        <Megaphone className="h-10 w-10 mb-4" />
        <h3 className="font-bold text-lg text-center">Sponsored Listing</h3>
        <p className="text-sm text-center">Your ad could be here! Reach thousands of potential car buyers.</p>
        <button className="mt-4 text-xs bg-primary/20 text-primary px-3 py-1 rounded-full">Learn More</button>
      </div>
    )
  }
  
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center bg-muted/50 border-2 border-dashed border-muted-foreground/30 rounded-lg text-muted-foreground",
        shapeClasses[shape],
        className
      )}
    >
      <Megaphone className="h-8 w-8 mb-2" />
      <span className="font-semibold text-sm">Advertisement</span>
    </div>
  );
}
