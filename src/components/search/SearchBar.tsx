import React from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  isLoading?: boolean;
}

const SearchBar = ({ value, onChange, onSearch, isLoading = false }: SearchBarProps) => {
  const { t } = useLanguage();

  return (
    <div className="flex-1 relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-4 pr-12 py-2.5 rounded-full border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
        placeholder={t.search.placeholder}
        onKeyDown={(e) => e.key === 'Enter' && onSearch()}
        disabled={isLoading}
      />
      <button
        onClick={onSearch}
        disabled={isLoading}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full transition-colors font-medium disabled:opacity-50"
        aria-label="Search"
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 text-gray-700 animate-spin" />
        ) : (
          <Search className="h-5 w-5 text-gray-700 stroke-[2.5px]" />
        )}
      </button>
    </div>
  );
};

export default SearchBar;