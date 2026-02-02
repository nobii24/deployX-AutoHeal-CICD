const express = require("express");
const { exec } = require("child_process");
const logger = require("../services/logger.service");

const router = express.Router();

/* ---------- LIST PODS ---------- */
router.get("/pods", (req, res) => {
  exec("kubectl get pods --no-headers", (err, stdout, stderr) => {
    if (err) {
      logger("kubernetes", "LIST_PODS", "FAILED", stderr);
      return res.status(500).json({ error: stderr });
    }

    const pods = stdout
      .split("\n")
      .map(l => l.trim())
      .filter(Boolean);

    logger("kubernetes", "LIST_PODS", "SUCCESS", `Count: ${pods.length}`);
    res.json({ pods });
  });
});

/* ---------- DELETE POD ---------- */
router.delete("/pods/:name", (req, res) => {
  const pod = req.params.name;

  exec(`kubectl delete pod ${pod}`, (err, stdout, stderr) => {
    if (err) {
      logger("kubernetes", "DELETE_POD", "FAILED", stderr);
      return res.status(500).json({ error: stderr });
    }

    logger("kubernetes", "DELETE_POD", "SUCCESS", pod);
    res.json({ message: `Pod ${pod} deleted` });
  });
});

/* ---------- DEPLOY IMAGE (LOCAL MINIKUBE IMAGE) ---------- */
router.post("/deploy", (req, res) => {
  const { image } = req.body;

  if (!image) {
    return res.status(400).json({ error: "Image required" });
  }

  const appName = image.replace(/[^a-z0-9]/gi, "-").toLowerCase();

  const cmd = `
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${appName}
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ${appName}
  template:
    metadata:
      labels:
        app: ${appName}
    spec:
      containers:
      - name: ${appName}
        image: ${image}
        imagePullPolicy: Never
EOF
`;

  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      logger("kubernetes", "DEPLOY", "FAILED", stderr);
      return res.status(500).json({ error: stderr });
    }

    logger("kubernetes", "DEPLOY", "SUCCESS", image);
    res.json({ message: `Image ${image} deployed successfully` });
  });
});

/* ---------- AUTO-DELETE FAILED IMAGE PODS ---------- */
router.delete("/cleanup-failed", (req, res) => {
  exec(
    `kubectl get pods --no-headers | grep -E "ImagePullBackOff|ErrImagePull" | awk '{print $1}'`,
    (err, stdout) => {
      if (err) {
        logger("kubernetes", "AUTO_CLEAN", "FAILED", err.message);
        return res.status(500).json({ error: err.message });
      }

      const pods = stdout
        .split("\n")
        .map(p => p.trim())
        .filter(Boolean);

      if (pods.length === 0) {
        return res.json({ message: "No failed pods found" });
      }

      exec(`kubectl delete pod ${pods.join(" ")}`, () => {
        logger(
          "kubernetes",
          "AUTO_CLEAN",
          "SUCCESS",
          `Deleted: ${pods.join(", ")}`
        );

        res.json({
          message: "Failed pods deleted",
          pods
        });
      });
    }
  );
});


module.exports = router;
