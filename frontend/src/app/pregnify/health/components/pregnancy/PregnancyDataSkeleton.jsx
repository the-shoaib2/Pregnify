"use client"

import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export const PregnancyDataSkeleton = () => {
    return (
        <Card className="p-4 md:p-6">
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-8 w-32" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {/* Basic Information Skeleton */}
                    <div className="space-y-3">
                        <Skeleton className="h-5 w-32" />
                        <div className="space-y-2">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex justify-between items-center">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-20" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pregnancy Details Skeleton */}
                    <div className="space-y-3">
                        <Skeleton className="h-5 w-32" />
                        <div className="space-y-2">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex justify-between items-center">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-20" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Medical Information Skeleton */}
                    <div className="space-y-3">
                        <Skeleton className="h-5 w-32" />
                        <div className="space-y-2">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex justify-between items-center">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-20" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    )
} 