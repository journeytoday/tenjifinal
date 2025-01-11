import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface ProtocolCardProps {
  title: string;
  legislature: string;
  number: string;
  year: string;
  summary: string;
  firstSpeechId?: string;
  onOpenModal: () => void;
}

const ProtocolCard = ({
  title,
  legislature,
  number,
  year,
  summary,
  firstSpeechId,
  onOpenModal
}: ProtocolCardProps) => {
  const { t } = useLanguage();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6 w-full max-w-md">
      <div className="flex justify-between items-start mb-4">
        <h3 
          className="font-medium text-gray-900 truncate flex-1 relative group"
          title={title}
        >
          <span className="truncate block">{title}</span>
          <span className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity absolute left-0 -bottom-1 translate-y-full bg-gray-900 text-white text-sm rounded px-2 py-1 w-full z-10">
            {title}
          </span>
        </h3>
        <button 
          onClick={onOpenModal}
          className="ml-2 px-3 py-1 text-sm bg-white border border-gray-200 rounded hover:bg-gray-50"
        >
          {t.protocols.inText}
        </button>
      </div>

      <div className="h-px bg-gray-200 -mx-6 mb-4" />

      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
        <div>
          <span className="text-gray-500">{t.protocols.legislature}: </span>
          <span>{legislature}</span>
        </div>
        <div className="text-right">
          <span className="text-gray-500">{t.protocols.number}: </span>
          <span>{number}</span>
        </div>
        <div>
          <span className="text-gray-500">{t.protocols.year}: </span>
          <span>{year}</span>
        </div>
        <div className="text-right">
          <span className="text-gray-500">{t.protocols.type}: </span>
          <span>Speech</span>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">{t.protocols.summary}:</h4>
        <p className="text-sm text-gray-600 line-clamp-3">{summary || 'No summary available'}</p>
      </div>

      <div className="flex items-center justify-between text-sm">
        <button 
          onClick={onOpenModal}
          className="font-medium text-gray-900 hover:text-gray-700 flex items-center"
        >
          More
          <ChevronRight className="h-4 w-4 ml-1" />
        </button>
        {firstSpeechId ? (
          <a
            href={`https://bundestag-mine.de/publicviews/SpeechfulltextAnalysisWindow?speechId=${firstSpeechId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            Bundestagsmine
          </a>
        ) : (
          <span className="text-gray-500">Bundestagsmine</span>
        )}
      </div>
    </div>
  );
};

export default ProtocolCard;