import React, { useState } from 'react';
import DataImport from '../components/data/DataImport';
import DataVerification from '../components/data/DataVerification';
import Logo from '../components/Logo';

interface ImportPageProps {
  onNavigate: (page: 'home' | 'login' | 'signup' | 'profile') => void;
}

const ImportPage = ({ onNavigate }: ImportPageProps) => {
  const [activeTab, setActiveTab] = useState<'import' | 'verify'>('import');

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <Logo onNavigate={onNavigate} />
        </div>
      </div>
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 flex space-x-4">
          <button
            onClick={() => setActiveTab('import')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'import'
                ? 'bg-gray-800 text-white'
                : 'bg-white text-gray-800 hover:bg-gray-50'
            }`}
          >
            Import Data
          </button>
          <button
            onClick={() => setActiveTab('verify')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'verify'
                ? 'bg-gray-800 text-white'
                : 'bg-white text-gray-800 hover:bg-gray-50'
            }`}
          >
            Verify Data
          </button>
        </div>

        {activeTab === 'import' ? <DataImport /> : <DataVerification />}
      </main>
    </div>
  );
};

export default ImportPage;