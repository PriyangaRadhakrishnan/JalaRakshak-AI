# 🌊 JalaRakshak AI — Local Urban Flood-Risk & Community Alert

**JalaRakshak AI** is an open-source civic-technology prototype designed to provide localized urban flood-risk predictions and crowdsourced community waterlogging alerts. Operating on local edge environments with zero paid API dependencies, it bridges hydrological modeling with real-time citizen observations to safeguard vulnerable municipal wards and transit corridors.

---

## 📌 Phase Progression

### ✅ Phase 1: Project Foundation (Completed)
- **Monorepo Architecture**: Clean separation between `frontend/` (React 19 + Vite) and `backend/` (Python 3.13 + Flask).
- **Civic Design System**: Polished, responsive blue, teal, and slate/white dashboard crafted in modern CSS.
- **5-Section Navigation**: `Dashboard`, `Flood Map`, `Predict Risk`, `Community Reports`, and `About`.
- **Health Telemetry**: `GET /api/health` providing live backend uptime and module telemetry.
- **Configurable Local API URL**: Frontend environment configuration via `VITE_API_BASE_URL` with automated fallbacks and latency tracking.

### ✅ Phase 2: Machine Learning Pipeline (Completed)
- **Dataset Assessment**: Verified that external datasets were inaccessible due to isolated development networking. Generated a clearly labeled, reproducible synthetic urban hydrology dataset (`data/synthetic_flood_data_demo_only.csv`, 2,000 samples) strictly marked as **DEMO ONLY**.
- **Data Preprocessing & Leakage Prevention**:
  - Imputation of missing values via median strategy fitted strictly on training data (`SimpleImputer`).
  - Stratified 80/20 train/test split (`train_test_split(..., stratify=y)`), ensuring test data is completely isolated.
  - End-to-end `sklearn.pipeline.Pipeline` with `StandardScaler` and `RandomForestClassifier`.
- **Model Training**: Fitted Random Forest classifier with 120 estimators on 1,600 training samples. Saved to `backend/models/flood_rf_pipeline.joblib`.
- **Evaluation on 400 Test Samples**: Accuracy: 86.25%, Precision: 85.32%, Recall: 92.27%, F1: 88.66%, ROC-AUC: 0.9487, Confusion Matrix: `TN=130, FP=37, FN=18, TP=215`.
- **Inference & Input Validation**: Created `backend/predict.py` with strict physical bounds validation and clear rejection messages.
- **Feature Influence Explanation**: Identifies top influential features per prediction sample with non-causal statistical disclaimer.

### ✅ Phase 3: Flask API & SQLite Database (Completed)
- **Automatic SQLite Initialization**: Automatically creates `backend/database/jalarakshak.db` and the `community_reports` table on startup with indexed timestamps and severities.
- **Separation of Concerns**: Model predictions and community reports are kept strictly independent in both the database schema and API endpoints.
- **Input Validation & Coordinates**: Rigorous bounds validation for latitude (`[-90.0, 90.0]`), longitude (`[-180.0, 180.0]`), severity (`Low`, `Moderate`, `High`, `Critical`), and required location descriptions.
- **Model Graceful Degradation**: If the ML model is missing, returns HTTP 503 Service Unavailable without returning fabricated predictions.
- **Automated Test Suite**: All 9 automated tests passing in `backend/test_phase3_api.py`.
- **Frontend Integration**: Connected `CommunityReportsView.jsx` and `DashboardView.jsx` to live SQLite report querying and posting.

### ✅ Phase 4: Frontend GIS Map & Module Integration (Completed)
- **Interactive OpenStreetMap GIS Map**: React Leaflet map with distinct markers and rich popups for illustrative risk zones vs community reports.
- **Predict Risk Interface**: Fully calibrated against trained Random Forest feature schema, validation, ensemble probabilities, top factors, and data limitations.
- **Community Reports & Map Integration**: Form validation, SQLite persistence, and immediate map plotting of new citizen hazard submissions.
- **Civic Safety Protocols & About View**: Actionable 3-stage flood guidance, emergency directory, and API reference.
- **Automated End-to-End Browser Testing**: Complete browser flow verified using headless Edge in `frontend/test_browser_flow.js`.

---

## 📁 Project Directory Structure

```text
JalaRakshak AI/
├── .gitignore                    # Git ignore rules for Python, Node, and environment files
├── README.md                     # Project architecture and setup documentation
├── data/
│   ├── DATASET_METADATA.md       # Provenance, column definitions, units, and DEMO ONLY disclaimer
│   └── synthetic_flood_data_demo_only.csv # 2,000-sample synthetic dataset (DEMO ONLY)
├── backend/                      # Python Flask Backend Microservice
│   ├── .env.example              # Example environment configuration for backend
│   ├── app.py                    # Flask API with all Phase 3 endpoints & auto DB init
│   ├── db.py                     # SQLite database manager, schema migrations, and queries
│   ├── generate_synthetic_dataset.py # Synthetic hydrology dataset generator
│   ├── predict.py                # Model inference, validation, and feature influence engine
│   ├── requirements.txt          # Python dependencies (Flask, Flask-CORS, scikit-learn, etc.)
│   ├── test_phase3_api.py        # Automated test suite covering all Phase 3 endpoints
│   ├── train_model.py            # Training pipeline, stratified split, evaluation, and serialization
│   ├── database/
│   │   └── jalarakshak.db        # SQLite database file (created automatically on startup)
│   ├── models/
│   │   ├── flood_rf_pipeline.joblib # Saved fitted Scikit-Learn pipeline
│   │   └── model_metadata.json   # Saved test metrics, feature order, and disclaimers
│   └── venv/                     # Python virtual environment (ignored in git)
└── frontend/                     # React 19 + Vite Frontend Application
    ├── .env                      # Local environment configuration (VITE_API_BASE_URL)
    ├── .env.example              # Template environment configuration
    ├── index.html                # HTML entry point with Inter & Outfit typography
    ├── package.json              # NPM package manifest and scripts
    ├── vite.config.js            # Vite configuration with local proxy
    └── src/
        ├── App.css               # Civic-tech responsive stylesheet (blue, teal, white)
        ├── App.jsx               # Root application component with view routing
        ├── config.js             # Configurable API base URL loader
        ├── index.css             # CSS reset and design tokens
        ├── main.jsx              # React DOM bootstrap with ErrorBoundary
        ├── components/
        │   ├── ErrorBoundary.jsx # React error boundary preventing blank screens
        │   ├── Footer.jsx        # Civic resilience footer
        │   ├── Icons.jsx         # Custom SVG icon set
        │   ├── Navbar.jsx        # Navigation bar with live backend status indicator
        │   └── StatusBadge.jsx   # Reusable Phase 1 vs Phase 2 badges & banners
        ├── services/
        │   └── api.js            # Backend health check client with latency measurement
        └── views/
            ├── AboutView.jsx     # Project overview and roadmap
            ├── CommunityReportsView.jsx # Live citizen reporting form & SQLite feed
            ├── DashboardView.jsx # Live telemetry, DB status, and diagnostics
            ├── FloodMapView.jsx  # GIS inundation map canvas preview
            └── PredictRiskView.jsx # Live interactive ML prediction & risk gauge
```

---

## 🚀 Quick Start Instructions (Windows PowerShell)

### 1️⃣ Terminal 1: Start the Backend (Flask API)

```powershell
# Navigate to the project root
cd "c:\Users\Dell\OneDrive\Desktop\JalaRakshak AI"

# 1. Activate the Python virtual environment
.\backend\venv\Scripts\Activate.ps1

# 2. Run the automated Phase 3 API test suite
python backend\test_phase3_api.py

# 3. Start the Flask server (auto-creates database/jalarakshak.db)
python backend\app.py
```

*The Flask server will run at:* **`http://127.0.0.1:5000`**

---

### 2️⃣ Terminal 2: Start the Frontend (React + Vite)

```powershell
# Navigate to the frontend directory
cd "c:\Users\Dell\OneDrive\Desktop\JalaRakshak AI\frontend"

# 1. Start the Vite development server
npm run dev
```

*The frontend application will run at:* **`http://localhost:5173`**

---

## 📡 API Endpoints & Request/Response Formats

### 1. `GET /api/health`
Checks backend uptime, SQLite connectivity, and loaded ML model status.
- **Response `200 OK`**:
```json
{
  "status": "healthy",
  "service": "JalaRakshak AI Backend",
  "version": "1.2.0",
  "phase": "Phase 3 - API & SQLite Storage",
  "timestamp": "2026-10-17T18:57:36.501335+00:00",
  "environment": "development",
  "modules": {
    "health_api": "active",
    "database": "active",
    "ml_risk_predictor": "active",
    "community_reports": "active"
  }
}
```

---

### 2. `GET /api/metrics`
Returns actual saved model evaluation metrics and feature specifications.
- **Response `200 OK`**:
```json
{
  "status": "available",
  "model_name": "JalaRakshak AI Hydrological Random Forest Classifier",
  "is_demo_only": true,
  "evaluation_metrics": {
    "accuracy": 0.8625,
    "precision": 0.8532,
    "recall": 0.9227,
    "f1_score": 0.8866,
    "roc_auc": 0.9487,
    "confusion_matrix": {
      "true_negative": 130,
      "false_positive": 37,
      "false_negative": 18,
      "true_positive": 215
    }
  },
  "feature_importances": [
    {
      "feature": "elevation_m",
      "gini_importance": 0.2001,
      "permutation_importance_mean": 0.1090
    },
    {
      "feature": "rainfall_3h_mm",
      "gini_importance": 0.2235,
      "permutation_importance_mean": 0.0850
    }
  ]
}
```

---

### 3. `POST /api/predict`
Validates input features against domain boundaries and executes Random Forest inference.
- **Sample Request**:
```json
{
  "rainfall_3h_mm": 90.0,
  "rainfall_24h_mm": 170.0,
  "soil_saturation_pct": 85.0,
  "drainage_capacity_pct": 30.0,
  "elevation_m": 5.0,
  "tide_level_m": 2.5,
  "impervious_surface_pct": 80.0
}
```
- **Response `200 OK`**:
```json
{
  "status": "success",
  "is_demo_only": true,
  "demo_disclaimer": "DEMO ONLY: This model was trained on a synthetic dataset for demonstration of the ML pipeline. It is NOT validated for real-world municipal emergency operations.",
  "causality_disclaimer": "Feature importance metrics reflect associative predictive power within this Random Forest architecture; they do NOT establish physical or hydrological causation.",
  "prediction": {
    "flood_predicted": true,
    "flood_probability": 1.0,
    "no_flood_probability": 0.0,
    "risk_score_pct": 100.0,
    "risk_level": "Critical Alert",
    "risk_color": "red",
    "action_advisory": "Severe inundation probable. Trigger community early warnings; initiate flood barrier and emergency evacuation protocols."
  },
  "influential_factors": [
    {
      "feature": "elevation_m",
      "value": 5.0,
      "summary": "elevation_m = 5.0m (increases model risk assessment)"
    }
  ]
}
```
- **Error Response `400 Bad Request`** (When values exceed physical limits):
```json
{
  "status": "validation_error",
  "is_demo_only": true,
  "errors": [
    "Feature 'rainfall_3h_mm' value 450.0 is outside valid physical range [0.0, 300.0] mm."
  ]
}
```

---

### 4. `GET /api/reports`
Retrieves stored community reports from SQLite, sorted newest first. Optional query params: `?severity=Critical&limit=10`.
- **Response `200 OK`**:
```json
{
  "status": "success",
  "count": 3,
  "filters": {
    "limit": 50,
    "severity": null
  },
  "reports": [
    {
      "id": "REP-W14-SUBWAY",
      "location_description": "Ward 14 - Metro Subway Underpass (North Exit)",
      "latitude": 13.0836,
      "longitude": 80.2825,
      "severity": "Critical",
      "description": "Water depth approximately 45 cm. Stalled vehicles reported. Storm drain grate visibly choked with plastic waste.",
      "water_depth_cm": 45.0,
      "drain_blocked": 1,
      "timestamp": "2026-10-17T18:30:00Z",
      "verification_status": "community_verified",
      "upvotes": 14
    }
  ]
}
```

---

### 5. `POST /api/reports`
Validates and persists a citizen hazard report to SQLite.
- **Sample Request**:
```json
{
  "location_description": "Sector 5 Cross Road - Main Storm Culvert",
  "severity": "Critical",
  "description": "Culvert completely choked with fallen branches and urban debris. Water depth approx 50cm across lanes.",
  "water_depth_cm": 50.0,
  "drain_blocked": 1,
  "latitude": 13.0855,
  "longitude": 80.2790
}
```
- **Response `201 Created`**:
```json
{
  "status": "success",
  "message": "Community flood report recorded successfully.",
  "report": {
    "id": "REP-76E445C9",
    "location_description": "Sector 5 Cross Road - Main Storm Culvert",
    "severity": "Critical",
    "description": "Culvert completely choked with fallen branches and urban debris. Water depth approx 50cm across lanes.",
    "water_depth_cm": 50.0,
    "drain_blocked": 1,
    "latitude": 13.0855,
    "longitude": 80.2790,
    "timestamp": "2026-10-17T18:57:36.864986+00:00",
    "verification_status": "unverified",
    "upvotes": 0
  }
}
```
- **Error Response `400 Bad Request`** (When required fields or coordinates are invalid):
```json
{
  "status": "validation_error",
  "errors": [
    "Field 'location_description' is required and must be a non-empty string.",
    "Invalid severity 'UnknownLevel'. Must be one of: ['Critical', 'High', 'Low', 'Moderate'].",
    "Latitude 145.0 is out of valid range [-90.0, 90.0]."
  ]
}
```

---

## 🗄️ SQLite Database Schema (`backend/database/jalarakshak.db`)

```sql
CREATE TABLE community_reports (
    id TEXT PRIMARY KEY,
    location_description TEXT NOT NULL,
    latitude REAL,
    longitude REAL,
    severity TEXT NOT NULL,
    description TEXT NOT NULL,
    water_depth_cm REAL,
    drain_blocked INTEGER DEFAULT 0,
    timestamp TEXT NOT NULL,
    verification_status TEXT NOT NULL DEFAULT 'unverified',
    upvotes INTEGER DEFAULT 0
);

CREATE INDEX idx_reports_timestamp ON community_reports (timestamp DESC);
CREATE INDEX idx_reports_severity ON community_reports (severity);
```


---

## ✅ Phase 4: Frontend GIS Map & Module Integration (Completed)

Phase 4 completes the frontend architecture and connects all modules into a unified civic flood resilience platform:

1. **Dashboard (`DashboardView.jsx`)**:
   - Live backend health telemetry probe with latency tracking.
   - ML model evaluation metrics loaded dynamically from `/api/metrics` (Accuracy: 86.3%, Recall: 92.3%, F1: 88.7%).
   - Total community report count and severity breakdown from `/api/reports`.
   - Small charts based strictly on real data:
     - SQLite Community Reports by Severity bar chart.
     - Model Permutation Feature Importance mean distribution chart.
   - General Civic Flood Safety Advisory banner with emergency hotlines.
   - Zero fabricated live statistics or simulated sensor streams.

2. **Interactive Flood Map (`FloodMapView.jsx`)**:
   - Built with **React Leaflet** and **OpenStreetMap** raster tiles.
   - **Illustrative Risk-Zone Markers**: Distinct pulsing markers with ⚠️ warning icon, strictly tagged **DEMO DATA**.
   - **Crowdsourced Community Report Markers**: Distinct pin drop icons with citizen symbol 👥, color-coded by severity (Critical: Red, High: Orange, Moderate: Amber, Low: Teal).
   - **Rich Marker Popups**: Displays data source, category, timestamp, verification status, water depth, drain blockage, and non-real-world disclaimers.
   - Dynamic layer toggles, severity filters, and click-to-focus sidebar navigation.

3. **Predict Risk (`PredictRiskView.jsx`)**:
   - Input controls for all 7 features matching the trained Scikit-learn Random Forest model schema:
     - `rainfall_3h_mm` [0.0, 300.0] mm
     - `rainfall_24h_mm` [0.0, 600.0] mm
     - `soil_saturation_pct` [0.0, 100.0] %
     - `drainage_capacity_pct` [0.0, 100.0] %
     - `elevation_m` [0.0, 100.0] m
     - `tide_level_m` [0.0, 5.0] m
     - `impervious_surface_pct` [0.0, 100.0] %
   - Dual numeric input and range slider with real-time domain bounds validation.
   - DEMO DATA test scenario presets (Cloudburst & Choked Lowland, Moderate Surge, Dry Season Ridge).
   - Validated submission to `POST /api/predict`.
   - Output displays actual tree ensemble vote probabilities, risk classifications, action advisories, top influential factors, and data limitations/disclaimers. No invented confidence scores.

4. **Community Reports (`CommunityReportsView.jsx`)**:
   - Full citizen hazard reporting form: location, severity, description, depth, choked drain flag, and coordinates with sample basin coords helper (DEMO DATA).
   - Validated submission to `POST /api/reports` with SQLite persistence.
   - Dynamic report feed retrieval from `GET /api/reports` with severity filtering and search.
   - Immediate cross-module synchronization: newly submitted reports immediately appear on the Flood Map.

5. **About & Safety Guide (`AboutView.jsx`)**:
   - Comprehensive urban flood safety protocols across 3 phases (Pre-storm preparation, during waterlogging, and post-flood recovery).
   - Emergency helpline directory (112 National, 1070 State Disaster, 1077 District, 1913 Municipal).
   - Transparent data limitations statement and non-causal statistical disclosure.
   - Complete REST API reference table.

6. **End-to-End Automated Browser Testing (`frontend/test_browser_flow.js`)**:
   - Headless Edge test suite automating prediction, report submission, report retrieval, and map rendering.
   - Run tests via: `node frontend/test_browser_flow.js`.


---

## ✅ Phase 5: Final Testing, Bug Fixing & Submission Preparation (Completed)

Phase 5 conducts rigorous quality assurance, browser flow automation, repository hygiene, and deployment readiness checks:

1. **Clean Start Testing**:
   - Both backend (Flask on port 5000) and frontend (Vite on port 5173) verified booting cleanly from a cold state.
   - Database auto-initializes `jalarakshak.db` and schema with pre-populated baseline incident records.

2. **Full API Endpoint Verification**:
   - `python backend/test_phase3_api.py` verified:
     - `GET /api/health` -> 200 OK (database active, ML active)
     - `GET /api/metrics` -> 200 OK (accuracy, recall, F1, confusion matrix, permutation importances)
     - `POST /api/predict` -> 200 OK with valid inputs, 400 Bad Request with out-of-range inputs
     - `GET /api/reports` -> 200 OK with limit and severity filters
     - `POST /api/reports` -> 201 Created with SQLite persistence
     - `GET /api/reports/<id>` -> 200 OK
   - **All 9 tests pass.**

3. **End-to-End User Journey Automated Browser Testing**:
   - Automated via headless Microsoft Edge in `frontend/test_browser_flow.js`:
     - Dashboard loads with live status, report counter, and non-fabricated charts.
     - Predict Risk selects scenario preset, executes prediction via `POST /api/predict`, verifies tree vote probabilities and non-causal factor summaries.
     - Community Reports submits a new incident report with GPS coordinates to `POST /api/reports`, verifies SQLite persistence, and updates the live incident feed.
     - Flood Map renders OpenStreetMap raster tiles, verifies illustrative risk zones and community reports pins, and opens interactive popups with verification status.
     - About page displays 3-phase civic flood safety protocols, emergency directory, and API reference.
   - **All 5 browser journey steps pass with zero errors.**

4. **Model Fidelity Verification**:
   - Inferences are dynamically generated by the Scikit-learn Random Forest pipeline (`flood_rf_pipeline.joblib`), varying from `0.0209` (low risk) to `0.9979` (critical alert) across different physical scenarios. Zero hardcoded labels.

5. **Dataset Attribution & Provenance**:
   - **Dataset Source**: CC0 Public Domain Synthetic Urban Hydrology Dataset (`data/synthetic_flood_data_demo_only.csv`).
   - Detailed schema, physics heuristics, and limitations documented in `data/DATASET_METADATA.md`.

6. **Repository Cleanliness (`.gitignore`)**:
   - Strictly ignores virtual environments (`venv/`), dependencies (`node_modules/`), SQLite database files (`*.db`), generated bundles (`dist/`), secret environment files (`.env`), and cache files.

---

## 🛠️ Git Commands for Initializing, Committing, and Pushing

To stage, commit, and push your changes to your GitHub repository:

```powershell
# 1. Check current repository status
git status

# 2. Stage all project files (ignoring excluded files defined in .gitignore)
git add .

# 3. Create a descriptive commit for Phase 4 & Phase 5 completion
git commit -m "feat: complete Phase 4 frontend integration and Phase 5 final verification"

# 4. (Optional) If pushing to a new repository URL, configure the remote:
# git remote add origin https://github.com/<your-username>/<your-repo-name>.git
# git branch -M main

# 5. Push to GitHub main branch
git push origin main
```

---

## 📋 Final Submission Checklist

| Feature / Requirement | Status | Verification Detail |
|---|---|---|
| **Flask Backend API** | ✅ Working | Runs on `http://127.0.0.1:5000` with CORS support |
| **SQLite Persistence** | ✅ Working | `jalarakshak.db` initialized with WAL mode & indexed queries |
| **ML Inference Pipeline** | ✅ Working | Random Forest ($86.3\%$ accuracy) evaluated dynamically |
| **OpenStreetMap GIS Map** | ✅ Working | React Leaflet map with distinct pins and popups |
| **Feature Schema Alignment** | ✅ Working | 7 features strictly validated against domain bounds |
| **Community Reports** | ✅ Working | Full submission, retrieval, and immediate map plotting |
| **Civic Safety Advisory** | ✅ Working | 3-stage actionable safety guide and emergency contacts |
| **Automated Test Suite** | ✅ Working | 9 API tests + 5 headless browser flow tests passing |
| **Zero Fabricated Live Data** | ✅ Verified | Only evaluated metrics and SQLite reports displayed |
| **Explicit DEMO DATA Tags** | ✅ Verified | Sample zones and presets clearly labeled as DEMO DATA |
