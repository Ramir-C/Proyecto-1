const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/diagnostico',
  // si tu proveedor requiere SSL, descomenta y ajusta:
  // ssl: { rejectUnauthorized: false }
});

module.exports = pool;
