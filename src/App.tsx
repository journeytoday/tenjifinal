import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import SearchContainer from './components/search/SearchContainer';
import ProtocolsSection from './components/protocols/ProtocolsSection';
import SearchResults from './components/search/SearchResults';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ProfilePage from './pages/ProfilePage';
import ImportPage from './pages/ImportPage';
import TrailPage from './pages/TrailPage';
import ProtocolFilterDrawer from './components/protocols/ProtocolFilterDrawer';
import Tour from './components/Tour';

interface Filters {
  legislaturePeriod: number | null;
  number: number | null;
  year: number | null;
}

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'login' | 'signup' | 'profile' | 'import' | 'trail'>('home');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    legislaturePeriod: null,
    number: null,
    year: null
  });

  const handleFilterChange = (filterType: keyof Filters, value: number | null) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'login':
        return <LoginPage onNavigate={setCurrentPage} />;
      case 'signup':
        return <SignUpPage onNavigate={setCurrentPage} />;
      case 'profile':
        return <ProfilePage onNavigate={setCurrentPage} />;
      case 'import':
        return <ImportPage onNavigate={setCurrentPage} />;
      case 'trail':
        return <TrailPage onNavigate={setCurrentPage} />;
      default:
        return (
          <>
            <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
              <Navbar onNavigate={setCurrentPage} />
              <SearchContainer 
                isFilterDrawerOpen={isFilterDrawerOpen}
                onFilterDrawerOpen={() => setIsFilterDrawerOpen(true)}
                onFilterDrawerClose={() => setIsFilterDrawerOpen(false)}
                filters={filters}
                onFilterChange={handleFilterChange}
              />
            </div>
            <Routes>
              <Route 
                path="/" 
                element={
                  <main className="max-w-7xl mx-auto px-4 py-8">
                    <ProtocolsSection filters={filters} />
                  </main>
                } 
              />
              <Route 
                path="/search" 
                element={
                  <SearchResults query={new URLSearchParams(window.location.search).get('q') || ''} />
                } 
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            <ProtocolFilterDrawer
              isOpen={isFilterDrawerOpen}
              onClose={() => setIsFilterDrawerOpen(false)}
              legislaturePeriods={[19, 20, 21]}
              numbers={Array.from({ length: 250 }, (_, i) => i + 1)}
              years={[2020, 2021, 2022, 2023, 2024]}
              selectedFilters={filters}
              onFilterChange={handleFilterChange}
            />
          </>
        );
    }
  };

  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <div className="min-h-screen bg-white flex flex-col">
            {renderContent()}
          </div>
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;