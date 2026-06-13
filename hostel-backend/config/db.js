const { Pool } = require('pg');
require('dotenv').config();

if (!process.env.DATABASE_URL) {
  console.error('❌ FATAL: DATABASE_URL environment variable is not set.');
  console.error('   Set it in your .env file (local) or in the Vercel / Railway dashboard (production).');
  process.exit(1);
}

// Enable SSL whenever the connection string requires it (Neon, Supabase, Render, Railway all do)
// This works both in development and production — SSL is driven by the URL, not NODE_ENV
const requiresSsl = process.env.DATABASE_URL.includes('sslmode=require') ||
                    process.env.DATABASE_URL.includes('neon.tech') ||
                    process.env.DATABASE_URL.includes('supabase') ||
                    process.env.DATABASE_URL.includes('render.com') ||
                    process.env.DATABASE_URL.includes('railway.app');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: requiresSsl ? { rejectUnauthorized: false } : false,
  // Connection pool settings
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Log connection errors so they surface in deployment logs
pool.on('error', (err) => {
  console.error('❌ Unexpected PostgreSQL pool error:', err.message);
});

// Validate the connection on startup
pool.query('SELECT 1').then(() => {
  console.log('✅ PostgreSQL connected successfully.');
}).catch((err) => {
  console.error('❌ PostgreSQL connection failed:', err.message);
  console.error('   Check your DATABASE_URL and ensure the database server is reachable.');
  // Don't exit — let the process start; individual queries will surface errors per-request
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  connect: () => pool.connect(),
  on: (event, handler) => pool.on(event, handler),
  pool,
};
