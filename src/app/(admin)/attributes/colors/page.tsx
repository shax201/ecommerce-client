import React from 'react';
import { getColors } from '@/actions/colors';
import { ColorsClient } from './colors-client';
export const dynamic = 'force-dynamic';
const ColorsPage = async () => {
    const { success, data: colors = [] } = await getColors();

    // Always show the ColorsClient component, even when no data is found
    // The client component will handle the empty state appropriately
    return  <ColorsClient initialColors={colors} />;
};

export default ColorsPage;