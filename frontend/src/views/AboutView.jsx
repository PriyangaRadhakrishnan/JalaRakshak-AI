import React from 'react';
import {
  IconShield,
  IconDroplet,
  IconAlertTriangle,
  IconMap,
  IconTrendingUp,
  IconUsers
} from '../components/Icons';

export function AboutView() {
  return (
    <div className="view-container">
      {/* Hero Header */}
      <div className="about-hero">
        <div className="about-title-row">
          <div className="about-logo-badge">
            <IconShield size={32} className="icon-teal" />
          </div>
          <div>
            <h2 className="about-title">About JalaRakshak AI</h2>
            <p className="about-tagline">
              Local Urban Flood Resilience, Hydrological Modeling & Community Early Warning Platform
            </p>
          </div>
        </div>
      </div>

      {/* General Civic Safety Protocols (Comprehensive Guide) */}
      <section className="safety-guide-section">
        <div className="safety-guide-header">
          <IconAlertTriangle size={24} className="icon-orange" />
          <div>
            <h3 className="section-title">Urban Flood Safety Protocols & Action Guide</h3>
            <span className="section-subtitle">Practical safety measures for residents, ward volunteers, and municipal teams</span>
          </div>
        </div>

        <div className="safety-stages-grid">
          {/* Stage 1: Before Flood */}
          <div className="safety-stage-card">
            <div className="stage-badge-row">
              <span className="stage-num">STAGE 1</span>
              <span className="stage-title">Before the Storm (Preparedness)</span>
            </div>
            <ul className="stage-list">
              <li><strong>Clear Surface Drains:</strong> Clear compound drain grates and street gutters of plastic bags, dry foliage, and construction silt.</li>
              <li><strong>Emergency Go-Bag:</strong> Pack 3 days of non-perishable food, potable water, essential medicines, flashlight, battery bank, and ID documents in sealed plastic bags.</li>
              <li><strong>Identify High Ground:</strong> Locate neighborhood multi-story community shelters or designated municipal relief centers.</li>
              <li><strong>Inspect Sump Plugs:</strong> Ensure non-return check valves on ground-floor sewage outfalls are closed to prevent backflow into homes.</li>
            </ul>
          </div>

          {/* Stage 2: During Waterlogging */}
          <div className="safety-stage-card alert-card">
            <div className="stage-badge-row">
              <span className="stage-num">STAGE 2</span>
              <span className="stage-title">During Inundation (Active Hazards)</span>
            </div>
            <ul className="stage-list">
              <li><strong>Turn Around Don't Drown:</strong> Never walk, swim, or drive through flooded roads. 15 cm of swift water can sweep adults; 30 cm floats cars.</li>
              <li><strong>Beware Open Manholes:</strong> Stormwater pressure can dislodge heavy manhole covers. Submerged drains form deadly vortexes.</li>
              <li><strong>Electrical Isolation:</strong> Switch off the main circuit breaker if floodwater approaches home wall sockets or meter boxes.</li>
              <li><strong>Stay Clear of Transformers:</strong> Downed utility wires can electrify pooled water for meters around without sparking.</li>
            </ul>
          </div>

          {/* Stage 3: After Waters Recede */}
          <div className="safety-stage-card">
            <div className="stage-badge-row">
              <span className="stage-num">STAGE 3</span>
              <span className="stage-title">After Waters Recede (Recovery)</span>
            </div>
            <ul className="stage-list">
              <li><strong>Boil Drinking Water:</strong> Municipal tap networks and shallow borewells are frequently contaminated by sewer overflow. Boil water for 10 minutes.</li>
              <li><strong>Check Structural Integrity:</strong> Inspect walls for subsidence cracks before entering waterlogged ground floors.</li>
              <li><strong>Prevent Vector Diseases:</strong> Drain stagnant puddles to prevent dengue and malaria mosquito breeding.</li>
              <li><strong>Report Blocked Culverts:</strong> Submit blocked drainage coordinates through JalaRakshak Community Reports.</li>
            </ul>
          </div>
        </div>

        {/* Emergency Contacts Directory */}
        <div className="emergency-contacts-strip">
          <div className="contact-item">
            <span className="contact-role">National Emergency Hotline</span>
            <strong className="contact-num">112</strong>
          </div>
          <div className="contact-item">
            <span className="contact-role">State Disaster Control Room</span>
            <strong className="contact-num">1070</strong>
          </div>
          <div className="contact-item">
            <span className="contact-role">District Collectorate Helpline</span>
            <strong className="contact-num">1077</strong>
          </div>
          <div className="contact-item">
            <span className="contact-role">Municipal Corporation Grievance</span>
            <strong className="contact-num">1913</strong>
          </div>
        </div>
      </section>

      <div className="about-grid">
        {/* Urban Resilience Mission */}
        <div className="about-card">
          <div className="about-card-header">
            <IconDroplet className="icon-blue" size={20} />
            <h3 className="card-heading">Urban Resilience Mission</h3>
          </div>
          <div className="about-card-body">
            <p>
              Rapid urbanization, expanding concrete cover, and extreme short-duration cloudbursts
              frequently overwhelm municipal stormwater drainage networks, resulting in rapid street inundation.
            </p>
            <p>
              <strong>JalaRakshak AI</strong> is an open-source civic platform designed to safeguard urban catchments
              by combining hydrological predictive modeling with ground-truthed citizen observations.
            </p>
            <div className="values-list">
              <div className="val-item">
                <span className="val-bullet">✓</span>
                <span><strong>Civic First:</strong> Designed for urban residents, resident welfare associations, and ward engineers.</span>
              </div>
              <div className="val-item">
                <span className="val-bullet">✓</span>
                <span><strong>Ground Verification:</strong> Pairs statistical predictions with citizen observation.</span>
              </div>
              <div className="val-item">
                <span className="val-bullet">✓</span>
                <span><strong>Open Toolchains:</strong> Zero paid cloud dependencies; operates cleanly on local edge hardware.</span>
              </div>
            </div>
          </div>
        </div>

        {/* How JalaRakshak Works */}
        <div className="about-card">
          <div className="about-card-header">
            <IconTrendingUp className="icon-teal" size={20} />
            <h3 className="card-heading">How the Platform Protects Wards</h3>
          </div>
          <div className="about-card-body">
            <div className="values-list">
              <div className="val-item">
                <span className="val-bullet">1.</span>
                <span><strong>Hydrological Modeling:</strong> Analyzes 7 key basin features—antecedent rainfall, ground saturation, terrain elevation, and drainage operability.</span>
              </div>
              <div className="val-item">
                <span className="val-bullet">2.</span>
                <span><strong>Interactive GIS Spatial Map:</strong> Maps localized risk zones, canal junctions, and vulnerable transit underpasses.</span>
              </div>
              <div className="val-item">
                <span className="val-bullet">3.</span>
                <span><strong>Citizen Crowdsourcing:</strong> Enables residents to report water depth and choked culvert grates in real time.</span>
              </div>
              <div className="val-item">
                <span className="val-bullet">4.</span>
                <span><strong>Civic Action Advisories:</strong> Translates predictive probabilities into clear, concrete municipal and citizen advisories.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Frequently Asked Questions (FAQ) */}
        <div className="about-card span-two">
          <div className="about-card-header">
            <IconUsers className="icon-blue" size={20} />
            <h3 className="card-heading">Frequently Asked Questions</h3>
          </div>
          <div className="about-card-body">
            <div className="limitations-grid">
              <div className="limitation-box">
                <h4>How do I report waterlogging in my neighborhood?</h4>
                <p>
                  Navigate to the <strong>Community Reports</strong> tab. Enter your ward name, description of the flooding,
                  estimated water depth, and coordinates. Your submission is recorded immediately and plotted on the interactive Flood Map.
                </p>
              </div>

              <div className="limitation-box">
                <h4>What do the different marker colors indicate on the map?</h4>
                <p>
                  Pins with citizen icons (👥) indicate crowdsourced community reports. Colors correspond to reported severity:
                  <strong> Red</strong> for Critical (&gt;45cm), <strong>Orange</strong> for High (30-45cm),
                  <strong> Amber</strong> for Moderate (15-30cm), and <strong>Teal</strong> for Low (&lt;15cm).
                </p>
              </div>

              <div className="limitation-box">
                <h4>How does the Predict Risk tool evaluate flood probability?</h4>
                <p>
                  The predictor uses a trained Random Forest model that evaluates precipitation accumulation against terrain
                  elevation, stormwater drainage operability, soil saturation, and tide levels to compute runoff likelihood.
                </p>
              </div>

              <div className="limitation-box">
                <h4>What should I do if floodwater begins entering my street?</h4>
                <p>
                  Never attempt to drive or walk through moving water. Disconnect electrical mains if water approaches floor sockets,
                  move essentials to upper levels, and dial <strong>112</strong> or <strong>1070</strong> for emergency municipal assistance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
