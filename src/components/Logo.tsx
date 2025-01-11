import React from 'react';

interface LogoProps {
  onNavigate?: (page: 'home' | 'login' | 'signup' | 'profile') => void;
}

const Logo = ({ onNavigate }: LogoProps) => {
  const handleClick = () => {
    if (window.location.pathname === '/') {
      window.location.reload();
    } else if (onNavigate) {
      onNavigate('home');
    }
  };

  return (
    <button 
      onClick={handleClick}
      className="flex items-center justify-center hover:opacity-80 transition-opacity"
    >
      <img 
        src="/tenji-logo.svg" 
        alt="TENJI Logo" 
        className="h-12 w-12"
      />
    </button>
  );
};

export default Logo;