import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface FilterOption {
  value: string | number;
  label: string;
}

interface ProtocolFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  legislaturePeriods: number[];
  numbers: number[];
  years: number[];
  selectedFilters: {
    legislaturePeriod: number | null;
    number: number | null;
    year: number | null;
  };
  onFilterChange: (filterType: 'legislaturePeriod' | 'number' | 'year', value: number | null) => void;
}

const ProtocolFilterDrawer = ({
  isOpen,
  onClose,
  legislaturePeriods,
  numbers,
  years,
  selectedFilters,
  onFilterChange
}: ProtocolFilterDrawerProps) => {
  const { t } = useLanguage();
  const [tempFilters, setTempFilters] = useState(selectedFilters);

  const handleTempFilterChange = (filterType: 'legislaturePeriod' | 'number' | 'year', value: number | null) => {
    setTempFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleApply = () => {
    // Apply all filter changes at once
    Object.entries(tempFilters).forEach(([key, value]) => {
      onFilterChange(key as keyof typeof selectedFilters, value);
    });
    onClose();
  };

  const handleReset = () => {
    // Reset temp filters
    const resetFilters = {
      legislaturePeriod: null,
      number: null,
      year: null
    };
    setTempFilters(resetFilters);
    
    // Apply reset filters
    Object.entries(resetFilters).forEach(([key, value]) => {
      onFilterChange(key as keyof typeof selectedFilters, value);
    });
  };

  // Reset temp filters when drawer opens
  React.useEffect(() => {
    if (isOpen) {
      setTempFilters(selectedFilters);
    }
  }, [isOpen, selectedFilters]);

  const renderFilter = (
    label: string,
    options: FilterOption[],
    filterType: 'legislaturePeriod' | 'number' | 'year',
    selectedValue: number | null
  ) => (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <select
        value={selectedValue || ''}
        onChange={(e) => {
          const value = e.target.value ? Number(e.target.value) : null;
          handleTempFilterChange(filterType, value);
        }}
        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">{t.protocols.all}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div 
        className={`
          fixed right-0 top-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">
              {t.protocols.filters}
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderFilter(
            t.protocols.legislature,
            legislaturePeriods.map(period => ({ value: period, label: period.toString() })),
            'legislaturePeriod',
            tempFilters.legislaturePeriod
          )}

          {renderFilter(
            t.protocols.number,
            numbers.map(num => ({ value: num, label: num.toString() })),
            'number',
            tempFilters.number
          )}

          {renderFilter(
            t.protocols.year,
            years.map(year => ({ value: year, label: year.toString() })),
            'year',
            tempFilters.year
          )}
        </div>

        {/* Footer with buttons */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between gap-4">
            <button
              onClick={handleReset}
              className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
            >
              Reset
            </button>
            <button
              onClick={handleApply}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProtocolFilterDrawer;