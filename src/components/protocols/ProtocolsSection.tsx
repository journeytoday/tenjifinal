import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProtocolCard from './ProtocolCard';
import ProtocolModal from './ProtocolModal';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../lib/supabase';

interface Protocol {
  id: string;
  title: string;
  legislatureperiod: number;
  number: number;
  date: string;
  first_speech_id?: string;
  first_speech_summary?: string;
}

interface Filters {
  legislaturePeriod: number | null;
  number: number | null;
  year: number | null;
}

interface ProtocolsSectionProps {
  filters: Filters;
}

const ProtocolsSection = ({ filters }: ProtocolsSectionProps) => {
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cardsPerPage = 3;
  const { t } = useLanguage();

  useEffect(() => {
    fetchProtocols();
  }, [filters]); // Re-fetch when filters change

  const fetchProtocols = async () => {
    try {
      let query = supabase
        .from('protocol')
        .select('*')
        .order('date', { ascending: false });

      // Apply filters
      if (filters.legislaturePeriod !== null) {
        query = query.eq('legislatureperiod', filters.legislaturePeriod);
      }
      
      if (filters.number !== null) {
        query = query.eq('number', filters.number);
      }
      
      if (filters.year !== null) {
        const startDate = `${filters.year}-01-01`;
        const endDate = `${filters.year}-12-31`;
        query = query.gte('date', startDate).lte('date', endDate);
      }

      const { data: protocolsData, error: protocolsError } = await query;

      if (protocolsError) throw protocolsError;

      // Get speeches for filtered protocols
      const protocolsWithSpeeches = await Promise.all(
        (protocolsData || []).map(async (protocol) => {
          const { data: agendaData } = await supabase
            .from('agendaitem')
            .select('id, matchag')
            .eq('protocolid', protocol.id)
            .order('itemorder', { ascending: true })
            .limit(1);

          if (agendaData && agendaData[0]) {
            const { data: speechData } = await supabase
              .from('speech')
              .select('nlpspeechid, getabstractsummarypegasus')
              .eq('matchag', agendaData[0].matchag)
              .order('nlpspeechid', { ascending: true })
              .limit(1);

            if (speechData && speechData[0]) {
              return {
                ...protocol,
                first_speech_id: speechData[0].nlpspeechid,
                first_speech_summary: speechData[0].getabstractsummarypegasus
              };
            }
          }

          return protocol;
        })
      );

      setProtocols(protocolsWithSpeeches);
      setCurrentPage(0); // Reset to first page when filters change
    } catch (err) {
      console.error('Error fetching protocols:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch protocols');
    } finally {
      setLoading(false);
    }
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(Math.ceil(protocols.length / cardsPerPage) - 1, prev + 1));
  };

  const handleOpenModal = (protocol: Protocol) => {
    setSelectedProtocol(protocol);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="mt-12 text-center">
        <div className="h-px bg-gray-200 mb-8" />
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2 text-gray-600">{t.recommendations.loading}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-12">
        <div className="h-px bg-gray-200 mb-8" />
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <div className="h-px bg-gray-200 mb-8" />
      
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          {t.recommendations.title}
        </h2>

        {protocols.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {t.recommendations.noResults}
          </div>
        ) : (
          <>
            <div className="relative">
              <div className="flex justify-between items-center gap-4">
                <button
                  onClick={handlePrevPage}
                  className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={currentPage === 0}
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 protocol-cards">
                  {protocols
                    .slice(currentPage * cardsPerPage, (currentPage + 1) * cardsPerPage)
                    .map((protocol) => (
                      <ProtocolCard
                        key={protocol.id}
                        title={protocol.title || `${protocol.number}. Sitzung`}
                        legislature={protocol.legislatureperiod?.toString() || ''}
                        number={protocol.number?.toString() || ''}
                        year={protocol.date ? new Date(protocol.date).getFullYear().toString() : ''}
                        summary={protocol.first_speech_summary || ''}
                        firstSpeechId={protocol.first_speech_id}
                        onOpenModal={() => handleOpenModal(protocol)}
                      />
                    ))}
                </div>

                <button
                  onClick={handleNextPage}
                  className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={currentPage >= Math.ceil(protocols.length / cardsPerPage) - 1}
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="mt-4 text-center text-sm text-gray-600">
              {t.recommendations.page} {currentPage + 1} {t.recommendations.of} {Math.ceil(protocols.length / cardsPerPage)}
            </div>
          </>
        )}
      </div>

      <ProtocolModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProtocol(null);
        }}
        protocol={selectedProtocol}
      />
    </div>
  );
};

export default ProtocolsSection;