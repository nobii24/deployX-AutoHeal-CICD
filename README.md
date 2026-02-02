# 🚀 deployX – AutoHeal CI/CD Control Hub

deployX is a **full-stack DevOps Control Hub** that provides a **single dashboard** to manage:

- 🐳 Docker image builds
- ☸ Kubernetes deployments (Minikube)
- 🧠 Auto-healing for failed pods
- 📦 Ansible CD execution
- 🔁 GitHub CI / CI+CD triggers
- 📜 Centralized system logs
- 🟢 Pod health visualization

This project is designed for **learning, demos, and academic DevOps projects**.

---

## 📌 Tech Stack

- **Frontend**: HTML, CSS, Vanilla JavaScript  
- **Backend**: Node.js + Express  
- **Containerization**: Docker  
- **Orchestration**: Kubernetes (Minikube)  
- **CI/CD**: GitHub Actions  
- **Configuration Management**: Ansible  

---

## 📂 Project Structure

```
deployX-AutoHeal-CICD/
│
├── base-pipeline/
│   ├── docker/
│   │   └── Dockerfile
│   └── website/
│       └── index.html
│
├── control-hub/
│   ├── backend/
│   │   ├── routes/
│   │   │   ├── docker.routes.js
│   │   │   ├── k8s.routes.js
│   │   │   ├── github.routes.js
│   │   │   └── ansible.routes.js
│   │   ├── services/
│   │   │   └── logger.service.js
│   │   ├── server.js
│   │   └── package.json
│   │
│   └── frontend/
│       ├── index.html
│       ├── css/style.css
│       └── js/app.js
│
└── README.md
```

---

## ⚙️ Prerequisites

Make sure the following are installed:

```bash
node -v
docker -v
kubectl version --client
minikube version
ansible --version
```

---

## 🚀 Step-by-Step Execution Guide

### 1️⃣ Start Minikube (Docker Driver)

```bash
minikube start --driver=docker
```

Verify:
```bash
kubectl get nodes
```

---

### 2️⃣ Point Docker CLI to Minikube (IMPORTANT)

```bash
eval $(minikube docker-env)
```

Verify:
```bash
docker info | grep Name
# Output should show: Name: minikube
```

---

### 3️⃣ Build Docker Image (Inside Minikube)

```bash
docker build -t img1:latest \
  -f base-pipeline/docker/Dockerfile \
  base-pipeline
```

Verify image:
```bash
docker images | grep img1
```

---

### 4️⃣ Deploy Image to Kubernetes (Local Image)

```bash
kubectl create deployment img1 --image=img1:latest
```

⚠️ Kubernetes tries to pull images by default.  
deployX automatically fixes this using:

```yaml
imagePullPolicy: Never
```

---

### 5️⃣ Check Pods

```bash
kubectl get pods
```

---

### 6️⃣ Start Backend Server

```bash
cd control-hub/backend
npm install
node server.js
```

Backend runs on:
```
http://localhost:5000
```

---

### 7️⃣ Open Frontend Dashboard

Open directly in browser:

```bash
control-hub/frontend/index.html
```

(No Live Server required)

---
### optionals- 

minikube start
eval $(minikube docker-env)

cd control-hub/backend
docker info | grep Name   # MUST say minikube
npm start

file:///home/1rv24mc091_sameerp/Desktop/deployX-AutoHeal-CICD/control-hub/frontend/index.html

-----------

## 🧠 Key Features & How to Use

### 🐳 Docker
- **List Images** – Shows image name, size & created time
- **Build Image** – Builds inside Minikube Docker
- **Prune Images** – Removes dangling images

---

### ☸ Kubernetes
- **List Pods** – Shows live pod status
- **Color Badges**:
  - 🟢 Running
  - 🟡 Pending
  - 🔴 ImagePullBackOff / ErrImagePull
- **Deploy Image** – Deploy selected Docker image
- **Delete Pod** – Manual delete (auto-heal demo)
- **🧠 Auto-Clean Failed Pods** – Deletes ImagePullBackOff pods safely

---

### 📦 Ansible (CD)
- Runs Ansible deployment playbook
- Displays success/failure output

---

### 🔁 CI / CD
- **CI Only** – Triggers GitHub CI pipeline
- **CI + CD** – Full pipeline trigger
- Uses GitHub Actions

---

### 📜 System Logs
- Central log history for:
  - Docker
  - Kubernetes
  - Ansible
  - GitHub CI/CD
- Toggle load / hide logs
- Timestamped entries

---

## 🛠 Common Debug Commands

```bash
kubectl describe pod <pod-name>
kubectl logs <pod-name>
kubectl delete pod <pod-name>
docker images
docker ps
```

---

## ⚠️ ImagePullBackOff Explained

ImagePullBackOff occurs when:
- Kubernetes tries to pull from Docker Hub
- Image exists only inside Minikube Docker

✅ **Solution used in deployX**:
- Build images inside Minikube
- Deploy with `imagePullPolicy: Never`
- Auto-clean failed pods

---

## 🏆 Highlights

✔ No external Docker registry needed  
✔ Local Kubernetes-ready images  
✔ Auto-healing demo supported  
✔ Beginner-friendly DevOps project  
✔ Clean UI + backend separation  

---

## 📌 Recommended Enhancements (Optional)

- Pod logs viewer
- Deployment rollback
- Resource usage (CPU/RAM)
- Auto-clean scheduler
- Namespace support

---

## 👤 Author

**Sameer Patel**  
MCA – DevOps Project  
GitHub: `https://github.com/nobii24`

---

## 📄 License

This project is for **educational and learning purposes**.
