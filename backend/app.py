"""
JalaRakshak AI - Backend API
Phase 2: Machine Learning Hydrological Risk Pipeline

Local urban flood-risk prediction and community alert prototype.
"""

from datetime import datetime, timezone
import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv

from predict import predict_flood_risk, load_model_and_metadata

# Load local environment variables from .env if present
load_dotenv()

app = Flask(__name__)

# Configure CORS to allow communication with frontend development server
cors_origin = os.getenv("CORS_ORIGIN", "*")
CORS(app, resources={r"/api/*": {"origins": cors_origin}})


@app.route("/", methods=["GET"])
def index():
    """Root endpoint providing service overview."""
    return jsonify({
        "service": "JalaRakshak AI Backend API",
        "version": "1.1.0",
        "phase": "Phase 2 - Machine Learning Pipeline",
        "description": "Local Urban Flood-Risk Prediction and Community Alert Prototype",
        "endpoints": {
            "health_check": "GET /api/health",
            "model_metadata": "GET /api/model/metadata",
            "risk_prediction": "POST /api/predict",
            "community_reports": "GET/POST /api/reports (Phase 3)"
        },
        "documentation": "See README.md and data/DATASET_METADATA.md for specs"
    }), 200


@app.route("/api/health", methods=["GET"])
def health_check():
    """
    Health check endpoint for verifying backend uptime, operational status,
    and loaded machine learning model.
    """
    ml_status = "active"
    try:
        load_model_and_metadata()
    except Exception:
        ml_status = "error_loading_model"

    return jsonify({
        "status": "healthy",
        "service": "JalaRakshak AI Backend",
        "version": "1.1.0",
        "phase": "Phase 2 - Machine Learning Pipeline",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "environment": os.getenv("FLASK_ENV", "development"),
        "modules": {
            "health_api": "active",
            "ml_risk_predictor": ml_status,
            "flood_map_service": "wireframe_active",
            "community_reports": "pending_phase_3"
        }
    }), 200


@app.route("/api/model/metadata", methods=["GET"])
def model_metadata_endpoint():
    """Returns trained model performance metrics, feature order, and demo disclaimer."""
    try:
        _, metadata = load_model_and_metadata()
        return jsonify(metadata), 200
    except Exception as e:
        return jsonify({
            "error": "ModelNotLoaded",
            "message": str(e)
        }), 500


@app.route("/api/predict", methods=["POST"])
def predict_endpoint():
    """
    Phase 2: Hydrological flood risk prediction endpoint.
    Accepts JSON payload of hydrological indicators, validates inputs,
    and produces Random Forest classification & risk scoring.
    """
    payload = request.get_json(silent=True)
    if payload is None:
        return jsonify({
            "status": "error",
            "is_demo_only": True,
            "message": "Invalid JSON body or missing Content-Type: application/json header."
        }), 400

    result = predict_flood_risk(payload)
    if result.get("status") == "validation_error":
        return jsonify(result), 400

    return jsonify(result), 200


# --- Placeholders for Upcoming Phase 3 ---

@app.route("/api/reports", methods=["GET", "POST"])
def placeholder_reports():
    """Future Phase 3: Community flood reporting endpoint."""
    return jsonify({
        "error": "NotImplemented",
        "phase": "Phase 3",
        "message": "Crowdsourced database storage will be introduced in Phase 3."
    }), 501


if __name__ == "__main__":
    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_ENV", "development") == "development"
    print(f"[*] Starting JalaRakshak AI Backend on http://{host}:{port}")
    app.run(host=host, port=port, debug=debug)
