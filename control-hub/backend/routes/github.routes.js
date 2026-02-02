const express = require("express");
const axios = require("axios");
const router = express.Router();
const logger = require("../services/logger.service");

// POST /api/github/trigger
router.post("/trigger", async (req, res) => {
  const { pipelineType } = req.body;

  if (!pipelineType) {
    return res.status(400).json({ error: "pipelineType is required" });
  }

  try {
    const url = `https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/actions/workflows/${process.env.GITHUB_WORKFLOW}/dispatches`;

    await axios.post(
      url,
      {
        ref: "main",
        inputs: {
          pipelineType: pipelineType
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json"
        }
      }
    );

    logger("github", "TRIGGER_PIPELINE", "SUCCESS", pipelineType);

    res.json({
      message: "GitHub Actions workflow triggered successfully",
      pipelineType
    });

  } catch (error) {
    logger("github", "TRIGGER_PIPELINE", "FAILED", error.message);

    res.status(500).json({
      error: "Failed to trigger GitHub workflow",
      details: error.response?.data || error.message
    });
  }
});

module.exports = router;
