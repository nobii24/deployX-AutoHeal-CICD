const API = "http://localhost:5000/api";
const ADMIN_API = `${API}/admin`;

let logsVisible = false;
let dockerImages = [];

/* ---------- SAFETY ---------- */
if (window.__loaded) {
  console.warn("Prevent reload");
} else {
  window.__loaded = true;
}

/* ---------- NAVIGATION ---------- */
function showDashboard() {
  document.getElementById("dashboardView").style.display = "block";
  document.getElementById("adminView").style.display = "none";
}

function showAdmin() {
  document.getElementById("dashboardView").style.display = "none";
  document.getElementById("adminView").style.display = "block";
}

/* ---------- DOCKER ---------- */
async function buildDocker() {
  const image = prompt("Enter image name (example: img1:latest)");
  if (!image) return;

  const box = document.getElementById("docker-output");
  box.textContent = "⏳ Building Docker image...\n";

  const res = await fetch(`${API}/docker/build`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageName: image })
  });

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    box.textContent += decoder.decode(value);
  }

  loadDockerImages();
}

function loadDockerImages() {
  fetch(`${API}/docker/images`)
    .then(res => res.json())
    .then(data => {
      const box = document.getElementById("docker-output");
      const select = document.getElementById("imageSelect");

      box.innerHTML = "";
      select.innerHTML = "";

      if (!data.images || data.images.length === 0) {
        box.textContent = "No Docker images found";
        return;
      }

      dockerImages = data.images;

      data.images.forEach(img => {
        // Text output
        const line = document.createElement("div");
        line.textContent =
          `${img.Repository}:${img.Tag} | ${img.Size} | ${img.CreatedSince}`;
        box.appendChild(line);

        // Dropdown
        const option = document.createElement("option");
        option.value = `${img.Repository}:${img.Tag}`;
        option.textContent =
          `${img.Repository}:${img.Tag} (${img.Size})`;
        select.appendChild(option);
      });
    })
    .catch(() => {
      document.getElementById("docker-output").textContent =
        "❌ Failed to load Docker images";
    });
}

function pruneImages() {
  if (!confirm("Remove dangling Docker images?")) return;

  fetch(`${API}/docker/prune`, { method: "DELETE" })
    .then(res => res.json())
    .then(d => alert(d.message));
}

/* ---------- KUBERNETES ---------- */
function deployImage() {
  const image = document.getElementById("imageSelect").value;
  if (!image) return alert("Select an image first");

  fetch(`${API}/k8s/deploy`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image })
  })
    .then(res => res.json())
    .then(d => {
      document.getElementById("k8s-output").textContent =
        `✅ Deployed ${image} successfully`;
    })
    .catch(() => {
      document.getElementById("k8s-output").textContent =
        "❌ Deployment failed";
    });
}

function cleanupFailedPods() {
  if (!confirm("Delete all ImagePullBackOff pods?")) return;

  fetch(`${API}/k8s/cleanup-failed`, { method: "DELETE" })
    .then(res => res.json())
    .then(d => {
      alert(d.message);
      listPods();
    })
    .catch(() => alert("Auto-clean failed"));
}


async function listPods() {
  const box = document.getElementById("k8s-output");
  box.innerHTML = "⏳ Fetching pods...\n";

  const res = await fetch(`${API}/k8s/pods`);
  const data = await res.json();

  box.innerHTML = "";

  if (!data.pods || data.pods.length === 0) {
    box.textContent = "No pods running";
    return;
  }

  data.pods.forEach(podLine => {
    const status = podLine.split(/\s+/)[2];

    const div = document.createElement("div");
    div.className = "pod-line " + podClass(status);
    div.textContent = podLine;

    box.appendChild(div);
  });
}

function podClass(status) {
  if (status === "Running") return "pod-running";
  if (status === "Pending") return "pod-pending";
  if (status.includes("ImagePull")) return "pod-error";
  if (status === "Completed") return "pod-completed";
  return "pod-unknown";
}


function deletePod() {
  const pod = prompt("Enter pod name:");
  if (!pod) return;

  fetch(`${API}/k8s/pods/${pod}`, { method: "DELETE" })
    .then(res => res.json())
    .then(d => {
      document.getElementById("k8s-output").textContent =
        JSON.stringify(d, null, 2);
    });
}

/* ---------- ANSIBLE ---------- */
function runAnsible() {
  const box = document.getElementById("ansible-output");
  box.textContent = "⏳ Running Ansible deployment...\n";

  fetch(`${API}/ansible/deploy`, { method: "POST" })
    .then(res => res.json())
    .then(data => {
      box.textContent =
        "✅ Deployment completed successfully\n\n" +
        (data.output || "Application deployed");
    })
    .catch(() => {
      box.textContent = "❌ Ansible deployment failed";
    });
}

/* ---------- CI / CD ---------- */
function triggerCI() { triggerPipeline("CI_ONLY"); }
function triggerCICD() { triggerPipeline("CI_CD"); }

function triggerPipeline(type) {
  const box = document.getElementById("ci-output");
  box.textContent = `⏳ Triggering ${type} pipeline...\n`;

  fetch(`${API}/github/trigger`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pipelineType: type })
  })
    .then(res => res.json())
    .then(() => {
      box.textContent =
        `✅ ${type} pipeline triggered successfully\nCheck GitHub Actions`;
    })
    .catch(() => {
      box.textContent = "❌ Pipeline trigger failed";
    });
}

/* ---------- SYSTEM LOGS ---------- */
function loadLogs(event) {
  const logsBox = document.getElementById("logsOutput");
  const btn = event.target;

  if (logsVisible) {
    logsBox.textContent = "";
    btn.textContent = "Load History";
    logsVisible = false;
    return;
  }

  fetch(`${API}/logs`)
    .then(res => res.json())
    .then(data => {
      logsBox.textContent = data.length
        ? data.map(l =>
            `${l.tool} | ${l.action} | ${l.status} | ${new Date(l.timestamp).toLocaleString()}`
          ).join("\n")
        : "No logs available";

      btn.textContent = "Hide History";
      logsVisible = true;
    })
    .catch(() => {
      logsBox.textContent = "❌ Failed to load logs";
    });
}

/* ---------- ADMIN ---------- */
function adminKey() {
  return document.getElementById("adminKey").value;
}

function adminReq(url, method = "GET") {
  return fetch(url, {
    method,
    headers: { "x-admin-key": adminKey() }
  }).then(res => res.json());
}

function adminAllLogs() {
  adminReq(`${ADMIN_API}/logs`).then(showAdminOut);
}

function adminFilter(tool) {
  adminReq(`${ADMIN_API}/logs/${tool}`).then(showAdminOut);
}

function adminSummary() {
  adminReq(`${ADMIN_API}/summary`).then(showAdminOut);
}

function adminClear() {
  if (!confirm("Clear all logs?")) return;
  adminReq(`${ADMIN_API}/logs`, "DELETE").then(showAdminOut);
}

function showAdminOut(data) {
  const panel = document.getElementById("adminOutput");
  panel.innerHTML = "";

  if (!data || data.length === 0) {
    panel.textContent = "No logs found";
    return;
  }

  data.forEach(log => {
    const div = document.createElement("div");
    div.className = `admin-log ${log.status === "SUCCESS" ? "success" : "failed"}`;
    div.innerHTML = `
      <strong>${log.tool}</strong> | ${log.action} | ${log.status}<br>
      ${new Date(log.timestamp).toLocaleString()}<br>
      ${log.details || ""}
    `;
    panel.appendChild(div);
  });
}
