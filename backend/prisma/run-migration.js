const fs = require("fs");
const path = require("path");
const { pool } = require("../src/config/database");

console.log("=========================================");
console.log("      POSTGRESQL SCHEMA MIGRATOR         ");
console.log("=========================================");

async function migrate() {
  const sqlPath = path.join(__dirname, "migration.sql");
  console.log(`Reading SQL file from: ${sqlPath}`);
  
  let sql;
  try {
    sql = fs.readFileSync(sqlPath, "utf8");
  } catch (err) {
    console.error("Failed to read migration.sql file:", err.message);
    process.exit(1);
  }

  console.log("Connecting to the database...");
  const client = await pool.connect();
  try {
    console.log("Connected successfully. Running migration transactions...");
    
    // Start transaction
    await client.query("BEGIN");
    
    // Run SQL queries
    await client.query(sql);
    
    // Commit transaction
    await client.query("COMMIT");
    
    console.log("SUCCESS! All tables and indexes created successfully.");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("MIGRATION FAILED! Transaction rolled back.");
    console.error("Error details:", error.message || error);
  } finally {
    client.release();
    await pool.end();
    console.log("=========================================");
  }
}

migrate();
