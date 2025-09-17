'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function UserSettingsSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Tabs Skeleton */}
        <div className="border-b border-gray-200 mb-8">
          <div className="flex space-x-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center py-2">
                <Skeleton className="h-6 w-6 mr-2" />
                <div>
                  <Skeleton className="h-4 w-16 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
              <div>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="flex justify-end">
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
