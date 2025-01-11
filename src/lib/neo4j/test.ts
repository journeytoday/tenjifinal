import { initNeo4j } from './config';

async function testConnection() {
  try {
    const driver = await initNeo4j();
    const session = driver.session();

    try {
      // Create the constraint
      await session.run(`
        CREATE CONSTRAINT trial_id_unique IF NOT EXISTS 
        FOR (t:Trial) 
        REQUIRE t.Trial_id IS UNIQUE
      `);
      console.log('Constraint created successfully');

      // Verify the constraint
      const result = await session.run('SHOW CONSTRAINTS');
      console.log('Current constraints:', result.records);
    } finally {
      await session.close();
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testConnection();