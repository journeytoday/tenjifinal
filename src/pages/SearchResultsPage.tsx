import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import Logo from '../components/Logo';

interface SearchResultsPageProps {
  onNavigate: (page: 'home' | 'login' | 'signup' | 'profile') => void;
}

const SearchResultsPage = ({ onNavigate }: SearchResultsPageProps) => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <Logo onNavigate={onNavigate} />
        </div>
      </div>
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Search Results
        </h1>
        {/* Search results content will go here */}
      </main>
    </div>
  );
};

export default SearchResultsPage;