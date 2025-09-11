import React from 'react';
import { getSizes } from '@/actions/size';
import { SizesClient } from './sizes-client';
import { SizesSkeleton } from './sizes-skeleton';
export const dynamic = 'force-dynamic';
const SizesPage = async () => {
    const { success, data: sizes = [] } = await getSizes();

    return <SizesClient initialSizes={sizes} />;
};

export default SizesPage;