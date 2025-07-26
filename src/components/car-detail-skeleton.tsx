
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function CarDetailSkeleton() {
  return (
    <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
            <Card>
                <CardContent className="p-4">
                    <Skeleton className="aspect-video w-full rounded-lg" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/3" />
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-4 w-12" /></div>
                    <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-16" /></div>
                    <div className="space-y-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-4 w-10" /></div>
                    <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-4 w-14" /></div>
                    <div className="space-y-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-4 w-12" /></div>
                    <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-16" /></div>
                </CardContent>
            </Card>
        </div>
        <div className="md:col-span-1 space-y-6">
            <Card className="sticky top-24">
                <CardHeader>
                    <Skeleton className="h-7 w-2/3" />
                    <Skeleton className="h-9 w-1/2" />
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/3" />
                </CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-3/4" />
                </CardContent>
            </Card>
        </div>
    </div>
  )
}
