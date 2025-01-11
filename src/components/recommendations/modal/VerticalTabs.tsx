import React from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';

export type VerticalTab = 'headnotes' | 'judgment';

interface VerticalTabsProps {
  activeTab: VerticalTab;
  onTabChange: (tab: VerticalTab) => void;
}

const VerticalTabs = ({ activeTab, onTabChange }: VerticalTabsProps) => {
  const { t } = useLanguage();

  const tabs: { id: VerticalTab; label: string }[] = [
    { id: 'headnotes', label: t.modal.headnotes },
    { id: 'judgment', label: t.modal.judgment }
  ];

  return (
    <div className="w-48 border-r border-gray-200 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            w-full text-left font-medium mb-4 py-1
            ${activeTab === tab.id 
              ? 'text-blue-600' 
              : 'text-gray-700 hover:text-gray-900'}
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default VerticalTabs;