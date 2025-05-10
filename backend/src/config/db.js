require('dotenv').config();
const knex = require('knex');

const db = knex({
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
  pool: { min: 2, max: 10 },
});

// Test the connection
(async () => {
  try {
    // Run a simple query to test the connection
    await db.raw('SELECT 1+1 AS result');
    console.log('Database connection successful!');
  } catch (error) {
    console.error('Error connecting to the database:', error.message);
  }
})();

module.exports = db;

