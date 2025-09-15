"use client";

import React from 'react';
import { ColorsClient } from './colors-client';
import { useGetColorsQuery } from '@/lib/features/attributes';

const ColorsPage = () => {
    const { data: colorsResponse, isLoading, error } = useGetColorsQuery();
    const colors = colorsResponse?.data || [];

    if (isLoading) {
        return (
            <div className="flex flex-col">
                <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">Colors</h2>
                            <p className="text-muted-foreground">Manage product color attributes</p>
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
                            <h2 className="text-3xl font-bold tracking-tight">Colors</h2>
                            <p className="text-muted-foreground">Manage product color attributes</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="rounded-md border bg-background">
                            <div className="h-24 flex items-center justify-center">
                                <div className="text-center">
                                    <p className="text-destructive">Failed to load colors</p>
                                    <p className="text-sm text-muted-foreground">Please try refreshing the page</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return <ColorsClient initialColors={colors} />;
};

export default ColorsPage;