import neo4j from 'neo4j-driver';

const NEO4J_URI = "neo4j+s://c9bffda5.databases.neo4j.io";
const NEO4J_USERNAME = "neo4j";
const NEO4J_PASSWORD = "KBIOyMEnsGbWWOxW8NepR86WaDkkICfvpgC0nGDv5WE";

let driver = null;

export const initNeo4j = async () => {
  if (driver) {
    return driver;
  }

  try {
    driver = neo4j.driver(
      NEO4J_URI,
      neo4j.auth.basic(NEO4J_USERNAME, NEO4J_PASSWORD)
    );

    // Verify connectivity
    await driver.verifyConnectivity();
    console.log('Connected to Neo4j successfully');

    // Create constraints
    const session = driver.session();
    try {
      const constraints = [
        "CREATE CONSTRAINT trial_id_unique IF NOT EXISTS FOR (t:Trial) REQUIRE t.Trial_id IS UNIQUE"
      ];

      for (const constraint of constraints) {
        await session.run(constraint);
        console.log('Constraint created:', constraint);
      }

      // Verify constraints
      const result = await session.run('SHOW CONSTRAINTS');
      console.log('Current constraints:', result.records);
    } finally {
      await session.close();
    }
    
    return driver;
  } catch (error) {
    console.error('Error connecting to Neo4j:', error);
    throw error;
  }
};

export const closeNeo4j = async () => {
  if (driver) {
    await driver.close();
    driver = null;
    console.log('Neo4j connection closed');
  }
};