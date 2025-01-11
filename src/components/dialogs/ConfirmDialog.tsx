import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

interface ConfirmDialogProps {
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
}

const ConfirmDialog = ({ title, message, onCancel, onConfirm }: ConfirmDialogProps) => {
  const { t } = useLanguage();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {title}
        </h2>
        
        <p className="text-gray-600 mb-6">
          {message}
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
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            {t.profile.confirm}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;