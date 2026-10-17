import React, { useState } from 'react';
import { StatusBadge, PhasePlaceholderBanner } from '../components/StatusBadge';
import {
  IconTrendingUp,
  IconDroplet,
  IconCloudRain,
  IconShield,
  IconInfo,
  IconRefresh
} from '../components/Icons';
import { API_BASE_URL } from '../config';

export function PredictRiskView() {
  const [rainfall3h, setRainfall3h] = useState(65);
  const [rainfall24h, setRainfall24h] = useState(120);
  const [soilSaturation, setSoilSaturation] = useState(70);
  const [drainageCapacity, setDrainageCapacity] = useState(45);
  const [elevation, setElevation] = useState(8.5);
  const [tideLevel, setTideLevel] = useState(1.8);
  const [imperviousSurface, setImperviousSurface] = useState(65);

  const [predictionResult, setPredictionResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleRunInference = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    const payload = {
      rainfall_3h_mm: Number(rainfall3h),
      rainfall_24h_mm: Number(rainfall24h),
      soil_saturation_pct: Number(soilSaturation),
      drainage_capacity_pct: Number(drainageCapacity),
      elevation_m: Number(elevation),
      tide_level_m: Number(tideLevel),
      impervious_surface_pct: Number(imperviousSurface),
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.message || (data.errors ? data.errors.join(', ') : 'Inference request failed'));
        setPredictionResult(null);
      } else {
        setPredictionResult(data);
      }
    } catch (err) {
      setErrorMsg(`Connection error: ${err.message}. Ensure Flask backend is running.`);
      setPredictionResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Default display values before first API call
  const displayScore = predictionResult
    ? predictionResult.prediction.risk_score_pct
    : 50;
  const displayLevel = predictionResult
    ? predictionResult.prediction.risk_level
    : 'Pending Inference';
  const displayColor = predictionResult
    ? predictionResult.prediction.risk_color
    : 'amber';

  return (
    <div className="view-container">
      {/* Development Banner with DEMO ONLY mark */}
      <PhasePlaceholderBanner
        title="AI Flood-Risk Predictor (Phase 2 ML Pipeline Active • DEMO ONLY)"
        description="The Scikit-Learn Random Forest model is trained on a labeled synthetic urban hydrology dataset (CC0). Predictions are DEMO ONLY and are NOT validated for real-world flood disaster response."
        plannedPhase="Phase 2"
      />

      <div className="predict-layout">
        {/* Input Parameters Panel */}
        <div className="predict-card">
          <div className="predict-card-header">
            <div className="title-with-icon">
              <IconCloudRain className="icon-blue" size={22} />
              <div>
                <h3 className="card-title">Hydrological Simulation Inputs</h3>
                <span className="card-subtitle">Adjust parameters and run the Random Forest inference</span>
              </div>
            </div>
            <StatusBadge type="active" text="Model Loaded (RF-120)" />
          </div>

          <div className="predict-form">
            {/* 3h Rainfall Slider */}
            <div className="form-group">
              <div className="slider-header">
                <label className="form-label">
                  <IconCloudRain size={16} /> 3-Hour Rainfall Accumulation
                </label>
                <span className="slider-val">{rainfall3h} mm</span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                value={rainfall3h}
                onChange={(e) => setRainfall3h(Number(e.target.value))}
                className="range-slider"
              />
              <div className="slider-bounds">
                <span>0 mm (Drizzle)</span>
                <span>100 mm (Heavy)</span>
                <span>200 mm (Extreme)</span>
              </div>
            </div>

            {/* 24h Rainfall Slider */}
            <div className="form-group">
              <div className="slider-header">
                <label className="form-label">
                  <IconCloudRain size={16} /> 24-Hour Cumulative Rainfall
                </label>
                <span className="slider-val">{rainfall24h} mm</span>
              </div>
              <input
                type="range"
                min="0"
                max="400"
                value={rainfall24h}
                onChange={(e) => setRainfall24h(Number(e.target.value))}
                className="range-slider"
              />
              <div className="slider-bounds">
                <span>0 mm</span>
                <span>200 mm</span>
                <span>400 mm</span>
              </div>
            </div>

            {/* Soil Saturation Slider */}
            <div className="form-group">
              <div className="slider-header">
                <label className="form-label">
                  <IconDroplet size={16} /> Antecedent Soil Saturation
                </label>
                <span className="slider-val">{soilSaturation}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={soilSaturation}
                onChange={(e) => setSoilSaturation(Number(e.target.value))}
                className="range-slider"
              />
              <div className="slider-bounds">
                <span>10% (Dry Ground)</span>
                <span>50% (Damp)</span>
                <span>100% (Saturated)</span>
              </div>
            </div>

            {/* Drainage Network Capacity */}
            <div className="form-group">
              <div className="slider-header">
                <label className="form-label">
                  <IconShield size={16} /> Storm Drain Operability
                </label>
                <span className="slider-val">{drainageCapacity}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={drainageCapacity}
                onChange={(e) => setDrainageCapacity(Number(e.target.value))}
                className="range-slider"
              />
              <div className="slider-bounds">
                <span>10% (Choked Drains)</span>
                <span>50% (Standard)</span>
                <span>100% (Clean)</span>
              </div>
            </div>

            {/* Elevation */}
            <div className="form-group">
              <div className="slider-header">
                <label className="form-label">Catchment Mean Elevation</label>
                <span className="slider-val">{elevation} m</span>
              </div>
              <input
                type="range"
                min="2.0"
                max="40.0"
                step="0.5"
                value={elevation}
                onChange={(e) => setElevation(Number(e.target.value))}
                className="range-slider"
              />
              <div className="slider-bounds">
                <span>2.0m (Low-lying Basins)</span>
                <span>20.0m</span>
                <span>40.0m (High Ridge)</span>
              </div>
            </div>

            {/* Coastal Tide Level */}
            <div className="form-group">
              <div className="slider-header">
                <label className="form-label">Coastal / Estuary Tide Height</label>
                <span className="slider-val">{tideLevel} m</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.5"
                step="0.1"
                value={tideLevel}
                onChange={(e) => setTideLevel(Number(e.target.value))}
                className="range-slider"
              />
              <div className="slider-bounds">
                <span>0.5m (Low Tide)</span>
                <span>2.0m (Normal)</span>
                <span>3.5m (Spring Tide)</span>
              </div>
            </div>

            {/* Impervious Surface */}
            <div className="form-group">
              <div className="slider-header">
                <label className="form-label">Impervious Surface Ratio</label>
                <span className="slider-val">{imperviousSurface}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="95"
                value={imperviousSurface}
                onChange={(e) => setImperviousSurface(Number(e.target.value))}
                className="range-slider"
              />
              <div className="slider-bounds">
                <span>20% (Parks/Open)</span>
                <span>60% (Suburban)</span>
                <span>95% (Dense Urban)</span>
              </div>
            </div>

            <div className="form-submit-row">
              <button
                className="btn btn-primary"
                onClick={handleRunInference}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <IconRefresh size={16} className="spin" />
                    Running Model Inference...
                  </>
                ) : (
                  <>
                    <IconTrendingUp size={16} />
                    Execute Model Prediction (POST /api/predict)
                  </>
                )}
              </button>

              {errorMsg && (
                <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                  ⚠️ {errorMsg}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Prediction Output & Risk Gauge */}
        <div className="predict-card">
          <div className="predict-card-header">
            <div className="title-with-icon">
              <IconTrendingUp className="icon-teal" size={22} />
              <div>
                <h3 className="card-title">Model Risk Assessment</h3>
                <span className="card-subtitle">Random Forest Classifier (DEMO ONLY)</span>
              </div>
            </div>
            <span className={`risk-pill pill-${displayColor}`}>
              {displayLevel}
            </span>
          </div>

          <div className="risk-display-container">
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
              <h4 className="narrative-title">{displayLevel}</h4>
              <p className="narrative-desc">
                {predictionResult
                  ? predictionResult.prediction.action_advisory
                  : 'Click "Execute Model Prediction" above to evaluate current hydrological parameters against the trained Random Forest model.'}
              </p>
            </div>

            {/* Feature Influence Explanations */}
            {predictionResult?.influential_factors && (
              <div className="ml-pipeline-card" style={{ marginBottom: '1rem' }}>
                <div className="ml-pipeline-header">
                  <IconInfo size={16} />
                  <strong>Top Influential Model Factors:</strong>
                </div>
                <ul className="ml-pipeline-list">
                  {predictionResult.influential_factors.map((factor, idx) => (
                    <li key={idx}>
                      <strong>{factor.feature}</strong>: {factor.summary}
                    </li>
                  ))}
                </ul>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.5rem', fontStyle: 'italic' }}>
                  * Statistical association within Random Forest feature weighting; does not prove physical causation.
                </div>
              </div>
            )}

            {/* Model Architecture Note */}
            <div className="ml-pipeline-card">
              <div className="ml-pipeline-header">
                <IconInfo size={16} />
                <strong>Model Specifications & Metrics:</strong>
              </div>
              <ul className="ml-pipeline-list">
                <li>Algorithm: Scikit-learn Random Forest Classifier (120 trees, max_depth=10).</li>
                <li>Test Split Metrics: Accuracy: 86.3%, Precision: 85.3%, Recall: 92.3%, F1: 88.7%, ROC-AUC: 0.949.</li>
                <li>Dataset: CC0 Synthetic Urban Hydrology (2,000 samples with median imputation).</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
