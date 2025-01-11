import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';

interface ProtocolModalProps {
  isOpen: boolean;
  onClose: () => void;
  protocol?: {
    id: string;
    title: string;
    legislatureperiod: number;
    number: number;
    date: string;
  };
}

interface AgendaItem {
  id: string;
  title: string;
  description: string;
  matchag: string;
}

interface Speech {
  nlpspeechid: string;
  speakerid: string;
  getabstractsummarypegasus: string;
  matchag: string;
  speaker_name?: string;
}

const ProtocolModal = ({ isOpen, onClose, protocol }: ProtocolModalProps) => {
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
  const [speeches, setSpeeches] = useState<Speech[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');
  const [activeAgendaItem, setActiveAgendaItem] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    if (protocol?.id) {
      fetchAgendaItems(protocol.id);
    }
  }, [protocol]);

  useEffect(() => {
    if (activeAgendaItem) {
      const activeItem = agendaItems.find(item => item.id === activeAgendaItem);
      if (activeItem) {
        fetchSpeeches(activeItem.matchag);
      }
    }
  }, [activeAgendaItem]);

  const fetchAgendaItems = async (protocolId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('agendaitem')
        .select('*')
        .eq('protocolid', protocolId)
        .order('matchag', { ascending: true });

      if (error) throw error;

      const sortedAgendaItems = (data || []).sort((a, b) => 
        a.matchag.localeCompare(b.matchag)
      );

      setAgendaItems(sortedAgendaItems);
      if (sortedAgendaItems[0]) {
        setActiveAgendaItem(sortedAgendaItems[0].id);
      }
    } catch (error) {
      console.error('Error fetching agenda items:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSpeeches = async (matchag: string) => {
    try {
      // First fetch the speeches
      const { data: speechesData, error: speechesError } = await supabase
        .from('speech')
        .select('nlpspeechid, speakerid, getabstractsummarypegasus, matchag')
        .eq('matchag', matchag)
        .order('nlpspeechid', { ascending: true });

      if (speechesError) throw speechesError;

      if (speechesData && speechesData.length > 0) {
        // Get unique speaker IDs
        const speakerIds = [...new Set(speechesData.map(speech => speech.speakerid))];

        // Fetch speaker details
        const { data: speakersData, error: speakersError } = await supabase
          .from('speaker')
          .select('speakerid, fullname')
          .in('speakerid', speakerIds);

        if (speakersError) throw speakersError;

        // Create a map of speaker IDs to full names
        const speakerMap = new Map(
          speakersData?.map(speaker => [speaker.speakerid, speaker.fullname]) || []
        );

        // Combine speech data with speaker names
        const speechesWithNames = speechesData.map(speech => ({
          ...speech,
          speaker_name: speakerMap.get(speech.speakerid) || `Speaker ${speech.speakerid}`
        }));

        setSpeeches(speechesWithNames);
        if (speechesWithNames.length > 0) {
          setActiveTab(speechesWithNames[0].nlpspeechid);
        }
      } else {
        setSpeeches([]);
      }
    } catch (error) {
      console.error('Error fetching speeches:', error);
    }
  };

  if (!isOpen || !protocol) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white rounded-t-lg">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{protocol.title}</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-6 text-sm">
              <div>
                <span className="text-gray-500">{t.protocols.legislature}: </span>
                <span>{protocol.legislatureperiod}</span>
              </div>
              <div>
                <span className="text-gray-500">{t.protocols.number}: </span>
                <span>{protocol.number}</span>
              </div>
              <div>
                <span className="text-gray-500">{t.protocols.year}: </span>
                <span>{new Date(protocol.date).getFullYear()}</span>
              </div>
            </div>
          </div>

          {/* Sticky Agenda Item Tabs */}
          <div className="flex border-b border-gray-200 overflow-x-auto bg-white">
            {loading ? (
              <div className="p-4 flex justify-center w-full">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              agendaItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveAgendaItem(item.id)}
                  className={`
                    px-6 py-3 text-sm font-medium whitespace-nowrap
                    ${activeAgendaItem === item.id 
                      ? 'border-b-2 border-blue-500 text-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'}
                  `}
                >
                  {item.title}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Content Area with Fixed Height */}
        <div className="flex flex-1 min-h-0">
          {/* Vertical Tabs for Speeches */}
          <div className="w-64 border-r border-gray-200 overflow-y-auto bg-gray-50">
            {speeches.length > 0 ? (
              speeches.map((speech) => (
                <button
                  key={speech.nlpspeechid}
                  onClick={() => setActiveTab(speech.nlpspeechid)}
                  className={`
                    w-full text-left py-2 px-3 rounded-md mb-2
                    ${activeTab === speech.nlpspeechid 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'hover:bg-gray-100'}
                  `}
                >
                  {speech.speaker_name}
                </button>
              ))
            ) : (
              <div className="p-4 text-sm text-gray-500 text-center">
                {t.protocols.noResults}
              </div>
            )}
          </div>

          {/* Speech Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-white">
            {speeches.length > 0 ? (
              speeches
                .filter(speech => activeTab === speech.nlpspeechid)
                .map(speech => (
                  <div key={speech.nlpspeechid}>
                    <h3 className="font-semibold mb-4">{speech.speaker_name}</h3>
                    <div className="prose max-w-none">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {speech.getabstractsummarypegasus}
                      </p>
                    </div>
                  </div>
                ))
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <p className="mb-2">{t.protocols.noResults}</p>
                  <p className="text-sm">{t.protocols.loading}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProtocolModal;