import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

interface DataSharingDialogProps {
  onCancel: () => void;
  onConfirm: () => void;
}

const DataSharingDialog = ({ onCancel, onConfirm }: DataSharingDialogProps) => {
  const { t } = useLanguage();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Turn Off Data Sharing?
        </h2>
        
        <p className="text-gray-600 mb-6">
          Turning off data sharing will delete your stored preferences and search history. 
          You will no longer receive personalized recommendations. Are you sure you want to continue?
        </p>

        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
          >
            {t.profile.cancel}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
          >
            {t.profile.confirm}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataSharingDialog;