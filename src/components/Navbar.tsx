import React from 'react';
import Logo from './Logo';
import NavButton from './buttons/NavButton';
import LanguageButton from './buttons/LanguageButton';
import UserDropdown from './buttons/UserDropdown';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles } from 'lucide-react';

interface NavbarProps {
  onNavigate: (page: 'home' | 'login' | 'signup' | 'profile' | 'trail') => void;
}

const Navbar = ({ onNavigate }: NavbarProps) => {
  const { t } = useLanguage();
  const { user, isGuest } = useAuth();

  return (
    <nav className="bg-white px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Logo onNavigate={onNavigate} />
        
        <div className="flex items-center space-x-4">
          {user && !isGuest && (
            <NavButton onClick={() => onNavigate('trail')}>
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5" />
                <span>Try Recommendation</span>
              </div>
            </NavButton>
          )}
          <NavButton>
            <div className="flex items-center space-x-2 start-tour-btn">
                <Sparkles className="h-5 w-5" />
                <span>{t.navbar.startTour}</span>
              </div>
            </NavButton>
          <LanguageButton />
          <UserDropdown onNavigate={onNavigate} />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;