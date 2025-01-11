import React from 'react';
import { User } from 'lucide-react';
import NavButton from './NavButton';
import { useAuth } from '../../contexts/AuthContext';

const GuestIcon = () => (
  <svg 
    width="20" 
    height="20" 
    viewBox="0 0 50 50" 
    className="text-gray-700"
  >
    <g transform="translate(0,50) scale(0.1,-0.1)" fill="currentColor">
      <path d="M184 489 c-47 -13 -58 -34 -60 -108 -1 -47 4 -77 17 -103 31 -61 26 -74 -41 -108 -58 -29 -80 -53 -80 -84 0 -14 18 -16 120 -16 l120 0 0 -30 0 -30 110 0 110 0 0 48 c0 26 3 71 6 99 l7 53 -53 0 c-42 0 -51 3 -47 15 7 18 -9 30 -17 13 -5 -11 -7 -11 -12 0 -8 17 -24 5 -17 -13 4 -12 -3 -15 -31 -15 -42 0 -45 12 -18 68 18 37 27 129 16 164 -11 35 -83 61 -130 47z m74 -24 c17 -9 33 -24 36 -33 10 -33 -1 -117 -20 -157 -14 -29 -19 -60 -18 -112 l1 -73 -109 0 c-106 0 -108 0 -98 20 6 12 37 33 68 48 66 31 76 58 46 120 -20 43 -28 136 -13 164 10 18 41 36 65 37 6 1 25 -6 42 -14z m102 -290 c0 -11 -12 -15 -45 -15 -33 0 -45 4 -45 15 0 11 12 15 45 15 33 0 45 -4 45 -15z m110 0 c0 -11 -12 -15 -45 -15 -33 0 -45 4 -45 15 0 11 12 15 45 15 33 0 45 -4 45 -15z m-110 -90 l0 -55 -40 0 -40 0 0 55 0 55 40 0 40 0 0 -55z m100 0 l0 -55 -40 0 -40 0 0 55 0 55 40 0 40 0 0 -55z"/>
    </g>
  </svg>
);

const UserButton = () => {
  const { isGuest } = useAuth();

  return (
    <NavButton rounded="full">
      {isGuest ? <GuestIcon /> : <User className="h-5 w-5" />}
    </NavButton>
  );
};

export default UserButton;