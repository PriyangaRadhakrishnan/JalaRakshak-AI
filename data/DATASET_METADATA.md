# JalaRakshak AI — Dataset Documentation & Provenance

> [!WARNING]
> **DISCLAIMER: DEMO ONLY**  
> This dataset is synthetically generated for engineering and demonstration purposes of the machine-learning pipeline within JalaRakshak AI. It is **NOT** a real-world measured dataset and is **NOT** validated for actual disaster management, live municipal operations, or real-world flood hazard forecasting. All downstream model outputs must be presented as **DEMO ONLY**.

---

## 1. Dataset Provenance & Reason for Synthetic Generation
- **Source**: Synthetically simulated urban hydrology dataset generated using reproducible physics-based heuristics.
- **Reason**: The local development environment lacks direct outbound internet access to download external historical rainfall/flood datasets (e.g. from IMD / data.gov). In strict adherence to Phase 2 guidelines (Requirement 9 & 10), a clearly labelled synthetic dataset is used rather than fabricating real-world sources or results.
- **License**: CC0 1.0 Universal (Public Domain).
- **Target Audience**: Demonstration of preprocessing, train/test splitting, Random Forest training, metrics logging, feature importance analysis, and inference validation.

---

## 2. Target Column & Problem Formulation
- **Target Column**: `flood_occurred`
- **Type**: Integer binary classification (`0` = No Flood / Safe, `1` = Flood / Inundation Occurred)
- **Positive Class Definition**: Urban runoff exceeding local drainage capacity resulting in waterlogging > 15 cm.

---

## 3. Feature Columns, Types, Units, and Order

| Index | Feature Name | Data Type | Physical Unit | Valid Range | Description |
| :---: | :--- | :---: | :---: | :---: | :--- |
| 1 | `rainfall_3h_mm` | Float | Millimeters (mm) | `[0.0, 300.0]` | Short-duration high-intensity precipitation accumulated over the preceding 3 hours |
| 2 | `rainfall_24h_mm` | Float | Millimeters (mm) | `[0.0, 600.0]` | Total antecedent cumulative rainfall over the preceding 24 hours |
| 3 | `soil_saturation_pct` | Float | Percentage (%) | `[0.0, 100.0]` | Degree of saturation of near-surface soil layers prior to rainfall |
| 4 | `drainage_capacity_pct` | Float | Percentage (%) | `[0.0, 100.0]` | Operability & clearance of local stormwater drains and culverts |
| 5 | `elevation_m` | Float | Meters (m) | `[0.0, 100.0]` | Mean topographic elevation of the catchment zone above sea level |
| 6 | `tide_level_m` | Float | Meters (m) | `[0.0, 5.0]` | Downstream estuary or coastal tide height creating backflow resistance |
| 7 | `impervious_surface_pct`| Float | Percentage (%) | `[0.0, 100.0]` | Ratio of paved, asphalt, or built-up surfaces preventing natural infiltration |

---

## 4. Preprocessing Specification for Inference
1. **Handling Missing Values**: Impute missing numerical values using median strategy computed strictly from the training split.
2. **Feature Order**: Inputs to the pipeline must strictly match the 7 features in the exact order documented above.
3. **Range Validation**: Input values outside physical bounds must be rejected with informative validation error messages.
