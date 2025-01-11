import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { processJSONFile, processSpeakerFile } from '../../lib/data/importData';

const DataImport = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<string[]>([]);
  const { t } = useLanguage();

  const addProgress = (message: string) => {
    setProgress(prev => [...prev, message]);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsProcessing(true);
    setProgress([]);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        addProgress(`Processing ${file.name}...`);

        if (file.name === 'speaker-details.json') {
          await processSpeakerFile(file);
          addProgress(`✓ Processed speaker data from ${file.name}`);
        } else {
          await processJSONFile(file);
          addProgress(`✓ Processed protocol data from ${file.name}`);
        }
      }

      addProgress('✓ All files processed successfully');
    } catch (error) {
      addProgress(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Data Import</h2>
        
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700">Select JSON files to import:</span>
            <input
              type="file"
              multiple
              accept=".json"
              onChange={handleFileUpload}
              disabled={isProcessing}
              className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                disabled:opacity-50"
            />
          </label>
        </div>

        {progress.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <h3 className="font-semibold mb-2">Progress:</h3>
            <div className="space-y-1">
              {progress.map((message, index) => (
                <div key={index} className="text-sm">
                  {message}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataImport;