import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const LanguageButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentLanguage, setLanguage, languages } = useLanguage();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 rounded-lg px-4 py-2 border border-gray-200 hover:bg-gray-50 transition-colors"
      >
        <Globe className="h-4 w-4" />
        <span>{currentLanguage.code}</span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="py-1" role="menu">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang);
                  setIsOpen(false);
                }}
                className={`
                  ${currentLanguage.code === lang.code ? 'bg-gray-100' : ''}
                  w-full text-left px-4 py-2 text-sm hover:bg-gray-50
                `}
                role="menuitem"
              >
                <span className="font-medium">{lang.code}</span>
                <span className="ml-2 text-gray-500">{lang.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageButton;