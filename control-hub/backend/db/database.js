const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "devops_logs.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ DB connection failed", err.message);
  } else {
    console.log("✅ Connected to DevOps Logs DB");
  }
});

db.run(`
  CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tool TEXT,
    action TEXT,
    status TEXT,
    details TEXT,
    timestamp TEXT
  )
`);

module.exports = db;
