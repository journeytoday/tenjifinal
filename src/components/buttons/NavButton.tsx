import React from 'react';

interface NavButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  rounded?: 'full' | 'lg';
}

const NavButton = ({ children, onClick, rounded = 'lg' }: NavButtonProps) => {
  return (
    <button 
      onClick={onClick}
      className={`
        ${rounded === 'full' ? 'rounded-full p-2' : 'rounded-lg px-4 py-2'} 
        border border-gray-200 
        hover:bg-gray-50 
        transition-colors
      `}
    >
      {children}
    </button>
  );
};

export default NavButton;