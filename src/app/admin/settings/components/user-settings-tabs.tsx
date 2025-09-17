'use client';

import { cn } from '@/lib/utils';

interface UserSettingsTabsProps {
  activeTab: 'profile' | 'security' | 'preferences';
  onTabChange: (tab: 'profile' | 'security' | 'preferences') => void;
}

const tabs = [
  {
    id: 'profile' as const,
    name: 'Profile',
    description: 'Update your personal information',
    icon: '👤',
  },
  {
    id: 'security' as const,
    name: 'Security',
    description: 'Manage password and email',
    icon: '🔒',
  },
  {
    id: 'preferences' as const,
    name: 'Preferences',
    description: 'Customize your experience',
    icon: '⚙️',
  },
];

export function UserSettingsTabs({ activeTab, onTabChange }: UserSettingsTabsProps) {
  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors',
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            <span className="mr-2 text-lg">{tab.icon}</span>
            <div className="text-left">
              <div className="font-medium">{tab.name}</div>
              <div className="text-xs text-gray-500">{tab.description}</div>
            </div>
          </button>
        ))}
      </nav>
    </div>
  );
}
