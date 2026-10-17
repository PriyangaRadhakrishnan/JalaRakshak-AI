# 🌊 JalaRakshak AI — Local Urban Flood-Risk & Community Alert

**JalaRakshak AI** is an open-source civic-technology prototype designed to provide localized urban flood-risk predictions and crowdsourced community waterlogging alerts. Operating on local edge environments with zero paid API dependencies, it bridges hydrological modeling with real-time citizen observations to safeguard vulnerable municipal wards and transit corridors.

---

## 📌 Phase Status

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
- **Comprehensive Evaluation**: Evaluated strictly on 400 held-out test samples:
  - **Accuracy**: 86.25%
  - **Precision (Class 1)**: 85.32%
  - **Recall (Class 1)**: 92.27%
  - **F1-Score**: 88.66%
  - **ROC-AUC**: 0.9487
  - **Confusion Matrix**: `TN=130, FP=37, FN=18, TP=215`
  - Saved to `backend/models/model_metadata.json`.
- **Inference & Input Validation**: Created `backend/predict.py` with strict physical bounds validation and clear rejection messages.
- **Feature Influence Explanation**: Identifies top influential features per prediction sample with the required disclaimer that statistical association does not prove hydrological causation.
- **API Integration**: Wired `POST /api/predict` and `GET /api/model/metadata` into the Flask server and connected the React frontend.

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
│   ├── app.py                    # Flask API with /api/health, /api/predict, /api/model/metadata
│   ├── generate_synthetic_dataset.py # Synthetic hydrology dataset generator
│   ├── predict.py                # Model inference, validation, and feature influence engine
│   ├── requirements.txt          # Python dependencies (Flask, Flask-CORS, scikit-learn, etc.)
│   ├── train_model.py            # Training pipeline, stratified split, evaluation, and serialization
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
            ├── CommunityReportsView.jsx # Citizen waterlogging reports wireframe
            ├── DashboardView.jsx # Live telemetry and diagnostics
            ├── FloodMapView.jsx  # GIS inundation map canvas preview
            └── PredictRiskView.jsx # Live interactive ML prediction & risk gauge
```

---

## 🚀 Quick Start Instructions (Windows PowerShell)

Follow these exact commands to run the backend and frontend in separate PowerShell terminals.

### 1️⃣ Terminal 1: Start the Backend (Flask API)

Open a PowerShell terminal in the repository root directory (`JalaRakshak AI`):

```powershell
# Navigate to the project root (if not already there)
cd "c:\Users\Dell\OneDrive\Desktop\JalaRakshak AI"

# 1. Create a Python virtual environment (only needed once)
python -m venv backend\venv

# 2. Activate the virtual environment
.\backend\venv\Scripts\Activate.ps1

# 3. Upgrade pip and install backend dependencies
python -m pip install --upgrade pip
pip install -r backend\requirements.txt

# 4. (Optional) Re-train the model if needed
python backend\train_model.py

# 5. Start the Flask backend server
python backend\app.py
```

*The Flask server will start at:* **`http://127.0.0.1:5000`**  
- Health Check: `GET http://127.0.0.1:5000/api/health`
- Model Metadata: `GET http://127.0.0.1:5000/api/model/metadata`
- Risk Prediction: `POST http://127.0.0.1:5000/api/predict`

---

### 2️⃣ Terminal 2: Start the Frontend (React + Vite)

Open a **second** PowerShell terminal in the repository root directory (`JalaRakshak AI`):

```powershell
# Navigate to the frontend directory
cd "c:\Users\Dell\OneDrive\Desktop\JalaRakshak AI\frontend"

# 1. Install frontend npm dependencies (only needed once)
npm install

# 2. Start the Vite development server
npm run dev
```

*The frontend application will start at:* **`http://localhost:5173`**

---

## 📊 Features & Model Specifications

### Features Required for Inference (`POST /api/predict`)

| Index | Feature Name | Type | Physical Unit | Valid Range | Description |
| :---: | :--- | :---: | :---: | :---: | :--- |
| 1 | `rainfall_3h_mm` | Float | Millimeters (mm) | `[0.0, 300.0]` | Short-term 3-hour precipitation accumulation |
| 2 | `rainfall_24h_mm` | Float | Millimeters (mm) | `[0.0, 600.0]` | Antecedent 24-hour precipitation accumulation |
| 3 | `soil_saturation_pct` | Float | Percentage (%) | `[0.0, 100.0]` | Antecedent soil moisture saturation percentage |
| 4 | `drainage_capacity_pct` | Float | Percentage (%) | `[0.0, 100.0]` | Storm drain clearance and operational capacity |
| 5 | `elevation_m` | Float | Meters (m) | `[0.0, 100.0]` | Mean terrain elevation above sea level |
| 6 | `tide_level_m` | Float | Meters (m) | `[0.0, 5.0]` | Coastal / estuary tide height causing backflow |
| 7 | `impervious_surface_pct`| Float | Percentage (%) | `[0.0, 100.0]` | Built-up impervious area ratio |

### Sample Inference Request (`POST /api/predict`):
```json
{
  "rainfall_3h_mm": 85.0,
  "rainfall_24h_mm": 160.0,
  "soil_saturation_pct": 80.0,
  "drainage_capacity_pct": 30.0,
  "elevation_m": 6.0,
  "tide_level_m": 2.4,
  "impervious_surface_pct": 75.0
}
```

### Sample Inference Response:
```json
{
  "status": "success",
  "is_demo_only": true,
  "demo_disclaimer": "DEMO ONLY: This model was trained on a synthetic dataset for demonstration of the ML pipeline. It is NOT validated for real-world disaster management.",
  "causality_disclaimer": "Feature importance metrics reflect associative predictive power within this Random Forest architecture; they do NOT establish physical or hydrological causation.",
  "prediction": {
    "flood_predicted": true,
    "flood_probability": 0.9969,
    "risk_score_pct": 99.7,
    "risk_level": "Critical Alert",
    "risk_color": "red",
    "action_advisory": "Severe inundation probable. Trigger community early warnings; initiate flood barrier and emergency evacuation protocols."
  },
  "influential_factors": [
    {
      "feature": "elevation_m",
      "value": 6.0,
      "summary": "elevation_m = 6.0m (increases model risk assessment)"
    }
  ]
}
```

---

## 📋 Status Matrix: What Works vs What Remains Incomplete

| Component | Status | Details |
| :--- | :--- | :--- |
| **Frontend UI & Views** | ✅ Complete | Responsive blue/teal/white dashboard, ErrorBoundary, navigation for all 5 sections. |
| **Backend Health Endpoint** | ✅ Complete | `GET /api/health` reports status, latency, timestamps, and active ML predictor. |
| **Configurable Local API** | ✅ Complete | `VITE_API_BASE_URL` with Vite proxy and error fallbacks. |
| **ML Training Pipeline** | ✅ Complete | `backend/train_model.py` with median imputation, stratified split, RF-120 training. |
| **Evaluation & Metrics** | ✅ Complete | Accuracy: 86.25%, Precision: 85.32%, Recall: 92.27%, F1: 88.66%, ROC-AUC: 0.9487. |
| **Input Validation & Inference**| ✅ Complete | `backend/predict.py` and `POST /api/predict` validate 7 features and return explanations. |
| **Interactive UI Prediction** | ✅ Complete | `Predict Risk` view directly calls `POST /api/predict` and displays live results. |
| **DEMO ONLY Labeling** | ✅ Complete | Explicitly declared on dataset, metadata, API responses, and frontend views. |
| **Database Persistence** | ⏳ Phase 3 | SQLite storage for community citizen reports (`/api/reports`) not yet implemented. |
| **Real-time GIS Vector Map**| ⏳ Phase 3 | Leaflet / MapLibre interactive raster tile layers currently in wireframe preview. |
| **Broadcast Alerts (SMS/Push)**| ⏳ Phase 3 | Citizen SMS/WhatsApp dispatches scheduled for Phase 3. |
