import React, { useState, useEffect } from 'react';
import { getDataCounts, getSampleData, DataCounts, SampleData } from '../../lib/data/verifyData';

const DataVerification = () => {
  const [counts, setCounts] = useState<DataCounts | null>(null);
  const [sampleData, setSampleData] = useState<SampleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [countsData, samplesData] = await Promise.all([
          getDataCounts(),
          getSampleData()
        ]);
        setCounts(countsData);
        setSampleData(samplesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2">Loading data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Data Counts */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Data Counts</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {counts && Object.entries(counts).map(([key, value]) => (
            <div key={key} className="bg-gray-50 p-4 rounded-md">
              <div className="text-sm text-gray-500 capitalize">{key}</div>
              <div className="text-2xl font-bold">{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Sample Data */}
      {sampleData && (
        <>
          {/* Recent Protocols */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Protocols</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left">ID</th>
                    <th className="px-4 py-2 text-left">Title</th>
                    <th className="px-4 py-2 text-left">Legislature Period</th>
                    <th className="px-4 py-2 text-left">Number</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sampleData.recentProtocols.map((protocol) => (
                    <tr key={protocol.id}>
                      <td className="px-4 py-2">{protocol.id}</td>
                      <td className="px-4 py-2">{protocol.title}</td>
                      <td className="px-4 py-2">{protocol.legislature_period}</td>
                      <td className="px-4 py-2">{protocol.protocol_number}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Speeches */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Speeches</h3>
            <div className="space-y-4">
              {sampleData.recentSpeeches.map((speech) => (
                <div key={speech.nlp_speech_id} className="border rounded-md p-4">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Speaker: {speech.speakers?.full_name}</span>
                    <span className="text-gray-500">ID: {speech.nlp_speech_id}</span>
                  </div>
                  <p className="text-gray-700 line-clamp-2">{speech.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Speaker Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Speaker Details</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left">ID</th>
                    <th className="px-4 py-2 text-left">Full Name</th>
                    <th className="px-4 py-2 text-left">Party</th>
                    <th className="px-4 py-2 text-left">Fraction</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sampleData.speakerDetails.map((speaker) => (
                    <tr key={speaker.speaker_id}>
                      <td className="px-4 py-2">{speaker.speaker_id}</td>
                      <td className="px-4 py-2">{speaker.full_name}</td>
                      <td className="px-4 py-2">{speaker.party}</td>
                      <td className="px-4 py-2">{speaker.fraction}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DataVerification;