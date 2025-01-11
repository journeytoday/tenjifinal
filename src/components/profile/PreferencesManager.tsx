import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { X } from 'lucide-react';

interface PreferencesManagerProps {
  preferences: string[];
  onAddPreference: (preference: string) => Promise<void>;
  onRemovePreference: (preference: string) => Promise<void>;
  isDisabled?: boolean;
}

const PreferencesManager = ({ preferences, onAddPreference, onRemovePreference, isDisabled = false }: PreferencesManagerProps) => {
  const [newPreference, setNewPreference] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  const handleAdd = async () => {
    if (isDisabled) {
      setError('Enable data sharing to manage preferences');
      return;
    }

    if (!newPreference.trim()) return;
    
    setError(null);
    if (preferences.length >= 5) {
      setError(t.preferences.maxLimit);
      return;
    }

    try {
      await onAddPreference(newPreference.trim());
      setNewPreference('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add preference');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={newPreference}
          onChange={(e) => setNewPreference(e.target.value)}
          placeholder={isDisabled ? 'Enable data sharing to add preferences' : t.preferences.placeholder}
          disabled={isDisabled}
          className={`
            flex-1 p-2 border border-gray-300 rounded-md 
            focus:outline-none focus:ring-2 focus:ring-blue-500
            ${isDisabled ? 'bg-gray-100 cursor-not-allowed' : ''}
          `}
        />
        <button
          onClick={handleAdd}
          disabled={isDisabled || preferences.length >= 5}
          className={`
            px-4 py-2 text-white rounded-md
            ${isDisabled 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'}
          `}
        >
          {t.preferences.add}
        </button>
      </div>

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      <div className="flex flex-wrap gap-2">
        {preferences.map((pref, idx) => (
          <div
            key={idx}
            className={`
              flex items-center gap-2 px-3 py-1 rounded-full
              ${isDisabled ? 'bg-gray-100' : 'bg-gray-100'}
            `}
          >
            <span>{pref}</span>
            {!isDisabled && (
              <button
                onClick={() => onRemovePreference(pref)}
                className="p-1 hover:bg-gray-200 rounded-full"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PreferencesManager;