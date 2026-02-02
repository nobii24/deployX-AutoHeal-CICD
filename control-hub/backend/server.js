require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

const db = require("./db/database");

// Middleware (ALWAYS before routes)
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/docker", require("./routes/docker.routes"));
app.use("/api/k8s", require("./routes/k8s.routes"));
app.use("/api/ansible", require("./routes/ansible.routes"));
app.use("/api/github", require("./routes/github.routes"));
app.use("/api/admin", require("./routes/admin/admin.routes"));


// Health check
app.get("/", (req, res) => {
  res.json({ status: "deployX Control Hub Backend Running" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Control Hub Backend running on port ${PORT}`);
});

app.get("/api/logs", (req, res) => {
  db.all("SELECT * FROM logs ORDER BY timestamp DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});