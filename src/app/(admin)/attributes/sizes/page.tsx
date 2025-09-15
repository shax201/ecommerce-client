"use client";

import React from 'react';
import { SizesClient } from './sizes-client';
import { useGetSizesQuery } from '@/lib/features/attributes';

const SizesPage = () => {
    const { data: sizesResponse, isLoading, error } = useGetSizesQuery();
    const sizes = sizesResponse?.data || [];

    if (isLoading) {
        return (
            <div className="flex flex-col">
                <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">Sizes</h2>
                            <p className="text-muted-foreground">Manage product size attributes</p>
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

    if (error) {
        return (
            <div className="flex flex-col">
                <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">Sizes</h2>
                            <p className="text-muted-foreground">Manage product size attributes</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="rounded-md border bg-background">
                            <div className="h-24 flex items-center justify-center">
                                <div className="text-center">
                                    <p className="text-destructive">Failed to load sizes</p>
                                    <p className="text-sm text-muted-foreground">Please try refreshing the page</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return <SizesClient initialSizes={sizes} />;
};

export default SizesPage;