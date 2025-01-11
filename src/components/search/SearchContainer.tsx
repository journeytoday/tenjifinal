import React, { useState } from 'react';
import { Home, Filter } from 'lucide-react';
import SearchBar from './SearchBar';
import SearchButton from './SearchButton';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { translateText } from '../../lib/translate';

interface Filters {
  legislaturePeriod: number | null;
  number: number | null;
  year: number | null;
}

interface SearchContainerProps {
  isFilterDrawerOpen?: boolean;
  onFilterDrawerOpen?: () => void;
  onFilterDrawerClose?: () => void;
  filters?: Filters;
  onFilterChange?: (filterType: keyof Filters, value: number | null) => void;
}

const SearchContainer = ({
  isFilterDrawerOpen = false,
  onFilterDrawerOpen = () => {},
  filters = {
    legislaturePeriod: null,
    number: null,
    year: null
  }
}: SearchContainerProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const { t } = useLanguage();
  const { user, isGuest } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const storeSearchHistory = async (query: string) => {
    if (!user || isGuest) return;

    try {
      await supabase
        .from('search_history')
        .insert({
          user_id: user.id,
          query: query.trim()
        });
    } catch (err) {
      console.error('Failed to store search history:', err);
    }
  };

  const handleSearch = async () => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return;

    setIsTranslating(true);
    try {
      // Translate query to German
      const translatedQuery = await translateText(trimmedQuery, 'de');
      
      // Store original search history
      await storeSearchHistory(trimmedQuery);

      // Navigate with both original and translated queries
      navigate(`/search?q=${encodeURIComponent(trimmedQuery)}&tq=${encodeURIComponent(translatedQuery)}`);
    } catch (error) {
      console.error('Translation failed:', error);
      // Fallback to original query if translation fails
      navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    } finally {
      setIsTranslating(false);
    }
  };

  // Set initial search query from URL
  React.useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  const hasActiveFilters = Object.values(filters).some(value => value !== null);

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <div className="flex items-center space-x-3">
        <button 
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          onClick={() => navigate('/')}
        >
          <Home className="h-5 w-5" />
        </button>

        <div className="flex-1 flex items-center space-x-3 search-bar">
          <SearchBar 
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
            isLoading={isTranslating}
          />

          <SearchButton
            icon={<Filter className={`h-5 w-5 ${hasActiveFilters ? 'text-blue-600' : ''}`} />}
            active={hasActiveFilters}
            onClick={onFilterDrawerOpen}
            label={t.search.filters}
          />
        </div>
      </div>
    </div>
  );
};

export default SearchContainer;