import React, { useState } from 'react';
import { StatusBadge } from '../components/StatusBadge';
import {
  IconTrendingUp,
  IconDroplet,
  IconCloudRain,
  IconShield,
  IconInfo,
  IconRefresh,
  IconAlertTriangle
} from '../components/Icons';
import { predictFloodRisk } from '../services/api';

// Feature specifications strictly aligned with backend/models/model_metadata.json
const FEATURE_SPECS = [
  {
    key: 'rainfall_3h_mm',
    label: '3-Hour Precipitation Accumulation',
    unit: 'mm',
    min: 0.0,
    max: 300.0,
    step: 1.0,
    defaultVal: 65.0,
    description: 'Short-duration rainfall volume over the preceding 3 hours',
    icon: IconCloudRain,
  },
  {
    key: 'rainfall_24h_mm',
    label: '24-Hour Cumulative Precipitation',
    unit: 'mm',
    min: 0.0,
    max: 600.0,
    step: 1.0,
    defaultVal: 120.0,
    description: 'Antecedent cumulative rainfall over the preceding 24 hours',
    icon: IconCloudRain,
  },
  {
    key: 'soil_saturation_pct',
    label: 'Antecedent Soil Saturation',
    unit: '%',
    min: 0.0,
    max: 100.0,
    step: 1.0,
    defaultVal: 70.0,
    description: 'Pre-existing soil moisture saturation percentage',
    icon: IconDroplet,
  },
  {
    key: 'drainage_capacity_pct',
    label: 'Stormwater Drainage Operability',
    unit: '%',
    min: 0.0,
    max: 100.0,
    step: 1.0,
    defaultVal: 45.0,
    description: 'Stormwater network clearance and pump discharge percentage',
    icon: IconShield,
  },
  {
    key: 'elevation_m',
    label: 'Catchment Mean Elevation',
    unit: 'm',
    min: 0.0,
    max: 100.0,
    step: 0.5,
    defaultVal: 8.5,
    description: 'Mean terrain elevation of the catchment zone above sea level',
    icon: IconTrendingUp,
  },
  {
    key: 'tide_level_m',
    label: 'Coastal / Estuary Tide Height',
    unit: 'm',
    min: 0.0,
    max: 5.0,
    step: 0.1,
    defaultVal: 1.8,
    description: 'Downstream coastal / estuary tide height creating backflow resistance',
    icon: IconDroplet,
  },
  {
    key: 'impervious_surface_pct',
    label: 'Impervious Surface Ratio',
    unit: '%',
    min: 0.0,
    max: 100.0,
    step: 1.0,
    defaultVal: 65.0,
    description: 'Paved / concrete surface percentage preventing rainwater infiltration',
    icon: IconShield,
  },
];

export function PredictRiskView() {
  // Controlled form state initialized to default values
  const [formValues, setFormValues] = useState({
    rainfall_3h_mm: 65.0,
    rainfall_24h_mm: 120.0,
    soil_saturation_pct: 70.0,
    drainage_capacity_pct: 45.0,
    elevation_m: 8.5,
    tide_level_m: 1.8,
    impervious_surface_pct: 65.0,
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [predictionResult, setPredictionResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Validate single input field against physical schema bounds
  const validateField = (key, val) => {
    const spec = FEATURE_SPECS.find((s) => s.key === key);
    if (!spec) return null;
    if (isNaN(val) || val === '') return `Must be a valid number.`;
    const num = Number(val);
    if (num < spec.min || num > spec.max) {
      return `Value ${num} is out of valid range [${spec.min}, ${spec.max}] ${spec.unit}.`;
    }
    return null;
  };

  const handleInputChange = (key, rawValue) => {
    const numVal = rawValue === '' ? '' : Number(rawValue);
    setFormValues((prev) => ({ ...prev, [key]: numVal }));

    const error = validateField(key, numVal);
    setFieldErrors((prev) => {
      const next = { ...prev };
      if (error) {
        next[key] = error;
      } else {
        delete next[key];
      }
      return next;
    });
  };

  // Demo Preset Scenarios (DEMO DATA)
  const applyPreset = (presetKey) => {
    let preset = {};
    if (presetKey === 'severe') {
      preset = {
        rainfall_3h_mm: 95.0,
        rainfall_24h_mm: 180.0,
        soil_saturation_pct: 88.0,
        drainage_capacity_pct: 25.0,
        elevation_m: 4.5,
        tide_level_m: 2.6,
        impervious_surface_pct: 82.0,
      };
    } else if (presetKey === 'moderate') {
      preset = {
        rainfall_3h_mm: 45.0,
        rainfall_24h_mm: 85.0,
        soil_saturation_pct: 60.0,
        drainage_capacity_pct: 60.0,
        elevation_m: 12.0,
        tide_level_m: 1.5,
        impervious_surface_pct: 55.0,
      };
    } else if (presetKey === 'low') {
      preset = {
        rainfall_3h_mm: 12.0,
        rainfall_24h_mm: 25.0,
        soil_saturation_pct: 28.0,
        drainage_capacity_pct: 90.0,
        elevation_m: 35.0,
        tide_level_m: 0.8,
        impervious_surface_pct: 35.0,
      };
    }
    setFormValues(preset);
    setFieldErrors({});
    setApiError(null);
  };

  // Execute ML prediction endpoint POST /api/predict
  const handleRunInference = async (e) => {
    if (e) e.preventDefault();

    // Client-side validation across all fields
    const errors = {};
    for (const spec of FEATURE_SPECS) {
      const err = validateField(spec.key, formValues[spec.key]);
      if (err) errors[spec.key] = err;
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setApiError('Please correct out-of-bounds parameters before executing prediction.');
      return;
    }

    setIsLoading(true);
    setApiError(null);

    const payload = {
      rainfall_3h_mm: Number(formValues.rainfall_3h_mm),
      rainfall_24h_mm: Number(formValues.rainfall_24h_mm),
      soil_saturation_pct: Number(formValues.soil_saturation_pct),
      drainage_capacity_pct: Number(formValues.drainage_capacity_pct),
      elevation_m: Number(formValues.elevation_m),
      tide_level_m: Number(formValues.tide_level_m),
      impervious_surface_pct: Number(formValues.impervious_surface_pct),
    };

    try {
      const data = await predictFloodRisk(payload);
      setPredictionResult(data);
    } catch (err) {
      setApiError(err.message || 'Inference execution failed.');
      setPredictionResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const pred = predictionResult?.prediction;
  const displayScore = pred ? pred.risk_score_pct : 0;
  const displayLevel = pred ? pred.risk_level : 'Awaiting Inference';
  const displayColor = pred ? pred.risk_color : 'amber';

  return (
    <div className="view-container">
      {/* Notice Banner */}
      <div className="demo-data-alert-banner">
        <div className="alert-badge-col">
          <span className="demo-data-pill">DEMO DATA NOTICE</span>
        </div>
        <div className="alert-content-col">
          <strong>Hydrological Inundation Risk Predictor:</strong> The Random Forest model runs inferences 
          against domain physical schemas. All sample presets and environmental inputs are <em>synthetic test parameters</em>. 
          Never imply an environmental simulation represents live disaster conditions.
        </div>
      </div>

      <div className="predict-layout">
        {/* Input Parameters Panel */}
        <div className="predict-card">
          <div className="predict-card-header">
            <div className="title-with-icon">
              <IconCloudRain className="icon-blue" size={22} />
              <div>
                <h3 className="card-title">Hydrological Simulation Inputs</h3>
                <span className="card-subtitle">Validated against trained Random Forest schema (7 features)</span>
              </div>
            </div>
            <StatusBadge type="active" text="AI Predictor Active" />
          </div>

          {/* Preset Buttons (Marked DEMO DATA) */}
          <div className="preset-bar">
            <span className="preset-label">Test Scenarios (DEMO DATA):</span>
            <div className="preset-buttons">
              <button
                type="button"
                className="btn-preset"
                onClick={() => applyPreset('severe')}
                title="Low elevation, 95mm/3h rain, choked drains"
              >
                🔴 Cloudburst & Choked Lowland
              </button>
              <button
                type="button"
                className="btn-preset"
                onClick={() => applyPreset('moderate')}
                title="Mid elevation, 45mm/3h rain, standard drainage"
              >
                🟡 Moderate Monsoon Surge
              </button>
              <button
                type="button"
                className="btn-preset"
                onClick={() => applyPreset('low')}
                title="High elevation, 12mm rain, clear drainage"
              >
                🟢 Dry Season Ridge
              </button>
            </div>
          </div>

          <form className="predict-form" onSubmit={handleRunInference}>
            {FEATURE_SPECS.map((spec) => {
              const Icon = spec.icon;
              const val = formValues[spec.key];
              const error = fieldErrors[spec.key];

              return (
                <div key={spec.key} className={`form-group ${error ? 'has-error' : ''}`}>
                  <div className="slider-header">
                    <label className="form-label">
                      <Icon size={16} /> {spec.label}
                    </label>
                    <div className="input-number-pill">
                      <input
                        type="number"
                        min={spec.min}
                        max={spec.max}
                        step={spec.step}
                        value={val}
                        onChange={(e) => handleInputChange(spec.key, e.target.value)}
                        className="numeric-inline-input"
                        aria-label={spec.label}
                      />
                      <span className="input-unit">{spec.unit}</span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min={spec.min}
                    max={spec.max}
                    step={spec.step}
                    value={val === '' ? spec.min : val}
                    onChange={(e) => handleInputChange(spec.key, e.target.value)}
                    className="range-slider"
                  />

                  <div className="slider-bounds">
                    <span>{spec.min} {spec.unit}</span>
                    <span className="slider-hint">{spec.description}</span>
                    <span>{spec.max} {spec.unit}</span>
                  </div>

                  {error && <span className="field-error-msg">⚠️ {error}</span>}
                </div>
              );
            })}

            <div className="form-submit-row">
              <button
                className="btn btn-primary btn-lg"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <IconRefresh size={18} className="spin" />
                    Calculating Inundation Risk...
                  </>
                ) : (
                  <>
                    <IconTrendingUp size={18} />
                    Calculate Flood Risk Assessment
                  </>
                )}
              </button>

              {apiError && (
                <div className="error-banner" style={{ marginTop: '0.75rem' }}>
                  ⚠️ {apiError}
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Prediction Output & Risk Gauge */}
        <div className="predict-card">
          <div className="predict-card-header">
            <div className="title-with-icon">
              <IconTrendingUp className="icon-teal" size={22} />
              <div>
                <h3 className="card-title">Model Risk Assessment</h3>
                <span className="card-subtitle">Random Forest Classifier Output</span>
              </div>
            </div>
            {pred && (
              <span className={`risk-pill pill-${displayColor}`}>
                {displayLevel}
              </span>
            )}
          </div>

          <div className="risk-display-container">
            {/* Empty State: Prompt before execution */}
            {!pred && !isLoading && (
              <div className="empty-state">
                <IconTrendingUp size={36} className="icon-blue" />
                <h4 className="empty-title">Ready for Hydrological Simulation</h4>
                <p className="empty-desc">
                  Adjust environmental parameters on the left or select a <strong>DEMO DATA</strong> scenario,
                  then click <strong>Calculate Flood Risk Assessment</strong> to evaluate risk.
                </p>
                <div className="empty-hint">
                  The model evaluates your inputs against the trained Scikit-learn Random Forest model (86.3% accuracy).
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="loading-state-box">
                <IconRefresh size={32} className="spin icon-teal" />
                <h4>Analyzing Hydrological Parameters...</h4>
                <p>Evaluating catchment topography, precipitation surge, and drainage throughput</p>
              </div>
            )}

            {/* Prediction Result Display */}
            {pred && !isLoading && (
              <>
                {/* Visual Risk Gauge Meter */}
                <div className="meter-circle">
                  <svg className="meter-svg" viewBox="0 0 200 120">
                    <path
                      d="M 20 100 A 80 80 0 0 1 180 100"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="16"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 20 100 A 80 80 0 0 1 180 100"
                      fill="none"
                      stroke={
                        displayColor === 'green' ? '#10b981' :
                        displayColor === 'amber' ? '#f59e0b' :
                        displayColor === 'orange' ? '#f97316' : '#ef4444'
                      }
                      strokeWidth="16"
                      strokeDasharray="251"
                      strokeDashoffset={251 - (251 * (displayScore / 100))}
                      strokeLinecap="round"
                      className="meter-bar"
                    />
                  </svg>
                  <div className="meter-text">
                    <span className="meter-score">{displayScore}</span>
                    <span className="meter-scale">/ 100</span>
                  </div>
                </div>

                <div className="risk-narrative">
                  <div className="pred-flag-row">
                    <span className={`flood-flag-pill ${pred.flood_predicted ? 'flag-flood' : 'flag-safe'}`}>
                      {pred.flood_predicted ? '⚠️ FLOOD RISK DETECTED' : '✓ LOW INUNDATION PROBABILITY'}
                    </span>
                    <span className="prob-stat">
                      Model Confidence: <strong>{(pred.flood_probability * 100).toFixed(1)}%</strong>
                    </span>
                  </div>

                  <h4 className="narrative-title">{pred.risk_level}</h4>
                  <p className="narrative-desc">
                    {pred.action_advisory}
                  </p>
                </div>

                {/* Influential Factors (Real from model explanation) */}
                {predictionResult?.influential_factors && (
                  <div className="ml-pipeline-card">
                    <div className="ml-pipeline-header">
                      <IconInfo size={16} />
                      <strong>Top Influential Model Factors (Permutation Weighted):</strong>
                    </div>
                    <ul className="ml-pipeline-list">
                      {predictionResult.influential_factors.map((factor, idx) => (
                        <li key={idx} className="influence-item">
                          <div className="influence-header">
                            <span className="factor-name">{factor.feature}:</span>
                            <span className={`factor-badge badge-${factor.direction === 'elevates_risk' ? 'red' : 'green'}`}>
                              {factor.direction === 'elevates_risk' ? '↑ Elevates Risk' : '↓ Mitigates Risk'}
                            </span>
                          </div>
                          <p className="factor-summary">{factor.summary}</p>
                          <div className="factor-meta">
                            <span>Value: <strong>{factor.value}{factor.unit}</strong></span>
                            <span>Model Weight: <strong>{factor.model_importance_weight}</strong></span>
                            <span>Impact Score: <strong>{factor.relative_impact_score}</strong></span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Data Limitations & Non-Causality Disclaimers */}
                <div className="limitations-card">
                  <div className="limitations-header">
                    <IconAlertTriangle size={16} className="icon-orange" />
                    <strong>Data Limitations & Technical Disclaimers</strong>
                  </div>
                  <div className="limitations-body">
                    <p className="limitation-text">
                      <strong>Demo Dataset:</strong> {predictionResult.demo_disclaimer}
                    </p>
                    <p className="limitation-text">
                      <strong>Statistical Association:</strong> {predictionResult.causality_disclaimer}
                    </p>
                    <p className="limitation-note">
                      * Confidence probability represents the Random Forest ensemble tree vote split (e.g., {pred.flood_probability}),
                      and does not claim to invent or guarantee physical certainty.
                    </p>
                  </div>
                </div>

                {/* Specific Safety Advisory for Evaluated Level */}
                <div className="safety-action-card">
                  <div className="safety-card-title">
                    <IconShield size={16} className="icon-teal" />
                    <span>Recommended Civic Action for {pred.risk_level}:</span>
                  </div>
                  <p className="safety-card-text">
                    {displayColor === 'red' &&
                      'Critical Alert: Initiate community evacuation from basements and ground-floor dwellings. Do not attempt road transit. Avoid transformers and flooded manholes.'}
                    {displayColor === 'orange' &&
                      'High Warning: Pre-position mobile municipal pumps. Secure valuables above ground level. Avoid walking or driving in pooled water.'}
                    {displayColor === 'amber' &&
                      'Moderate Advisory: Monitor municipal ward channels and low underpasses. Ensure surface gutter grates are cleared of debris.'}
                    {displayColor === 'green' &&
                      'Low Risk: Standard operational readiness. Routine drainage maintenance sufficient.'}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
