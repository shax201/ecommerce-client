"use client";

import React from 'react';
import { useGetSingleSizeQuery } from '@/lib/features/attributes';
import { EditSizeForm } from './edit-size-form';
import { notFound } from 'next/navigation';

interface EditSizePageProps {
  params: {
    id: string;
  };
}

const EditSizePage = ({ params }: EditSizePageProps) => {
  const { data: sizeResponse, isLoading, error } = useGetSingleSizeQuery(params.id);

  if (isLoading) {
    return (
      <div className="flex flex-col">
        <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Edit Size</h2>
              <p className="text-muted-foreground">Update size attribute information</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-md border bg-background">
              <div className="h-24 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !sizeResponse?.success || !sizeResponse?.data || sizeResponse.data.length === 0) {
    notFound();
  }

  const size = sizeResponse.data[0];

  return <EditSizeForm size={size} />;
};

export default EditSizePage;
