import React, { useState } from 'react';
import { StatusBadge, PhasePlaceholderBanner } from '../components/StatusBadge';
import {
  IconUsers,
  IconAlertTriangle,
  IconDroplet,
  IconMap,
  IconCheckCircle,
  IconLock,
  IconInfo
} from '../components/Icons';

export function CommunityReportsView() {
  const [selectedWard, setSelectedWard] = useState('Ward 14');
  const [waterDepth, setWaterDepth] = useState('Knee-deep (30-60 cm)');
  const [drainBlockage, setDrainBlockage] = useState(true);

  const sampleReports = [
    {
      id: 'REP-1042',
      ward: 'Ward 14 - Metro Subway Underpass',
      timestamp: '25 mins ago',
      depth: 'Knee-deep (45 cm)',
      severity: 'Critical',
      blockedDrain: true,
      passable: 'Not Passable for 2-wheelers / Sedans',
      verifiedBy: 6,
      notes: 'Water accumulating rapidly due to debris lodged at the drainage intake grate.'
    },
    {
      id: 'REP-1041',
      ward: 'Ward 8 - North Canal Road',
      timestamp: '1 hour ago',
      depth: 'Ankle-deep (15 cm)',
      severity: 'Moderate',
      blockedDrain: false,
      passable: 'Slow Traffic',
      verifiedBy: 3,
      notes: 'Surface runoff pooling in curb lanes. Sluice gate downstream is open.'
    },
    {
      id: 'REP-1039',
      ward: 'Ward 22 - Low-lying Colony Layout',
      timestamp: '2 hours ago',
      depth: 'Shin-deep (25 cm)',
      severity: 'Elevated',
      blockedDrain: true,
      passable: 'Caution Advised',
      verifiedBy: 11,
      notes: 'Residential lane backflow reported. Municipal ward officer alerted by community volunteers.'
    }
  ];

  return (
    <div className="view-container">
      {/* Development Banner */}
      <PhasePlaceholderBanner
        title="Community Flood Reports & Alerts (Phase 2 Preview)"
        description="This module enables local citizens to report localized waterlogging incidents, choked storm drains, and road inundations. The SQLite backend storage, image proof ingest, and SMS/WhatsApp broadcast queues will be enabled in Phase 2."
        plannedPhase="Phase 2"
      />

      <div className="reports-layout">
        {/* Incident Reporting Form Preview */}
        <div className="report-card">
          <div className="report-card-header">
            <div className="title-with-icon">
              <IconAlertTriangle className="icon-teal" size={22} />
              <div>
                <h3 className="card-title">Submit Local Hazard Incident</h3>
                <span className="card-subtitle">Citizen crowdsourced reporting wireframe</span>
              </div>
            </div>
            <StatusBadge type="planned" phase="Phase 2" text="DB Storage Pending" />
          </div>

          <form className="report-form" onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
              <label className="form-label">
                <IconMap size={16} /> Municipal Ward / Neighborhood
              </label>
              <select
                className="form-select"
                value={selectedWard}
                onChange={(e) => setSelectedWard(e.target.value)}
              >
                <option value="Ward 14">Ward 14 - Metro Subway Underpass</option>
                <option value="Ward 8">Ward 8 - North Canal Road</option>
                <option value="Ward 22">Ward 22 - Low-lying Colony Layout</option>
                <option value="Ward 5">Ward 5 - Central Market Basin</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                <IconDroplet size={16} /> Estimated Water Depth
              </label>
              <select
                className="form-select"
                value={waterDepth}
                onChange={(e) => setWaterDepth(e.target.value)}
              >
                <option value="Ankle-deep (10-20 cm)">Ankle-deep (10 - 20 cm)</option>
                <option value="Knee-deep (30-60 cm)">Knee-deep (30 - 60 cm)</option>
                <option value="Waist-deep (> 60 cm)">Waist-deep (&gt; 60 cm)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={drainBlockage}
                  onChange={(e) => setDrainBlockage(e.target.checked)}
                />
                <span>Storm drain or culvert is visibly blocked by debris/trash</span>
              </label>
            </div>

            <div className="form-group">
              <label className="form-label">Incident Description / Observations</label>
              <textarea
                className="form-textarea"
                rows="3"
                placeholder="Describe current road conditions, stranded vehicles, or immediate risks..."
                defaultValue="Underpass water rising rapidly. Cars turning back."
              ></textarea>
            </div>

            <div className="form-submit-row">
              <button className="btn btn-primary" disabled>
                <IconLock size={16} />
                Publish Citizen Report (Phase 2 Feature)
              </button>
              <span className="form-hint">
                Backend route <code>POST /api/reports</code> and SQLite schema will be introduced in Phase 2.
              </span>
            </div>
          </form>
        </div>

        {/* Community Verification Stream */}
        <div className="report-card">
          <div className="report-card-header">
            <div className="title-with-icon">
              <IconUsers className="icon-blue" size={22} />
              <div>
                <h3 className="card-title">Live Community Feed</h3>
                <span className="card-subtitle">Recent localized citizen submissions</span>
              </div>
            </div>
            <StatusBadge type="planned" phase="Phase 2" text="Sample Data" />
          </div>

          <div className="feed-list">
            {sampleReports.map((report) => (
              <div key={report.id} className="feed-item">
                <div className="feed-item-header">
                  <div className="feed-meta">
                    <span className="feed-id">{report.id}</span>
                    <strong className="feed-ward">{report.ward}</strong>
                  </div>
                  <span className={`severity-badge sev-${report.severity.toLowerCase()}`}>
                    {report.severity}
                  </span>
                </div>

                <p className="feed-notes">{report.notes}</p>

                <div className="feed-specs">
                  <span>Depth: <strong>{report.depth}</strong></span>
                  <span>Passability: <strong>{report.passable}</strong></span>
                  {report.blockedDrain && (
                    <span className="tag-warning">⚠️ Choked Drain</span>
                  )}
                </div>

                <div className="feed-footer">
                  <span className="feed-time">{report.timestamp}</span>
                  <div className="verification-count">
                    <IconCheckCircle size={14} className="icon-green" />
                    <span>{report.verifiedBy} citizens confirmed</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card-bottom-info">
            <IconInfo size={14} />
            <span>Phase 2 will introduce community upvoting and automated municipal escalation rules.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
