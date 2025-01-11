import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import RecommendationCard from './RecommendationCard';
import TextModal from './TextModal';
import { useLanguage } from '../../contexts/LanguageContext';

const mockData = [
  {
    id: 1,
    title: 'Verfassungsgerichtshof',
    legislature: '20',
    year: '1964',
    number: '201',
    type: 'Beschluss',
    summary: 'Die Verfassungsbeschwerde wird, soweit sie die Verletzung des Rechts auf rechtliches Gehör rügt, verworfen; im übrigen wird sie...',
    tag: 'Bundestagsmine'
  },
  {
    id: 2,
    title: 'Bundesverfassungsgericht',
    legislature: '20',
    year: '1964',
    number: '202',
    type: 'Beschluss',
    summary: 'Die Verfassungsbeschwerde wird, soweit sie die Verletzung des Rechts auf rechtliches Gehör rügt, verworfen; im übrigen wird sie...',
    tag: 'Bundestagsmine'
  },
  {
    id: 3,
    title: 'Landesverfassungsgericht',
    legislature: '20',
    year: '1964',
    number: '203',
    type: 'Beschluss',
    summary: 'Die Verfassungsbeschwerde wird, soweit sie die Verletzung des Rechts auf rechtliches Gehör rügt, verworfen; im übrigen wird sie...',
    tag: 'Bundestagsmine'
  },
  {
    id: 4,
    title: 'Oberverwaltungsgericht',
    legislature: '20',
    year: '1964',
    number: '204',
    type: 'Beschluss',
    summary: 'Die Verfassungsbeschwerde wird, soweit sie die Verletzung des Rechts auf rechtliches Gehör rügt, verworfen; im übrigen wird sie...',
    tag: 'Bundestagsmine'
  },
  {
    id: 5,
    title: 'Verwaltungsgericht',
    legislature: '20',
    year: '1964',
    number: '205',
    type: 'Beschluss',
    summary: 'Die Verfassungsbeschwerde wird, soweit sie die Verletzung des Rechts auf rechtliches Gehör rügt, verworfen; im übrigen wird sie...',
    tag: 'Bundestagsmine'
  }
];

const RecommendationsSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const cardsPerPage = 3;
  const { t } = useLanguage();

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(Math.ceil(mockData.length / cardsPerPage) - 1, prev + 1));
  };

  return (
    <div className="mt-12">
      <div className="h-px bg-gray-200 mb-8" />
      
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          {t.recommendations.title}
        </h2>

        <div className="relative">
          <div className="flex justify-between items-center gap-4">
            <button
              onClick={handlePrevPage}
              className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentPage === 0}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
              {mockData
                .slice(currentPage * cardsPerPage, (currentPage + 1) * cardsPerPage)
                .map((item) => (
                  <RecommendationCard
                    key={item.id}
                    {...item}
                    onOpenModal={() => setIsModalOpen(true)}
                  />
                ))}
            </div>

            <button
              onClick={handleNextPage}
              className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentPage >= Math.ceil(mockData.length / cardsPerPage) - 1}
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      <TextModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default RecommendationsSection;