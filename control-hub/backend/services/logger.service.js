const db = require("../db/database");

module.exports = function logAction(tool, action, status, details = "") {
  const timestamp = new Date().toISOString(); 

  db.run(
    `INSERT INTO logs (tool, action, status, details, timestamp)
     VALUES (?, ?, ?, ?, ?)`,
    [tool, action, status, details, timestamp]
  );
};
