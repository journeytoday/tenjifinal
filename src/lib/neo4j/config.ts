import { Driver } from 'neo4j-driver';

const NEO4J_URI = "https://e672f020.databases.neo4j.io";
const NEO4J_USERNAME = "neo4j";
const NEO4J_PASSWORD = "SF0uhAFrQu_If9xB3rTmxMfTGgovMxrLg0jdXMhgqKA";

const headers = {
  'Authorization': `Basic ${btoa(`${NEO4J_USERNAME}:${NEO4J_PASSWORD}`)}`,
  'Content-Type': 'application/json',
  'Accept': 'application/json;charset=UTF-8',
  'X-Stream': 'true'
};

export const executeNeo4jQuery = async (query: string, params: Record<string, any> = {}) => {
  try {
    const response = await fetch(`${NEO4J_URI}/db/neo4j/tx/commit`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        statements: [{
          statement: query,
          parameters: params
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.errors && data.errors.length > 0) {
      throw new Error(data.errors[0].message);
    }

    return data.results[0].data.map((item: any) => {
      const record: Record<string, any> = {};
      item.row.forEach((value: any, index: number) => {
        record[data.results[0].columns[index]] = value;
      });
      return record;
    });
  } catch (error) {
    console.error('Neo4j query error:', error);
    throw error;
  }
};