"use client";

import React from 'react';
import { useGetSingleColorQuery } from '@/lib/features/attributes';
import { EditColorForm } from './edit-color-form';
import { notFound } from 'next/navigation';

interface EditColorPageProps {
  params: {
    id: string;
  };
}

const EditColorPage = ({ params }: EditColorPageProps) => {
  const { data: colorResponse, isLoading, error } = useGetSingleColorQuery(params.id);

  if (isLoading) {
    return (
      <div className="flex flex-col">
        <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Edit Color</h2>
              <p className="text-muted-foreground">Update color attribute information</p>
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

  if (error || !colorResponse?.success || !colorResponse?.data || colorResponse.data.length === 0) {
    notFound();
  }

  const color = colorResponse.data[0];

  return <EditColorForm color={color} />;
};

export default EditColorPage;
