import React from 'react';

/**
 * Reusable badge to distinguish Phase 1 implemented features
 * from planned/placeholder features (Phase 2 & 3).
 */
export function StatusBadge({ type = 'planned', text, phase = 'Phase 2' }) {
  if (type === 'active') {
    return (
      <span className="status-badge active-badge">
        <span className="badge-dot dot-green"></span>
        {text || 'Active in Phase 1'}
      </span>
    );
  }

  return (
    <span className="status-badge planned-badge">
      <span className="badge-dot dot-amber"></span>
      {text || `Feature in Development (${phase})`}
    </span>
  );
}

/**
 * Notice banner to place at top of placeholder views
 */
export function PhasePlaceholderBanner({ title, description, plannedPhase = 'Phase 2' }) {
  return (
    <div className="placeholder-banner">
      <div className="banner-icon-col">
        <span className="banner-tag">{plannedPhase} PREVIEW</span>
      </div>
      <div className="banner-text-col">
        <h4 className="banner-title">{title}</h4>
        <p className="banner-desc">{description}</p>
      </div>
    </div>
  );
}
