import { useState, useCallback } from 'react';
import { executeQuery } from '../lib/neo4j/queries';

export const useNeo4j = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const runQuery = useCallback(async (
    cypher: string,
    params?: Record<string, any>
  ) => {
    setLoading(true);
    setError(null);

    try {
      const result = await executeQuery(cypher, params);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { runQuery, loading, error };
};