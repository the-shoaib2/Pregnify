import React from 'react'
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"


export function TabListSkeleton({ className, count, ...props }) {
  return (
    <div
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-muted/30 p-1 w-full",
        className
      )}
      {...props}
    >
      <div className="flex gap-1 w-full">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="h-8 w-full rounded-sm animate-pulse bg-muted "
          />
        ))}
      </div>
    </div>
  )
}



export function FormFieldSkeleton() {
  return (
    <div className="grid w-full items-center gap-1.5">
      <Skeleton className="h-4 w-24 mb-2" />
      <Skeleton className="h-10 w-full" />
    </div>
  )
}

export function FormSectionSkeleton({ columns = 2 }) {
  return (
    <div className="space-y-6">
      <Skeleton className="h-6 w-48 mb-4" />
      <div className={`grid gap-4 ${
        columns === 2 ? 'md:grid-cols-2' : ''
      }`}>
        {Array(columns * 3).fill(0).map((_, i) => (
          <FormFieldSkeleton key={i} />
        ))}
      </div>
      <div className="flex justify-end mt-4">
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  )
}

export function CardSkeleton({ className, count, ...props }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i}
          className={cn(
            "rounded-lg border bg-card text-card-foreground shadow-sm",
            className
          )}
          {...props}
        >
          <div className="p-6 flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <FormSectionSkeleton />
          </div>
        </div>
      ))}
    </>
  )
}
