import React from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';

interface ModalHeaderProps {
  onClose: () => void;
}

const ModalHeader = ({ onClose }: ModalHeaderProps) => {
  const { t } = useLanguage();
  
  return (
    <div className="p-6 border-b border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">BVerfGE 1 14</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6 text-sm">
        <div>
          <span className="text-gray-500">{t.modal.name}: </span>
          <span>Südweststaat</span>
        </div>
        <div>
          <span className="text-gray-500">{t.modal.year}: </span>
          <span>1951</span>
        </div>
        <div>
          <span className="text-gray-500">{t.modal.type}: </span>
          <span>Urteil</span>
        </div>
      </div>
    </div>
  );
};

export default ModalHeader;