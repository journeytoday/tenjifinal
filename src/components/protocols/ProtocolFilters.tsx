import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

interface FilterOption {
  value: string | number;
  label: string;
}

interface ProtocolFiltersProps {
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

const ProtocolFilters = ({
  legislaturePeriods,
  numbers,
  years,
  selectedFilters,
  onFilterChange
}: ProtocolFiltersProps) => {
  const { t } = useLanguage();

  const renderFilter = (
    label: string,
    options: FilterOption[],
    filterType: 'legislaturePeriod' | 'number' | 'year',
    selectedValue: number | null
  ) => (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        value={selectedValue || ''}
        onChange={(e) => {
          const value = e.target.value ? Number(e.target.value) : null;
          onFilterChange(filterType, value);
        }}
        className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
    <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{t.protocols.filters}</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {renderFilter(
          t.protocols.legislature,
          legislaturePeriods.map(period => ({ value: period, label: period.toString() })),
          'legislaturePeriod',
          selectedFilters.legislaturePeriod
        )}
        {renderFilter(
          t.protocols.number,
          numbers.map(num => ({ value: num, label: num.toString() })),
          'number',
          selectedFilters.number
        )}
        {renderFilter(
          t.protocols.year,
          years.map(year => ({ value: year, label: year.toString() })),
          'year',
          selectedFilters.year
        )}
      </div>
    </div>
  );
};

export default ProtocolFilters;