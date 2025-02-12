import { Skeleton } from "@/components/ui/skeleton";

export function FindUserFormSkeleton() {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Skeleton className="h-4 w-24" />
        <div className="relative">
          <Skeleton className="h-9 w-full" />
        </div>
        <Skeleton className="h-3 w-3/4" />
      </div>
      <Skeleton className="h-9 w-full" />
    </div>
  );
}

export function UserListSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="space-y-2">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="flex items-center space-x-3 rounded-lg border p-2.5"
          >
            <Skeleton className="h-3.5 w-3.5 rounded-full" />
            <div className="flex items-center space-x-3 min-w-0">
              <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
              <div className="space-y-1 min-w-0">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <Skeleton className="h-9 w-full" />
    </div>
  );
} 