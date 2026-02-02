const express = require("express");
const { exec } = require("child_process");
const logger = require("../services/logger.service");

const router = express.Router();

router.post("/deploy", (req, res) => {
  const cmd =
  "ansible-playbook -i ../../base-pipeline/ansible/inventory ../../base-pipeline/ansible/deploy.yml";


  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      logger("ansible", "DEPLOY", "FAILED", stderr);
      return res.status(500).json({ error: "Ansible deployment failed" });
    }

    logger("ansible", "DEPLOY", "SUCCESS", stdout);
    res.json({ message: "Ansible deployment completed successfully" });
  });
});

module.exports = router;
