import React from 'react';

interface SearchButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  label: string;
  active?: boolean;
}

const SearchButton = ({ icon, onClick, label, active }: SearchButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 rounded-lg border border-gray-200 
        flex items-center space-x-2
        hover:bg-gray-50 transition-colors
        ${active ? 'bg-blue-50 border-blue-200' : ''}
      `}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

export default SearchButton;