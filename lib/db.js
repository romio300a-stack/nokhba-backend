const { Pool } = require("pg");

let pool;

function getPool() {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL مش متضبط في الـ Environment Variables");
    }
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }, // مطلوب للاتصال بـ Neon عبر TCP العادي
      max: 5, // عدد اتصالات محدود يناسب بيئة serverless
    });
  }
  return pool;
}

module.exports = { getPool };
