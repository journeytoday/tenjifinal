import React from 'react';
import { Pencil, X } from 'lucide-react';

interface EditableProfileFieldProps {
  label: string;
  value: string;
  isEditing: boolean;
  onEdit: () => void;
  onCancel?: () => void;
  onChange: (value: string) => void;
  type?: 'text' | 'select';
  options?: { value: string; label: string }[];
  editable?: boolean;
}

const EditableProfileField = ({
  label,
  value,
  isEditing,
  onEdit,
  onCancel,
  onChange,
  type = 'text',
  options = [],
  editable = true
}: EditableProfileFieldProps) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        {isEditing && editable ? (
          <div className="relative">
            {type === 'select' ? (
              <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full p-2 pr-20 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{value || 'Select...'}</option>
                {options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full p-2 pr-20 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
            {onCancel && (
              <button
                onClick={onCancel}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                title="Cancel editing"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            )}
          </div>
        ) : (
          <div className="p-2 bg-gray-100 border border-gray-300 rounded-md flex justify-between items-center">
            <span>{value || 'Not specified'}</span>
            {editable && (
              <button
                onClick={onEdit}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                title="Edit field"
              >
                <Pencil className="h-4 w-4 text-gray-500" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EditableProfileField;