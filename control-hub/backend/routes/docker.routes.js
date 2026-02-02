const express = require("express");
const { exec } = require("child_process");
const path = require("path");
const logger = require("../services/logger.service");

const router = express.Router();

const PROJECT_ROOT = path.resolve(__dirname, "../../..");
const DOCKERFILE = path.join(PROJECT_ROOT, "base-pipeline/docker/Dockerfile");
const BUILD_CONTEXT = path.join(PROJECT_ROOT, "base-pipeline");

/* ---------- BUILD IMAGE (MINIKUBE DOCKER) ---------- */
router.post("/build", (req, res) => {
  const { imageName } = req.body;

  if (!imageName) {
    return res.status(400).json({ error: "Image name required" });
  }

  const cmd = `
eval $(minikube docker-env) &&
docker build -t ${imageName} -f ${DOCKERFILE} ${BUILD_CONTEXT}
`;

  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      logger("docker", "BUILD", "FAILED", stderr);
      return res.status(500).json({ error: stderr });
    }

    logger("docker", "BUILD", "SUCCESS", imageName);
    res.json({ message: "Image built successfully", image: imageName });
  });
});

/* ---------- LIST IMAGES ---------- */
router.get("/images", (req, res) => {
  exec(`docker images --format "{{json .}}"`, (err, stdout) => {
    if (err) {
      logger("docker", "LIST_IMAGES", "FAILED", err.message);
      return res.status(500).json({ error: err.message });
    }

    const images = stdout
      .trim()
      .split("\n")
      .map(line => JSON.parse(line));

    logger("docker", "LIST_IMAGES", "SUCCESS", `Count: ${images.length}`);
    res.json({ images });
  });
});

/* ---------- PRUNE ---------- */
router.delete("/prune", (req, res) => {
  exec("docker image prune -f", err => {
    if (err) {
      logger("docker", "PRUNE", "FAILED", err.message);
      return res.status(500).json({ error: err.message });
    }

    logger("docker", "PRUNE", "SUCCESS", "Dangling images removed");
    res.json({ message: "Dangling images removed" });
  });
});

module.exports = router;
