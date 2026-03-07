# AI‑Powered Crime Scene Memory Distortion Simulator

A full‑stack experiment to study how **eyewitness memory** changes under misinformation in a virtual crime scene. Participants first view an original scene, then a subtly modified version, and finally answer recall questions so the system can measure accuracy, suggestibility, and memory distortion.

---

## Overview

This project is built for the **National Level AI Hackathon** (Domain: AI‑Powered Memory Distortion Simulator).It uses controlled scene manipulation plus AI analysis to estimate how vulnerable a person is to false memories in immersive environments and produces a **Suggestibility Index** and memory stability report per session.

---

## Tech Stack

- **Frontend (dashboard)**: React, Vite, React Router, Chart.js  
- **Backend**: FastAPI (Python), MongoDB (Motor), AI/ML scoring logic for distortion and suggestibility
- **Crime scenes**: Unity (original and modified crime scene), WebGL builds embedded in the dashboard  

---

## Project Structure

```bash
AR_CrimeScene/
├── dashboard/        # React dashboard + experiment flow + charts
├── backend/          # FastAPI API + analysis & AI scoring
├── Crime scene 1/    # Unity project + WebGL builds (Cmod1, Cmod2)
└── README.md
```

- `dashboard/`: Participant UI, experiment flow, and analytics/reporting.  
- `backend/`: REST API, MongoDB integration, and scoring logic.  
- `Crime scene 1/`: Unity project for the original and modified crime scenes and their WebGL exports.  

---

## Prerequisites

- Node.js  
- Python 3  
- MongoDB (local or Atlas; default URI: `mongodb://localhost:27017`)  

You can override the default Mongo configuration with environment variables in the backend.

---

## Getting Started

### 1. Backend

```bash
cd backend

python -m venv .venv

# Linux/macOS
source .venv/bin/activate

# Windows
# .venv\Scripts\activate

pip install -r requirements.txt

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Optional environment variables:

- `MONGO_URI` – MongoDB connection string (e.g. Atlas)  
- `MONGO_DB_NAME` – Database name override  

---

### 2. Dashboard

```bash
cd dashboard
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.  
Make sure the backend is running on `http://localhost:8000` (or update the frontend config if you change it).

---

### 3. Unity WebGL Builds

1. Open the Unity project under `Crime scene 1/`.  
2. Build the **original** and **modified** crime scenes (Cmod1, Cmod2) as WebGL.  
3. Copy the modified scene build into the dashboard public folder, for example:

```bash
cp -r "Crime scene 1/WebGLBuild/Cmod2" \
      dashboard/public/unity-modified/
```

The dashboard loads the WebGL scenes via iframes.

---

## Experiment Flow

1. From the dashboard, click **“Crime Scene 1”** to create a new session (`POST /sessions`).  
2. Participant views the **Original Scene (Cmod1)** for 25 seconds, then automatically moves to the distraction phase.  
3. Participant answers 6 distraction questions (math/trivia).  
4. Participant views the **Modified Scene (Cmod2)** for 25 seconds.  
5. Participant answers 3 recall questions (e.g., light stand colour, knife presence, phone location).  
6. The backend generates a report for that session (`GET /sessions/{id}/report`), and the dashboard shows accuracy, Suggestibility Index, and distortion charts. [file:2]

---

## API Endpoints

Backend base URL (default): `http://localhost:8000`

- `POST /sessions` – Create a new experiment session  
- `GET /sessions` – List sessions  
- `POST /recall` – Submit recall answers  
- `GET /sessions/{id}/report` – Get analysis report  

---

## Why It Matters

- Measures cognitive vulnerability to misinformation in a controlled, gamified 3D environment.
- Useful for legal training, cognitive psychology research, and EdTech/AI projects focused on memory and behavior analytics.

---

## Team

**Team Quadrix** – Harshita R, Hima Parvathi A, Chandana S, Harini B
Project title: **“When Memory Cannot Be Trusted” – AI‑Powered Memory Distortion Simulator**. 
```
