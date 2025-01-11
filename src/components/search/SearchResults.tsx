import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import ProtocolCard from '../protocols/ProtocolCard';
import ProtocolModal from '../protocols/ProtocolModal';
import { useLanguage } from '../../contexts/LanguageContext';

interface SearchResultsProps {
  query: string;
}

interface Protocol {
  id: string;
  title: string;
  legislatureperiod: number;
  number: number;
  date: string;
  first_speech_id?: string;
  first_speech_summary?: string;
}

const RESULTS_PER_PAGE = 9;

const SearchResults = ({ query }: SearchResultsProps) => {
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (query) {
      const page = parseInt(searchParams.get('page') || '0');
      setCurrentPage(page);
      searchSpeeches(query, page);
    }
  }, [query, searchParams]);

  const searchSpeeches = async (searchQuery: string, page: number) => {
    setLoading(true);
    try {
      const { data: results, error: searchError } = await supabase
        .rpc('search_speeches_fast', {
          search_query: searchQuery,
          page_number: page,
          results_per_page: RESULTS_PER_PAGE
        });

      if (searchError) throw searchError;

      if (results) {
        setProtocols(results.protocols || []);
        setTotalResults(results.total_count || 0);
      } else {
        setProtocols([]);
        setTotalResults(0);
      }
    } catch (err) {
      console.error('Error searching speeches:', err);
      setError(err instanceof Error ? err.message : 'Failed to search speeches');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams({ q: query, page: newPage.toString() });
  };

  const totalPages = Math.ceil(totalResults / RESULTS_PER_PAGE);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-200 p-6 bg-white">
        <h2 className="text-lg font-semibold mb-4">Search Results</h2>
        <div className="space-y-4">
          {/* Search Term */}
          <div className="bg-gray-100 rounded-md p-3">
            <div className="text-sm text-gray-600 mb-1">Search Term:</div>
            <div className="font-medium truncate" title={query}>{query}</div>
          </div>

          {/* Results Count */}
          <div className="bg-gray-100 rounded-md p-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Results:</span>
              <span className="font-medium">
                {loading ? (
                  <div className="animate-pulse w-8 h-6 bg-gray-200 rounded"></div>
                ) : (
                  totalResults
                )}
              </span>
            </div>
          </div>

          {/* Current View */}
          <div className="text-sm text-gray-600">
            {loading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ) : (
              <p>
                Showing {protocols.length} of {totalResults} results
                {totalPages > 1 && ` (Page ${currentPage + 1} of ${totalPages})`}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
            {error}
          </div>
        ) : protocols.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No results found for "{query}"</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {protocols.map((protocol) => (
                <ProtocolCard
                  key={protocol.id}
                  title={protocol.title}
                  legislature={protocol.legislatureperiod.toString()}
                  number={protocol.number.toString()}
                  year={new Date(protocol.date).getFullYear().toString()}
                  summary={protocol.first_speech_summary || ''}
                  firstSpeechId={protocol.first_speech_id}
                  onOpenModal={() => {
                    setSelectedProtocol(protocol);
                    setIsModalOpen(true);
                  }}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex justify-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="px-4 py-2 border rounded-md disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1}
                  className="px-4 py-2 border rounded-md disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {selectedProtocol && (
        <ProtocolModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedProtocol(null);
          }}
          protocol={selectedProtocol}
        />
      )}
    </div>
  );
};

export default SearchResults;