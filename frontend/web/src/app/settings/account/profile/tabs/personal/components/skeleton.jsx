import React from 'react'
import { Skeleton } from "@/components/ui/skeleton"

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

export function CardSkeleton() {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
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
  )
}
