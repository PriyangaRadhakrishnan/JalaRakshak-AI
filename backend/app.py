"""
JalaRakshak AI — Phase 3: Flask Backend API & SQLite Storage
Local urban flood-risk prediction and community alert prototype.

Endpoints:
- GET  /api/health           : System health, DB connection, and ML status probe
- POST /api/predict          : Validated ML runoff prediction & feature explanations
- GET  /api/metrics          : Saved model evaluation metrics & feature specs
- GET  /api/reports          : Retrieve crowdsourced community waterlogging reports
- POST /api/reports          : Validate and insert new citizen hazard report to SQLite
- GET  /api/reports/<id>     : Retrieve a specific report by ID
"""

from datetime import datetime, timezone
import json
import os
from pathlib import Path
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv

from db import (
    init_db,
    check_db_health,
    create_report,
    get_all_reports,
    get_report_by_id,
    validate_report_payload,
)
from predict import predict_flood_risk, load_model_and_metadata, METADATA_PATH, MODEL_PATH

# Load local environment variables from .env if present
load_dotenv()

app = Flask(__name__)

# Configure CORS to allow communication with frontend development server
cors_origin = os.getenv("CORS_ORIGIN", "*")
CORS(app, resources={r"/api/*": {"origins": cors_origin}})

# Automatically initialize SQLite database and tables on startup
init_db()


@app.route("/", methods=["GET"])
def index():
    """Root endpoint providing service overview and available routes."""
    return jsonify({
        "service": "JalaRakshak AI Backend API",
        "version": "1.2.0",
        "phase": "Phase 3 - API & SQLite Database",
        "description": "Local Urban Flood-Risk Prediction and Community Alert Prototype",
        "endpoints": {
            "health": "GET /api/health",
            "predict": "POST /api/predict",
            "metrics": "GET /api/metrics",
            "reports_list": "GET /api/reports",
            "report_submit": "POST /api/reports",
            "report_detail": "GET /api/reports/<id>"
        },
        "documentation": "See README.md and data/DATASET_METADATA.md"
    }), 200


@app.route("/api/health", methods=["GET"])
def health_check():
    """
    Health check endpoint for verifying backend uptime, SQLite connectivity,
    and loaded ML model status.
    """
    # 1. Database health probe
    db_ok = check_db_health()
    db_status = "active" if db_ok else "unavailable"

    # 2. Machine Learning pipeline probe
    ml_status = "active"
    ml_error = None
    try:
        if not MODEL_PATH.exists() or not METADATA_PATH.exists():
            ml_status = "model_not_trained"
        else:
            load_model_and_metadata()
    except Exception as e:
        ml_status = "error_loading_model"
        ml_error = str(e)

    overall_status = "healthy" if (db_ok and ml_status == "active") else "degraded"

    return jsonify({
        "status": overall_status,
        "service": "JalaRakshak AI Backend",
        "version": "1.2.0",
        "phase": "Phase 3 - API & SQLite Storage",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "environment": os.getenv("FLASK_ENV", "development"),
        "modules": {
            "health_api": "active",
            "database": db_status,
            "ml_risk_predictor": ml_status,
            "community_reports": "active" if db_ok else "unavailable"
        },
        "ml_details": {
            "model_path": str(MODEL_PATH),
            "error": ml_error
        }
    }), 200 if overall_status == "healthy" else 503


@app.route("/api/metrics", methods=["GET"])
def get_metrics():
    """
    Returns actual saved model evaluation metrics from model_metadata.json.
    Returns clear unavailable status if model has not been evaluated.
    """
    if not METADATA_PATH.exists():
        return jsonify({
            "status": "unavailable",
            "message": "Model evaluation metrics are not available. Please run `python backend/train_model.py`."
        }), 404

    try:
        with open(METADATA_PATH, "r", encoding="utf-8") as f:
            metadata = json.load(f)

        return jsonify({
            "status": "available",
            "model_name": metadata.get("model_name"),
            "dataset_source": metadata.get("dataset_source"),
            "is_demo_only": metadata.get("is_demo_only", True),
            "demo_disclaimer": metadata.get("demo_disclaimer"),
            "causality_disclaimer": metadata.get("causality_disclaimer"),
            "training_timestamp_utc": metadata.get("training_timestamp_utc"),
            "train_samples": metadata.get("train_samples"),
            "test_samples": metadata.get("test_samples"),
            "features": metadata.get("features"),
            "feature_order": metadata.get("feature_order"),
            "evaluation_metrics": metadata.get("evaluation_metrics"),
            "feature_importances": metadata.get("feature_importances")
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Failed to read model metadata: {str(e)}"
        }), 500


@app.route("/api/predict", methods=["POST"])
def predict_endpoint():
    """
    Phase 3: Hydrological flood risk prediction endpoint.
    Loads actual saved ML pipeline, validates inputs against domain boundaries,
    and returns risk classification, probabilities, and non-causal explanations.

    Does NOT fabricate predictions if model is unavailable.
    """
    # Verify model artifact exists
    if not MODEL_PATH.exists() or not METADATA_PATH.exists():
        return jsonify({
            "status": "error",
            "error": "ModelUnavailable",
            "is_demo_only": True,
            "message": "ML model pipeline artifact not found on server. Please run `python backend/train_model.py` to train and save the model."
        }), 503

    payload = request.get_json(silent=True)
    if payload is None:
        return jsonify({
            "status": "error",
            "is_demo_only": True,
            "message": "Invalid JSON body or missing Content-Type: application/json header."
        }), 400

    try:
        result = predict_flood_risk(payload)
        if result.get("status") == "validation_error":
            return jsonify(result), 400

        return jsonify(result), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": "InferenceFailure",
            "is_demo_only": True,
            "message": f"Failed to execute model inference: {str(e)}"
        }), 500


@app.route("/api/reports", methods=["GET"])
def list_reports():
    """
    Returns stored community waterlogging reports from SQLite, sorted by timestamp descending.
    Supports optional query parameters: ?severity=<level>&limit=<int>
    """
    severity = request.args.get("severity")
    limit_raw = request.args.get("limit", "50")

    try:
        limit = min(max(1, int(limit_raw)), 200)
    except ValueError:
        limit = 50

    try:
        reports = get_all_reports(severity=severity, limit=limit)
        return jsonify({
            "status": "success",
            "count": len(reports),
            "filters": {
                "severity": severity,
                "limit": limit
            },
            "reports": reports
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Failed to retrieve community reports from database: {str(e)}"
        }), 500


@app.route("/api/reports", methods=["POST"])
def submit_report():
    """
    Validates and saves a citizen hazard report to SQLite.
    Requirements:
    - location_description: Required string
    - severity: Required ('Low', 'Moderate', 'High', 'Critical')
    - description: Required string
    - latitude & longitude: Optional, but if provided must be valid coordinates
    - timestamp & verification_status: Handled automatically if omitted
    """
    payload = request.get_json(silent=True)
    if payload is None:
        return jsonify({
            "status": "error",
            "message": "Invalid JSON body or missing Content-Type: application/json header."
        }), 400

    is_valid, errors, clean_data = validate_report_payload(payload)
    if not is_valid:
        return jsonify({
            "status": "validation_error",
            "errors": errors,
            "message": "Report validation failed. Please correct the listed errors."
        }), 400

    try:
        saved_report = create_report(clean_data)
        return jsonify({
            "status": "success",
            "message": "Community flood report recorded successfully.",
            "report": saved_report
        }), 201
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Failed to save report to database: {str(e)}"
        }), 500


@app.route("/api/reports/<report_id>", methods=["GET"])
def get_report(report_id):
    """Retrieves a single community report by its unique ID."""
    try:
        report = get_report_by_id(report_id)
        if not report:
            return jsonify({
                "status": "not_found",
                "message": f"No community report found with ID: '{report_id}'."
            }), 404

        return jsonify({
            "status": "success",
            "report": report
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Database query error: {str(e)}"
        }), 500


if __name__ == "__main__":
    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_ENV", "development") == "development"
    print(f"[*] Starting JalaRakshak AI Backend on http://{host}:{port}")
    app.run(host=host, port=port, debug=debug)
