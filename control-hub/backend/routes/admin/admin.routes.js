const express = require("express");
const router = express.Router();
const adminAuth = require("../../middleware/adminAuth");
const db = require("../../db/database");

/**
 * View all logs (Admin only)
 */
router.get("/logs", adminAuth, (req, res) => {
  db.all(
    "SELECT * FROM logs ORDER BY timestamp DESC",
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

/**
 * Filter logs by tool
 */
router.get("/logs/:tool", adminAuth, (req, res) => {
  db.all(
    "SELECT * FROM logs WHERE tool = ? ORDER BY timestamp DESC",
    [req.params.tool],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

/**
 * System summary
 */
router.get("/summary", adminAuth, (req, res) => {
  db.all(
    `SELECT tool, COUNT(*) as count 
     FROM logs 
     GROUP BY tool`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({
        system: "deployX Control Hub",
        summary: rows
      });
    }
  );
});

/**
 * Clear logs (dangerous, admin only)
 */
router.delete("/logs", adminAuth, (req, res) => {
  db.run("DELETE FROM logs", [], err => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "All logs cleared" });
  });
});

module.exports = router;
