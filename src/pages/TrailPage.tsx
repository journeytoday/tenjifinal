import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Logo from '../components/Logo';

interface TrialPageProps {
  onNavigate: (page: 'home' | 'login' | 'signup' | 'profile') => void;
}

interface UserData {
  id: string;
  preferences: string[];
  searchQueries: string[];
  distinctQueries: string[];
}

const isProperNoun = (word: string): boolean => {
  return /^[A-Z][a-z]+$/.test(word);
};

const processQueries = (queries: string[]): string[] => {
  // Remove empty strings and trim whitespace
  const cleanQueries = queries.filter(q => q?.trim()).map(q => q.trim());
  
  // Create a map to track word occurrences, preserving proper nouns
  const wordMap = new Map<string, boolean>(); // value is true if it's a proper noun
  
  cleanQueries.forEach(query => {
    const words = query.split(/\s+/);
    words.forEach(word => {
      const isProper = isProperNoun(word);
      // Add word if it's not in map, or if it's a proper noun
      if (!wordMap.has(word.toLowerCase()) || isProper) {
        wordMap.set(word.toLowerCase(), isProper);
      }
    });
  });
  
  return Array.from(wordMap.entries())
    .map(([word, isProper]) => isProper ? word.charAt(0).toUpperCase() + word.slice(1) : word)
    .sort();
};

const TrialPage = ({ onNavigate }: TrialPageProps) => {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        // First get user profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, preferences')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        const userid = profileData.id;
        const querys = profileData.preferences || [];

        // Then get search history for this user
        const { data: searchData, error: searchError } = await supabase
          .from('search_history')
          .select('query')
          .eq('user_id', userid)
          .order('created_at', { ascending: false });

        if (searchError) throw searchError;

        // Add search queries to the querys array
        const searchQueries = searchData.map(item => item.query);
        querys.push(...searchQueries);

        // Process queries to get distinct values
        const distinctQueries = processQueries(querys);

        console.log('User ID:', userid);
        console.log('Combined Querys:', querys);
        console.log('Distinct Querys:', distinctQueries);

        setUserData({
          id: userid,
          preferences: profileData.preferences || [],
          searchQueries: searchQueries,
          distinctQueries
        });
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <Logo onNavigate={onNavigate} />
        </div>
      </div>
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Trial Page</h1>
        
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
            {error}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">User ID:</h2>
              <code className="bg-gray-100 px-2 py-1 rounded">{userData?.id}</code>
            </div>
            
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">Preferences:</h2>
              {userData?.preferences.length ? (
                <ul className="list-disc pl-5">
                  {userData.preferences.map((pref, idx) => (
                    <li key={`pref-${idx}`}>{pref}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No preferences set</p>
              )}
            </div>

            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">Search History:</h2>
              {userData?.searchQueries.length ? (
                <ul className="list-disc pl-5">
                  {userData.searchQueries.map((query, idx) => (
                    <li key={`search-${idx}`}>{query}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No search history</p>
              )}
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Distinct Keywords:</h2>
              {userData?.distinctQueries.length ? (
                <div className="flex flex-wrap gap-2">
                  {userData.distinctQueries.map((query, idx) => (
                    <span 
                      key={`distinct-${idx}`}
                      className={`px-3 py-1 rounded-full text-sm ${
                        isProperNoun(query) 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {query}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No distinct keywords</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default TrialPage;