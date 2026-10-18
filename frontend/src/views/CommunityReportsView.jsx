import React, { useState, useEffect, useCallback } from 'react';
import { StatusBadge } from '../components/StatusBadge';
import {
  IconUsers,
  IconAlertTriangle,
  IconDroplet,
  IconMap,
  IconCheckCircle,
  IconRefresh,
  IconInfo
} from '../components/Icons';
import { fetchReports, submitReport } from '../services/api';

export function CommunityReportsView({ reports: propReports, onReportSubmitted, onNavigateToMap }) {
  const [reports, setReports] = useState(propReports || []);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // Filter and search state
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [locationDesc, setLocationDesc] = useState('');
  const [severity, setSeverity] = useState('Moderate');
  const [description, setDescription] = useState('');
  const [waterDepth, setWaterDepth] = useState('');
  const [drainBlocked, setDrainBlocked] = useState(false);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  // Sync with propReports if provided
  useEffect(() => {
    if (propReports && propReports.length > 0) {
      setReports(propReports);
    }
  }, [propReports]);

  // Load reports from backend SQLite
  const loadReportsFeed = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await fetchReports({ severity: selectedSeverity, limit: 100 });
      setReports(data.reports || []);
    } catch (err) {
      setFetchError(`Could not load reports: ${err.message}. Ensure Flask backend is running on port 5000.`);
    } finally {
      setIsLoading(false);
    }
  }, [selectedSeverity]);

  useEffect(() => {
    loadReportsFeed();
  }, [loadReportsFeed]);

  // Fill sample coordinates helper (DEMO DATA)
  const handleFillSampleCoordinates = () => {
    // Chennai basin illustrative sample coords
    const samples = [
      { lat: 13.0845, lon: 80.2795, loc: 'Ward 12 - Basin Bridge Railway Underpass' },
      { lat: 13.0760, lon: 80.2610, loc: 'Ward 18 - Perambur Barracks Lowland Culvert' },
      { lat: 13.0890, lon: 80.2850, loc: 'Ward 5 - Central Canal Outfall Gate' },
    ];
    const picked = samples[Math.floor(Math.random() * samples.length)];
    setLatitude(String(picked.lat));
    setLongitude(String(picked.lon));
    if (!locationDesc) {
      setLocationDesc(picked.loc);
    }
  };

  const handleClearCoordinates = () => {
    setLatitude('');
    setLongitude('');
  };

  // Submit report handler
  const handleSubmitReport = async (e) => {
    e.preventDefault();
    setSubmitSuccess(null);
    setSubmitError(null);

    // Client-side validation
    if (!locationDesc.trim()) {
      setSubmitError('Location / Ward Description is required.');
      return;
    }
    if (!description.trim()) {
      setSubmitError('Incident Description is required.');
      return;
    }

    let latNum = null;
    let lonNum = null;

    if (latitude !== '' || longitude !== '') {
      if (latitude === '' || longitude === '') {
        setSubmitError('Both Latitude and Longitude must be entered if coordinates are provided.');
        return;
      }
      latNum = parseFloat(latitude);
      lonNum = parseFloat(longitude);
      if (isNaN(latNum) || latNum < -90 || latNum > 90) {
        setSubmitError('Latitude must be a valid number between -90 and 90.');
        return;
      }
      if (isNaN(lonNum) || lonNum < -180 || lonNum > 180) {
        setSubmitError('Longitude must be a valid number between -180 and 180.');
        return;
      }
    }

    let depthNum = null;
    if (waterDepth !== '') {
      depthNum = parseFloat(waterDepth);
      if (isNaN(depthNum) || depthNum < 0 || depthNum > 500) {
        setSubmitError('Water depth must be between 0 and 500 cm.');
        return;
      }
    }

    setIsSubmitting(true);

    const payload = {
      location_description: locationDesc.trim(),
      severity: severity,
      description: description.trim(),
      water_depth_cm: depthNum,
      drain_blocked: drainBlocked ? 1 : 0,
      latitude: latNum,
      longitude: lonNum,
    };

    try {
      const data = await submitReport(payload);
      setSubmitSuccess({
        message: `Report #${data.report.id} submitted successfully and recorded!`,
        report: data.report,
      });

      // Reset form
      setLocationDesc('');
      setDescription('');
      setWaterDepth('');
      setDrainBlocked(false);
      setLatitude('');
      setLongitude('');

      // Refresh list
      await loadReportsFeed();

      // Notify parent App so FloodMap immediately reflects new report
      if (onReportSubmitted && data.report) {
        onReportSubmitted(data.report);
      }
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered reports for the feed
  const displayReports = reports.filter((report) => {
    if (selectedSeverity !== 'all' && (report.severity || '').toLowerCase() !== selectedSeverity.toLowerCase()) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchLoc = (report.location_description || '').toLowerCase().includes(q);
      const matchDesc = (report.description || '').toLowerCase().includes(q);
      const matchId = (report.id || '').toLowerCase().includes(q);
      return matchLoc || matchDesc || matchId;
    }
    return true;
  });

  return (
    <div className="view-container">
      {/* Notice Banner */}
      <div className="demo-data-alert-banner">
        <div className="alert-badge-col">
          <span className="demo-data-pill">CITIZEN NETWORK</span>
        </div>
        <div className="alert-content-col">
          <strong>Community Hazard Reporting:</strong> Submit local street waterlogging incidents, 
          choked storm drains, or submerged road corridors. Verified reports with coordinates are plotted 
          on the <strong>Flood Map</strong> immediately for emergency coordination.
        </div>
      </div>

      <div className="reports-layout">
        {/* Incident Reporting Form */}
        <div className="report-card">
          <div className="report-card-header">
            <div className="title-with-icon">
              <IconAlertTriangle className="icon-teal" size={22} />
              <div>
                <h3 className="card-title">Submit Local Hazard Incident</h3>
                <span className="card-subtitle">Report urban waterlogging & drainage blockages</span>
              </div>
            </div>
            <StatusBadge type="active" text="Civic Network" />
          </div>

          <form className="report-form" onSubmit={handleSubmitReport}>
            {/* Location Description */}
            <div className="form-group">
              <label className="form-label" htmlFor="rep-location">
                <IconMap size={16} /> Location / Ward Description *
              </label>
              <input
                id="rep-location"
                type="text"
                className="form-select"
                value={locationDesc}
                onChange={(e) => setLocationDesc(e.target.value)}
                placeholder="e.g. Ward 14 - Metro Subway Underpass North Exit"
                required
              />
            </div>

            {/* Severity Level */}
            <div className="form-group">
              <label className="form-label" htmlFor="rep-severity">
                Severity Level *
              </label>
              <select
                id="rep-severity"
                className="form-select"
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                required
              >
                <option value="Low">Low — Minor Street Ponding (&lt; 15 cm)</option>
                <option value="Moderate">Moderate — Road Passable with Caution (15 - 30 cm)</option>
                <option value="High">High — Water Entering Property / Stalled Traffic (30 - 60 cm)</option>
                <option value="Critical">Critical — Severe Inundation / Safety Threat (&gt; 60 cm)</option>
              </select>
            </div>

            {/* Water Depth */}
            <div className="form-group">
              <label className="form-label" htmlFor="rep-depth">
                <IconDroplet size={16} /> Estimated Water Depth (cm) (Optional)
              </label>
              <input
                id="rep-depth"
                type="number"
                min="0"
                max="500"
                step="1"
                className="form-select"
                value={waterDepth}
                onChange={(e) => setWaterDepth(e.target.value)}
                placeholder="e.g. 45"
              />
            </div>

            {/* Optional Coordinates with DEMO helper */}
            <div className="form-group">
              <div className="coords-header-row">
                <label className="form-label">Optional Coordinates (for GIS Flood Map)</label>
                <div className="coords-actions">
                  <button
                    type="button"
                    className="btn-text-action"
                    onClick={handleFillSampleCoordinates}
                    title="Fill sample basin coordinates"
                  >
                    Use Sample Basin Coords (DEMO DATA)
                  </button>
                  {(latitude || longitude) && (
                    <button
                      type="button"
                      className="btn-text-action text-muted"
                      onClick={handleClearCoordinates}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <input
                  type="number"
                  step="0.0001"
                  min="-90"
                  max="90"
                  className="form-select"
                  placeholder="Latitude (e.g. 13.0836)"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                />
                <input
                  type="number"
                  step="0.0001"
                  min="-180"
                  max="180"
                  className="form-select"
                  placeholder="Longitude (e.g. 80.2825)"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                />
              </div>
            </div>

            {/* Choked Drain Checkbox */}
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={drainBlocked}
                  onChange={(e) => setDrainBlocked(e.target.checked)}
                />
                <span>Storm drain or culvert is visibly blocked by plastic waste or silt</span>
              </label>
            </div>

            {/* Incident Description */}
            <div className="form-group">
              <label className="form-label" htmlFor="rep-desc">
                Incident Description & Observations *
              </label>
              <textarea
                id="rep-desc"
                className="form-textarea"
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe current road conditions, stranded vehicles, sewer overflow, or immediate hazards..."
                required
              ></textarea>
            </div>

            {/* Feedback Messages */}
            {submitSuccess && (
              <div className="success-banner">
                <div className="success-msg-row">
                  <IconCheckCircle size={18} className="icon-green" />
                  <span>{submitSuccess.message}</span>
                </div>
                {submitSuccess.report.latitude && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline"
                    style={{ marginTop: '0.5rem' }}
                    onClick={() => onNavigateToMap && onNavigateToMap(submitSuccess.report)}
                  >
                    <IconMap size={14} />
                    View Newly Added Report on Map
                  </button>
                )}
              </div>
            )}

            {submitError && (
              <div className="error-banner">
                ⚠️ {submitError}
              </div>
            )}

            {/* Submit Button */}
            <div className="form-submit-row">
              <button className="btn btn-primary btn-lg" type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <IconRefresh size={16} className="spin" />
                    Submitting Report...
                  </>
                ) : (
                  'Submit Citizen Hazard Report'
                )}
              </button>
              <span className="form-hint">
                Reports are verified and shared with municipal emergency response teams.
              </span>
            </div>
          </form>
        </div>

        {/* Live Community Feed */}
        <div className="report-card">
          <div className="report-card-header">
            <div className="title-with-icon">
              <IconUsers className="icon-blue" size={22} />
              <div>
                <h3 className="card-title">Community Incident Feed</h3>
                <span className="card-subtitle">Showing {displayReports.length} of {reports.length} reported incidents</span>
              </div>
            </div>
            <button
              className="btn btn-sm btn-outline"
              onClick={loadReportsFeed}
              disabled={isLoading}
              title="Refresh reports"
            >
              <IconRefresh size={14} className={isLoading ? 'spin' : ''} />
              Refresh
            </button>
          </div>

          {/* Search & Severity Filter Bar */}
          <div className="feed-filter-bar">
            <input
              type="text"
              className="form-select feed-search-input"
              placeholder="Search by ward, ID, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <select
              className="form-select feed-filter-select"
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
            >
              <option value="all">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Moderate">Moderate</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {fetchError && (
            <div className="error-banner">
              ⚠️ {fetchError}
            </div>
          )}

          {/* Reports Feed List */}
          <div className="feed-list">
            {isLoading && (
              <div className="loading-state">
                <IconRefresh size={20} className="spin icon-teal" />
                <span>Loading community hazard reports...</span>
              </div>
            )}

            {!isLoading && displayReports.length === 0 && (
              <div className="empty-state">
                <IconUsers size={32} />
                <h4 className="empty-title">No Incident Reports Found</h4>
                <p className="empty-desc">
                  {searchQuery || selectedSeverity !== 'all'
                    ? 'No reports match your current filter parameters.'
                    : 'No community reports are currently recorded in the database.'}
                </p>
              </div>
            )}

            {!isLoading &&
              displayReports.map((report) => (
                <div key={report.id} className="feed-item">
                  <div className="feed-item-header">
                    <div className="feed-meta">
                      <span className="feed-id">{report.id}</span>
                      <strong className="feed-ward">{report.location_description}</strong>
                    </div>
                    <span className={`severity-badge sev-${(report.severity || 'moderate').toLowerCase()}`}>
                      {report.severity}
                    </span>
                  </div>

                  <p className="feed-notes">{report.description}</p>

                  <div className="feed-specs">
                    {report.water_depth_cm !== null && (
                      <span>Depth: <strong>{report.water_depth_cm} cm</strong></span>
                    )}
                    {report.latitude !== null && report.longitude !== null && (
                      <span>
                        GPS: <strong>{Number(report.latitude).toFixed(4)}, {Number(report.longitude).toFixed(4)}</strong>
                      </span>
                    )}
                    {report.drain_blocked === 1 && (
                      <span className="tag-warning">⚠️ Choked Drain</span>
                    )}
                    <span className="tag-verify">
                      Status: {report.verification_status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="feed-footer">
                    <span className="feed-time">
                      {report.timestamp.includes('T')
                        ? report.timestamp.replace('T', ' ').substring(0, 16) + ' UTC'
                        : report.timestamp}
                    </span>

                    <div className="feed-actions-row">
                      <div className="verification-count">
                        <IconCheckCircle size={14} className="icon-green" />
                        <span>{report.upvotes || 0} confirmations</span>
                      </div>

                      {report.latitude !== null && report.longitude !== null && (
                        <button
                          type="button"
                          className="btn-locate-map"
                          onClick={() => onNavigateToMap && onNavigateToMap(report)}
                          title="Locate on Flood Map"
                        >
                          <IconMap size={13} />
                          Map
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>

          <div className="card-bottom-info">
            <IconInfo size={14} />
            <span>Community hazard reports are retained in the local database and shared with emergency coordination teams.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
