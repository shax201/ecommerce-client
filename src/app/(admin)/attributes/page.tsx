import React from 'react';
import Link from 'next/link';
import { Bookmark, Ruler } from 'lucide-react';

const AttributesPage = () => {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Attributes</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link href="/attributes/colors">
                    <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex items-center gap-3 mb-3">
                            <Bookmark className="h-6 w-6 text-blue-500" />
                            <h2 className="text-xl font-semibold">Colors</h2>
                        </div>
                        <p className="text-gray-600">Manage product color attributes</p>
                    </div>
                </Link>
                
                <Link href="/attributes/sizes">
                    <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex items-center gap-3 mb-3">
                            <Ruler className="h-6 w-6 text-green-500" />
                            <h2 className="text-xl font-semibold">Sizes</h2>
                        </div>
                        <p className="text-gray-600">Manage product size attributes</p>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default AttributesPage;