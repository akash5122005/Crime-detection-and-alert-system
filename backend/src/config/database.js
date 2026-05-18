const pg = require("pg");
const dotenv = require("dotenv");
dotenv.config();

const { Pool } = pg;

const poolConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || "5432", 10),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    };

const pool = new Pool({
  ...poolConfig,
  ssl: process.env.NODE_ENV === "production" || process.env.DATABASE_URL
    ? { rejectUnauthorized: false }
    : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on("connect", () => console.log("Connected to PostgreSQL database"));
pool.on("error", (err) => console.error("DB Pool error:", err));

const db = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
};

module.exports = {
  pool,
  db
};
