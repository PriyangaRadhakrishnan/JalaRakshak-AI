"""
JalaRakshak AI — Phase 2: Inference & Feature Explanation Engine
Loads the trained Random Forest pipeline, validates inputs, and produces
risk predictions with feature influence explanations.

DISCLAIMER: DEMO ONLY
The underlying model was trained on a synthetic dataset for demonstration
of the ML pipeline. Predictions are for demonstration only and are NOT
validated for live disaster operations.
"""

import json
import math
import os
from pathlib import Path
from typing import Any, Dict, List, Tuple
import joblib
import numpy as np
import pandas as pd

# Path to model artifacts
BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "models" / "flood_rf_pipeline.joblib"
METADATA_PATH = BASE_DIR / "models" / "model_metadata.json"

# Cached pipeline & metadata singletons
_PIPELINE = None
_METADATA = None


def load_model_and_metadata() -> Tuple[Any, Dict]:
    """
    Loads and caches the fitted pipeline and metadata.
    """
    global _PIPELINE, _METADATA

    if _PIPELINE is None or _METADATA is None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(
                f"Model pipeline artifact not found at: {MODEL_PATH}. "
                "Please run `python backend/train_model.py` first."
            )
        if not METADATA_PATH.exists():
            raise FileNotFoundError(
                f"Model metadata artifact not found at: {METADATA_PATH}."
            )

        _PIPELINE = joblib.load(MODEL_PATH)
        with open(METADATA_PATH, "r", encoding="utf-8") as f:
            _METADATA = json.load(f)

    return _PIPELINE, _METADATA


def validate_prediction_input(input_data: Dict[str, Any], metadata: Dict) -> Tuple[bool, List[str], Dict[str, float]]:
    """
    Validates input parameters against feature specifications and physical bounds.
    Returns: (is_valid, error_messages, clean_numeric_features)
    """
    errors = []
    clean_features = {}

    if not isinstance(input_data, dict):
        return False, ["Input payload must be a JSON object / dictionary."], {}

    feature_specs = {f["name"]: f for f in metadata.get("features", [])}

    for name, spec in feature_specs.items():
        if name not in input_data:
            errors.append(f"Missing required feature: '{name}' ({spec['description']}, unit: {spec['unit']}).")
            continue

        raw_val = input_data[name]

        # Check numeric conversion
        try:
            val = float(raw_val)
            if math.isnan(val) or math.isinf(val):
                errors.append(f"Feature '{name}' cannot be NaN or infinite.")
                continue
        except (ValueError, TypeError):
            errors.append(f"Feature '{name}' must be numeric (received: {raw_val!r}).")
            continue

        # Range bounds validation
        min_val = spec["min"]
        max_val = spec["max"]
        if val < min_val or val > max_val:
            errors.append(
                f"Feature '{name}' value {val} is outside valid physical range [{min_val}, {max_val}] {spec['unit']}."
            )
            continue

        clean_features[name] = val

    is_valid = len(errors) == 0
    return is_valid, errors, clean_features


def explain_prediction_influences(
    clean_features: Dict[str, float],
    metadata: Dict,
    top_k: int = 3
) -> List[Dict[str, Any]]:
    """
    Identifies the top influential features for a given prediction sample
    based on model feature importance and deviation from expected baseline.

    CRITICAL NOTE:
    Identifies predictive feature influence within this Random Forest model;
    does NOT claim to prove physical or hydrological causation.
    """
    feature_importances = {
        item["feature"]: item["permutation_importance_mean"]
        for item in metadata.get("feature_importances", [])
    }
    feature_specs = {f["name"]: f for f in metadata.get("features", [])}

    influences = []

    for name, val in clean_features.items():
        spec = feature_specs.get(name, {})
        min_v = spec.get("min", 0.0)
        max_v = spec.get("max", 100.0)
        mid_v = (min_v + max_v) / 2.0
        unit = spec.get("unit", "")

        # Importance weight from model
        imp_weight = feature_importances.get(name, 0.1)

        # In hydrological intuition:
        # High rainfall, high saturation, high tide, high impervious surface increase flood risk.
        # High elevation and high drainage capacity decrease flood risk.
        if name in ["elevation_m", "drainage_capacity_pct"]:
            # Lower value -> higher flood contribution
            relative_deviation = (mid_v - val) / (max_v - min_v + 1e-6)
            direction = "elevates_risk" if val < mid_v else "mitigates_risk"
        else:
            # Higher value -> higher flood contribution
            relative_deviation = (val - mid_v) / (max_v - min_v + 1e-6)
            direction = "elevates_risk" if val > mid_v else "mitigates_risk"

        impact_score = abs(relative_deviation) * imp_weight

        influences.append({
            "feature": name,
            "value": val,
            "unit": unit,
            "direction": direction,
            "model_importance_weight": round(float(imp_weight), 4),
            "relative_impact_score": round(float(impact_score), 4),
            "summary": (
                f"{name} = {val}{unit} ({'increases' if direction == 'elevates_risk' else 'decreases'} model risk assessment)"
            )
        })

    # Sort by relative impact score descending
    influences.sort(key=lambda x: x["relative_impact_score"], reverse=True)
    return influences[:top_k]


def predict_flood_risk(input_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Main prediction entrypoint.
    Validates inputs, runs the Random Forest pipeline, and returns
    probabilities, risk categories, and non-causal feature explanations.
    """
    pipeline, metadata = load_model_and_metadata()

    # 1. Input Validation
    is_valid, errors, clean_features = validate_prediction_input(input_data, metadata)
    if not is_valid:
        return {
            "status": "validation_error",
            "is_demo_only": True,
            "errors": errors,
            "message": "Input validation failed. Please check feature names and numerical ranges."
        }

    # 2. Arrange features strictly in the trained order
    feature_order = metadata["feature_order"]
    input_row = [clean_features[f] for f in feature_order]
    df_sample = pd.DataFrame([input_row], columns=feature_order)

    # 3. Model Inference
    pred_class = int(pipeline.predict(df_sample)[0])
    probabilities = pipeline.predict_proba(df_sample)[0]
    flood_prob = float(probabilities[1])
    safe_prob = float(probabilities[0])

    # 4. Determine Civic Risk Level
    if flood_prob < 0.25:
        risk_level = "Low Risk"
        risk_color = "green"
        action_advisory = "Normal operations. Drainage network capacity adequate for anticipated precipitation."
    elif flood_prob < 0.50:
        risk_level = "Moderate Advisory"
        risk_color = "amber"
        action_advisory = "Monitor low-lying arterial underpasses and transit corridors. Pre-position municipal pump units."
    elif flood_prob < 0.75:
        risk_level = "High Warning"
        risk_color = "orange"
        action_advisory = "Localized street waterlogging likely. Issue alerts for vulnerable catchments; divert traffic from low roads."
    else:
        risk_level = "Critical Alert"
        risk_color = "red"
        action_advisory = "Severe inundation probable. Trigger community early warnings; initiate flood barrier and emergency evacuation protocols."

    # 5. Feature Influence Explanations (Compatible with Random Forest)
    top_influences = explain_prediction_influences(clean_features, metadata, top_k=3)

    return {
        "status": "success",
        "is_demo_only": True,
        "demo_disclaimer": metadata["demo_disclaimer"],
        "causality_disclaimer": metadata["causality_disclaimer"],
        "prediction": {
            "flood_predicted": bool(pred_class == 1),
            "flood_probability": round(flood_prob, 4),
            "no_flood_probability": round(safe_prob, 4),
            "risk_score_pct": round(flood_prob * 100, 1),
            "risk_level": risk_level,
            "risk_color": risk_color,
            "action_advisory": action_advisory,
        },
        "inputs_evaluated": clean_features,
        "influential_factors": top_influences,
        "model_info": {
            "model_name": metadata["model_name"],
            "accuracy_on_test": metadata["evaluation_metrics"]["accuracy"],
            "f1_score_on_test": metadata["evaluation_metrics"]["f1_score"],
        }
    }


if __name__ == "__main__":
    print("-" * 65)
    print("Testing JalaRakshak AI Prediction Pipeline")
    print("-" * 65)

    # Sample 1: Extreme Storm Scenario (Low elevation, heavy rainfall, high saturation, choked drainage)
    sample_severe = {
        "rainfall_3h_mm": 95.0,
        "rainfall_24h_mm": 180.0,
        "soil_saturation_pct": 88.0,
        "drainage_capacity_pct": 25.0,
        "elevation_m": 4.5,
        "tide_level_m": 2.6,
        "impervious_surface_pct": 82.0
    }
    result_severe = predict_flood_risk(sample_severe)
    print(f"[TEST 1] Extreme Storm Scenario:")
    print(f"         Prediction:  {result_severe['prediction']['risk_level']} (Prob: {result_severe['prediction']['flood_probability']})")
    print(f"         Flood Flag:  {result_severe['prediction']['flood_predicted']}")
    print(f"         Advisory:    {result_severe['prediction']['action_advisory']}")
    print(f"         Top factor:  {result_severe['influential_factors'][0]['summary']}")

    # Sample 2: Mild Scenario (High elevation, light rainfall, clean drainage)
    sample_mild = {
        "rainfall_3h_mm": 12.0,
        "rainfall_24h_mm": 25.0,
        "soil_saturation_pct": 28.0,
        "drainage_capacity_pct": 90.0,
        "elevation_m": 35.0,
        "tide_level_m": 0.8,
        "impervious_surface_pct": 35.0
    }
    result_mild = predict_flood_risk(sample_mild)
    print(f"\n[TEST 2] Mild Rainfall Scenario:")
    print(f"         Prediction:  {result_mild['prediction']['risk_level']} (Prob: {result_mild['prediction']['flood_probability']})")
    print(f"         Flood Flag:  {result_mild['prediction']['flood_predicted']}")
    print(f"         Top factor:  {result_mild['influential_factors'][0]['summary']}")

    # Sample 3: Validation Error Scenario (Out of range value)
    sample_invalid = {
        "rainfall_3h_mm": -10.0,  # Negative!
        "rainfall_24h_mm": 50.0,
        # Missing other keys
    }
    result_invalid = predict_flood_risk(sample_invalid)
    print(f"\n[TEST 3] Input Validation Rejection:")
    print(f"         Status:      {result_invalid['status']}")
    print(f"         Errors:      {result_invalid['errors']}")
    print("-" * 65)
