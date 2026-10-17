"""
JalaRakshak AI — Phase 2: Machine Learning Training Pipeline
Trains a Scikit-Learn Random Forest Classifier on urban flood risk data.

Adheres strictly to Phase 2 guidelines:
- Handles missing values via training-fitted median imputation.
- Prevents data leakage via stratified train/test split.
- Evaluates actual test set precision, recall, F1, and confusion matrix.
- Saves fitted pipeline and model metadata with exact feature specifications.
- Analyzes feature importance with explicit non-causal disclaimers.
- Marks all models and metrics as DEMO ONLY when trained on synthetic data.
"""

from datetime import datetime, timezone
import json
import os
from pathlib import Path
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.inspection import permutation_importance
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

# Exact feature definitions, order, units and physical validation boundaries
FEATURE_SPECS = [
    {
        "name": "rainfall_3h_mm",
        "type": "float",
        "unit": "mm",
        "description": "Short-duration precipitation accumulated over the preceding 3 hours",
        "min": 0.0,
        "max": 300.0,
    },
    {
        "name": "rainfall_24h_mm",
        "type": "float",
        "unit": "mm",
        "description": "Antecedent cumulative precipitation over the preceding 24 hours",
        "min": 0.0,
        "max": 600.0,
    },
    {
        "name": "soil_saturation_pct",
        "type": "float",
        "unit": "%",
        "description": "Antecedent surface soil saturation percentage",
        "min": 0.0,
        "max": 100.0,
    },
    {
        "name": "drainage_capacity_pct",
        "type": "float",
        "unit": "%",
        "description": "Stormwater drainage network clearance & operability percentage",
        "min": 0.0,
        "max": 100.0,
    },
    {
        "name": "elevation_m",
        "type": "float",
        "unit": "m",
        "description": "Mean terrain elevation of the catchment zone above sea level",
        "min": 0.0,
        "max": 100.0,
    },
    {
        "name": "tide_level_m",
        "type": "float",
        "unit": "m",
        "description": "Downstream coastal / estuary tide height creating backflow resistance",
        "min": 0.0,
        "max": 5.0,
    },
    {
        "name": "impervious_surface_pct",
        "type": "float",
        "unit": "%",
        "description": "Impervious surface ratio preventing natural rainwater infiltration",
        "min": 0.0,
        "max": 100.0,
    },
]

FEATURE_NAMES = [f["name"] for f in FEATURE_SPECS]
TARGET_COLUMN = "flood_occurred"


def train_flood_model(
    data_path: str = "data/synthetic_flood_data_demo_only.csv",
    output_dir: str = "backend/models",
    random_state: int = 42,
) -> dict:
    """
    Executes the end-to-end training, validation, and serialization pipeline.
    """
    print("=" * 65)
    print("JalaRakshak AI — Hydrological Random Forest Model Training")
    print("=" * 65)

    # 1. Load dataset
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Dataset not found at: {data_path}")

    df = pd.read_csv(data_path)
    print(f"[*] Loaded dataset: {data_path} ({len(df)} rows, {len(df.columns)} columns)")

    # Verify required columns exist
    missing_cols = [c for c in FEATURE_NAMES + [TARGET_COLUMN] if c not in df.columns]
    if missing_cols:
        raise ValueError(f"Dataset is missing required columns: {missing_cols}")

    X = df[FEATURE_NAMES].copy()
    y = df[TARGET_COLUMN].copy().astype(int)

    class_counts = y.value_counts().to_dict()
    print(f"[*] Target distribution: Class 0 (No Flood) = {class_counts.get(0, 0)}, Class 1 (Flood) = {class_counts.get(1, 0)}")

    # 2. Prevent Data Leakage via Stratified Train/Test Split
    # Test set is held out strictly until final model evaluation
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=random_state,
        stratify=y,
        shuffle=True,
    )
    print(f"[*] Stratified train/test split: Train = {len(X_train)} samples, Test = {len(X_test)} samples")
    print(f"    Missing values in Train: {X_train.isna().sum().to_dict()}")
    print(f"    Missing values in Test:  {X_test.isna().sum().to_dict()}")

    # 3. Construct Machine Learning Pipeline
    # Imputer and Scaler are fitted strictly on X_train to prevent leakage
    pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
            (
                "classifier",
                RandomForestClassifier(
                    n_estimators=120,
                    max_depth=10,
                    min_samples_split=6,
                    min_samples_leaf=3,
                    random_state=random_state,
                    n_jobs=-1,
                ),
            ),
        ]
    )

    print("[*] Fitting preprocessing pipeline and Random Forest on training split...")
    pipeline.fit(X_train, y_train)
    print("[+] Model training complete.")

    # 4. Evaluate Model on Unseen Test Split
    print("[*] Evaluating on held-out test data...")
    y_pred = pipeline.predict(X_test)
    y_proba = pipeline.predict_proba(X_test)[:, 1]

    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred, zero_division=0))
    rec = float(recall_score(y_test, y_pred, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, zero_division=0))
    roc_auc = float(roc_auc_score(y_test, y_proba))
    cm = confusion_matrix(y_test, y_pred).tolist()

    print(f"    - Accuracy:         {acc:.4f}")
    print(f"    - Precision (C=1):  {prec:.4f}")
    print(f"    - Recall (C=1):     {rec:.4f}")
    print(f"    - F1-Score:         {f1:.4f}")
    print(f"    - ROC AUC:          {roc_auc:.4f}")
    print(f"    - Confusion Matrix: TN={cm[0][0]}, FP={cm[0][1]}, FN={cm[1][0]}, TP={cm[1][1]}")

    clf_report = classification_report(y_test, y_pred, output_dict=True)

    # 5. Feature Importance Analysis (compatible with Random Forest)
    rf_model = pipeline.named_steps["classifier"]
    gini_importances = rf_model.feature_importances_

    # Compute Permutation Importance on Test Set for additional validation
    perm_result = permutation_importance(
        pipeline, X_test, y_test, n_repeats=10, random_state=random_state, n_jobs=-1
    )

    feature_importance_list = []
    for idx, name in enumerate(FEATURE_NAMES):
        feature_importance_list.append(
            {
                "feature": name,
                "gini_importance": round(float(gini_importances[idx]), 4),
                "permutation_importance_mean": round(float(perm_result.importances_mean[idx]), 4),
                "permutation_importance_std": round(float(perm_result.importances_std[idx]), 4),
            }
        )

    # Sort descending by permutation importance
    feature_importance_list.sort(key=lambda x: x["permutation_importance_mean"], reverse=True)

    print("\n[*] Feature Importance Rankings (from high to low impact):")
    for item in feature_importance_list:
        print(
            f"    - {item['feature']:<24}: perm_imp={item['permutation_importance_mean']:.4f} "
            f"(gini={item['gini_importance']:.4f})"
        )

    # 6. Save Pipeline and Metadata
    out_path = Path(output_dir)
    out_path.mkdir(parents=True, exist_ok=True)

    model_file = out_path / "flood_rf_pipeline.joblib"
    metadata_file = out_path / "model_metadata.json"

    joblib.dump(pipeline, model_file)
    print(f"\n[+] Saved fitted pipeline to: {model_file}")

    metadata = {
        "model_name": "JalaRakshak AI Hydrological Random Forest Classifier",
        "model_file": str(model_file.name),
        "pipeline_steps": ["imputer (median)", "scaler (standard)", "classifier (RandomForest)"],
        "dataset_source": "SYNTHETIC URBAN HYDROLOGY DATASET (DEMO ONLY)",
        "is_demo_only": True,
        "demo_disclaimer": (
            "DEMO ONLY: This model was trained on a synthetic dataset for demonstration "
            "of the ML pipeline and engineering verification. It is NOT validated for "
            "real-world municipal emergency operations or live disaster management."
        ),
        "causality_disclaimer": (
            "Feature importance metrics reflect associative predictive power within this "
            "Random Forest architecture on the given dataset. They describe statistical "
            "correlation and predictive utility, and do NOT establish physical or hydrological causation."
        ),
        "training_timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "target_column": TARGET_COLUMN,
        "classes": [0, 1],
        "class_labels": {"0": "No Flood", "1": "Flood Occurred"},
        "features": FEATURE_SPECS,
        "feature_order": FEATURE_NAMES,
        "evaluation_metrics": {
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1_score": round(f1, 4),
            "roc_auc": round(roc_auc, 4),
            "confusion_matrix": {
                "true_negative": cm[0][0],
                "false_positive": cm[0][1],
                "false_negative": cm[1][0],
                "true_positive": cm[1][1],
            },
            "classification_report": clf_report,
        },
        "feature_importances": feature_importance_list,
    }

    with open(metadata_file, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print(f"[+] Saved evaluation metrics & metadata to: {metadata_file}")
    print("=" * 65)

    return metadata


if __name__ == "__main__":
    train_flood_model()
