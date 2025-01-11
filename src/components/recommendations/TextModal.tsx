import React, { useState } from 'react';
import ModalHeader from './modal/ModalHeader';
import HorizontalTabs, { HorizontalTab } from './modal/HorizontalTabs';
import VerticalTabs, { VerticalTab } from './modal/VerticalTabs';
import ModalContent from './modal/ModalContent';

interface TextModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TextModal = ({ isOpen, onClose }: TextModalProps) => {
  const [horizontalTab, setHorizontalTab] = useState<HorizontalTab>('decision');
  const [verticalTab, setVerticalTab] = useState<VerticalTab>('headnotes');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        <ModalHeader onClose={onClose} />
        <HorizontalTabs 
          activeTab={horizontalTab} 
          onTabChange={setHorizontalTab} 
        />
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <VerticalTabs 
            activeTab={verticalTab} 
            onTabChange={setVerticalTab} 
          />
          <ModalContent 
            horizontalTab={horizontalTab} 
            verticalTab={verticalTab} 
          />
        </div>
      </div>
    </div>
  );
};

export default TextModal;