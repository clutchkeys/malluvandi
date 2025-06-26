'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { ChevronRight, Menu } from 'lucide-react';

import { Button, type ButtonProps } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

// --- Context ---
interface SidebarContextProps {
  isMobile: boolean;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

const SidebarContext = React.createContext<SidebarContextProps | null>(null);

export const useSidebar = () => {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

// --- Provider ---
export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <SidebarContext.Provider value={{ isMobile, isOpen, setIsOpen, isCollapsed, setIsCollapsed }}>
      <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
    </SidebarContext.Provider>
  );
};

// --- Components ---
export const SidebarInset = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { isCollapsed, isMobile } = useSidebar();
    return (
      <div
        ref={ref}
        className={cn(
          'flex h-screen flex-col',
          !isMobile && (isCollapsed ? 'md:pl-16' : 'md:pl-64'),
          'transition-all duration-300 ease-in-out',
          className
        )}
        {...props}
      />
    );
  }
);
SidebarInset.displayName = 'SidebarInset';

export const Sidebar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const { isMobile, isOpen, setIsOpen, isCollapsed, setIsCollapsed } = useSidebar();

    if (isMobile) {
      return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex h-full flex-col">{children}</div>
          </SheetContent>
        </Sheet>
      );
    }

    return (
      <aside
        ref={ref}
        data-collapsible={isCollapsed ? 'icon' : 'full'}
        className={cn(
          'group fixed left-0 top-0 z-40 hidden h-full flex-col border-r bg-card md:flex',
          isCollapsed ? 'w-16' : 'w-64',
          'transition-all duration-300 ease-in-out',
          className
        )}
        {...props}
      >
        <div className="relative flex h-full flex-col">{children}</div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-5 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full border bg-card hover:bg-card"
          onClick={() => setIsCollapsed((prev) => !prev)}
        >
          <ChevronRight className={cn('h-4 w-4 transition-transform', isCollapsed && 'rotate-180')} />
        </Button>
      </aside>
    );
  }
);
Sidebar.displayName = 'Sidebar';

export const SidebarHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('h-14', className)} {...props} />
);
SidebarHeader.displayName = 'SidebarHeader';

export const SidebarContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex-1 overflow-y-auto', className)} {...props} />
  )
);
SidebarContent.displayName = 'SidebarContent';

export const SidebarMenu = React.forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(
  ({ className, ...props }, ref) => <ul ref={ref} className={cn('flex flex-col', className)} {...props} />
);
SidebarMenu.displayName = 'SidebarMenu';

export const SidebarMenuItem = React.forwardRef<HTMLLIElement, React.HTMLAttributes<HTMLLIElement>>(
  ({ className, ...props }, ref) => <li ref={ref} className={cn('list-none', className)} {...props} />
);
SidebarMenuItem.displayName = 'SidebarMenuItem';


interface SidebarMenuButtonProps extends ButtonProps {
  tooltip?: string;
}

export const SidebarMenuButton = React.forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  ({ className, children, tooltip, asChild = false, ...props }, ref) => {
    const { isCollapsed, isMobile, setIsOpen } = useSidebar();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isMobile) {
        setIsOpen(false);
      }
      props.onClick?.(e);
    };

    if (isCollapsed && !isMobile) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              ref={ref}
              variant="ghost"
              className={cn('w-full justify-center', className)}
              asChild={asChild}
              {...props}
            >
              {children}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">{tooltip}</TooltipContent>
        </Tooltip>
      );
    }

    return (
      <Button
        ref={ref}
        variant="ghost"
        className={cn('w-full justify-start', className)}
        asChild={asChild}
        onClick={handleClick}
        {...props}
      >
        {children}
      </Button>
    );
  }
);
SidebarMenuButton.displayName = 'SidebarMenuButton';

export const SidebarTrigger = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => {
    const { isMobile } = useSidebar();
    if (!isMobile) return null;
    return (
      <SheetTrigger asChild>
        <Button ref={ref} variant="ghost" size="icon" className={cn(className)} {...props}>
          <Menu />
        </Button>
      </SheetTrigger>
    );
  }
);
SidebarTrigger.displayName = 'SidebarTrigger';
