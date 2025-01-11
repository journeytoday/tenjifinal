import React from 'react';
import { ChevronRight } from 'lucide-react';

interface RecommendationCardProps {
  title: string;
  legislature: string;
  year: string;
  number: string;
  type: string;
  summary: string;
  tag: string;
  onOpenModal: () => void;
}

const RecommendationCard = ({
  title,
  legislature,
  year,
  number,
  type,
  summary,
  tag,
  onOpenModal
}: RecommendationCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6 w-full max-w-md">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-medium text-gray-900 truncate flex-1">{title}</h3>
        <button 
          onClick={onOpenModal}
          className="ml-2 px-3 py-1 text-sm bg-white border border-gray-200 rounded hover:bg-gray-50"
        >
          In the Text
        </button>
      </div>

      <div className="h-px bg-gray-200 -mx-6 mb-4" />

      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
        <div>
          <span className="text-gray-500">Legislature: </span>
          <span>{legislature}</span>
        </div>
        <div className="text-right">
          <span className="text-gray-500">Number: </span>
          <span>{number}</span>
        </div>
        <div>
          <span className="text-gray-500">Year: </span>
          <span>{year}</span>
        </div>
        <div className="text-right">
          <span className="text-gray-500">Type: </span>
          <span>{type}</span>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Summary:</h4>
        <p className="text-sm text-gray-600 line-clamp-3">{summary}</p>
      </div>

      <div className="flex items-center justify-between text-sm">
        <button 
          onClick={onOpenModal}
          className="font-medium text-gray-900 hover:text-gray-700 flex items-center"
        >
          More
          <ChevronRight className="h-4 w-4 ml-1" />
        </button>
        <span className="text-gray-500">{tag}</span>
      </div>
    </div>
  );
};

export default RecommendationCard;