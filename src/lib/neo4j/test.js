import neo4j from 'neo4j-driver';

const NEO4J_URI = "neo4j+s://e672f020.databases.neo4j.io";
const NEO4J_USERNAME = "neo4j";
const NEO4J_PASSWORD = "SF0uhAFrQu_If9xB3rTmxMfTGgovMxrLg0jdXMhgqKA";

async function testConnection() {
  let driver = null;
  let session = null;

  try {
    // Create driver instance
    driver = neo4j.driver(
      NEO4J_URI,
      neo4j.auth.basic(NEO4J_USERNAME, NEO4J_PASSWORD)
    );

    // Verify connectivity
    await driver.verifyConnectivity();
    console.log('Connected to Neo4j successfully');

    // Create session
    session = driver.session();

    // Test query with triple backticks
    const query = ```
      MATCH (n)
      RETURN count(n) as nodeCount
    ```;

    const result = await session.run(query);
    console.log('Total nodes:', result.records[0].get('nodeCount').toNumber());

    // Test constraint creation
    const createConstraint = ```
      CREATE CONSTRAINT speaker_id_unique IF NOT EXISTS
      FOR (s:Speaker)
      REQUIRE s.id IS UNIQUE
    ```;

    await session.run(createConstraint);
    console.log('Constraint created successfully');

    // Show all constraints
    const showConstraints = ```
      SHOW CONSTRAINTS
    ```;

    const constraints = await session.run(showConstraints);
    console.log('Current constraints:', constraints.records);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (session) {
      await session.close();
    }
    if (driver) {
      await driver.close();
      console.log('Connection closed');
    }
  }
}

testConnection();