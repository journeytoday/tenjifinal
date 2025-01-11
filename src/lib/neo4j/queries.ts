import { Driver, Session } from 'neo4j-driver';
import { initNeo4j } from './config';

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const executeQuery = async (
  cypher: string,
  params: Record<string, any> = {}
): Promise<any> => {
  let driver: Driver | null = null;
  let session: Session | null = null;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      driver = await initNeo4j();
      session = driver.session();
      
      const result = await session.run(cypher, params);
      return result.records;
    } catch (error) {
      console.error(`Query attempt ${attempt + 1} failed:`, error);
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (session) {
        await session.close();
        session = null;
      }

      // Wait before retrying (exponential backoff)
      if (attempt < MAX_RETRIES - 1) {
        await wait(INITIAL_RETRY_DELAY * Math.pow(2, attempt));
      }
    }
  }

  throw lastError || new Error('Failed to execute query after multiple attempts');
};