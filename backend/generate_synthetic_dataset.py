"""
JalaRakshak AI - Synthetic Dataset Generator
PHASE 2: Machine Learning Pipeline Demonstration

DISCLAIMER: DEMO ONLY
Generates a labeled synthetic dataset for demonstration and validation
of the training and inference pipeline when external datasets are inaccessible.
Not validated for real-world flood prediction.
"""

import os
from pathlib import Path
import numpy as np
import pandas as pd

def generate_synthetic_flood_dataset(
    output_path: str = "data/synthetic_flood_data_demo_only.csv",
    n_samples: int = 2000,
    seed: int = 42
) -> pd.DataFrame:
    """
    Generates a reproducible, physically plausible synthetic urban hydrology dataset.
    """
    rng = np.random.default_rng(seed)

    # 1. rainfall_3h_mm (Short-term intense rainfall: 0 to 220 mm)
    rainfall_3h = rng.gamma(shape=2.0, scale=25.0, size=n_samples)
    rainfall_3h = np.clip(rainfall_3h, 0.0, 250.0).round(1)

    # 2. rainfall_24h_mm (Antecedent 24h rainfall: correlated with 3h rainfall)
    antecedent = rng.gamma(shape=2.5, scale=35.0, size=n_samples)
    rainfall_24h = np.clip(rainfall_3h * 1.4 + antecedent, 0.0, 500.0).round(1)

    # 3. soil_saturation_pct (10% to 100%)
    soil_saturation = rng.uniform(15.0, 98.0, size=n_samples).round(1)

    # 4. drainage_capacity_pct (10% to 95%)
    drainage_capacity = rng.uniform(15.0, 95.0, size=n_samples).round(1)

    # 5. elevation_m (1.0 to 45.0 meters above sea level)
    elevation = rng.uniform(2.0, 42.0, size=n_samples).round(1)

    # 6. tide_level_m (0.4 to 3.5 meters)
    tide_level = rng.uniform(0.5, 3.2, size=n_samples).round(2)

    # 7. impervious_surface_pct (25% to 92%)
    impervious_surface = rng.uniform(30.0, 90.0, size=n_samples).round(1)

    # Latent Hydrological Runoff Score:
    # High rainfall, high saturation, high imperviousness, high tide, low elevation, and low drainage
    # increase the probability of severe waterlogging / flooding.
    z = (
        0.025 * rainfall_3h +
        0.012 * rainfall_24h +
        0.028 * soil_saturation +
        0.020 * impervious_surface +
        0.45 * tide_level -
        0.035 * drainage_capacity -
        0.080 * elevation -
        2.5 +  # Intercept balancing class distribution
        rng.normal(0, 0.6, size=n_samples)  # Realistic observational / environmental noise
    )

    # Convert latent score to probability via sigmoid function
    flood_prob = 1.0 / (1.0 + np.exp(-z))

    # Binary target label
    flood_occurred = (flood_prob >= 0.50).astype(int)

    df = pd.DataFrame({
        "rainfall_3h_mm": rainfall_3h,
        "rainfall_24h_mm": rainfall_24h,
        "soil_saturation_pct": soil_saturation,
        "drainage_capacity_pct": drainage_capacity,
        "elevation_m": elevation,
        "tide_level_m": tide_level,
        "impervious_surface_pct": impervious_surface,
        "flood_occurred": flood_occurred
    })

    # Introduce a small percentage (~1.5%) of realistic missing values (NaNs)
    # to demonstrate robust handling of missing values in the training pipeline
    nan_mask_sat = rng.choice([True, False], size=n_samples, p=[0.015, 0.985])
    df.loc[nan_mask_sat, "soil_saturation_pct"] = np.nan

    nan_mask_drain = rng.choice([True, False], size=n_samples, p=[0.015, 0.985])
    df.loc[nan_mask_drain, "drainage_capacity_pct"] = np.nan

    nan_mask_rain24 = rng.choice([True, False], size=n_samples, p=[0.010, 0.990])
    df.loc[nan_mask_rain24, "rainfall_24h_mm"] = np.nan

    # Ensure output directory exists
    out_dir = Path(output_path).parent
    out_dir.mkdir(parents=True, exist_ok=True)

    df.to_csv(output_path, index=False)
    print(f"[OK] Generated {len(df)} synthetic samples at: {output_path}")
    print(f"     Class breakdown: 0 (No Flood) = {(df['flood_occurred'] == 0).sum()}, 1 (Flood) = {(df['flood_occurred'] == 1).sum()}")
    print(f"     Missing values: {df.isna().sum().to_dict()}")

    return df


if __name__ == "__main__":
    generate_synthetic_flood_dataset()
