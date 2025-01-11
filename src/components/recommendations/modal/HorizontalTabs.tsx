import React from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';

export type HorizontalTab = 'decision' | 'facts' | 'reasoning';

interface HorizontalTabsProps {
  activeTab: HorizontalTab;
  onTabChange: (tab: HorizontalTab) => void;
}

const HorizontalTabs = ({ activeTab, onTabChange }: HorizontalTabsProps) => {
  const { t } = useLanguage();

  const tabs: { id: HorizontalTab; label: string }[] = [
    { id: 'decision', label: t.modal.decision },
    { id: 'facts', label: t.modal.facts },
    { id: 'reasoning', label: t.modal.reasoning }
  ];

  return (
    <div className="flex border-b border-gray-200">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            px-6 py-3 text-sm font-medium
            ${activeTab === tab.id 
              ? 'border-b-2 border-blue-500 text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'}
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default HorizontalTabs;