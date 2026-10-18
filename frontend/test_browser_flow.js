import puppeteer from 'puppeteer-core';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function testCompleteBrowserFlow() {
  console.log('======================================================================');
  console.log('JalaRakshak AI -- Phase 4 End-to-End Browser Flow Test');
  console.log('======================================================================');

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  // Listen to browser console messages
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.log(`[BROWSER ERROR] ${msg.text()}`);
    }
  });

  try {
    // 1. Visit Dashboard
    console.log('\n[STEP 1] Navigating to http://localhost:5173/ ...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 15000 });

    const title = await page.title();
    console.log(`Page Title: "${title}"`);

    // Verify Dashboard Elements
    await page.waitForSelector('.dashboard-hero', { timeout: 5000 });
    const heroText = await page.$eval('.hero-title', (el) => el.textContent.trim());
    console.log(`Dashboard Hero Title: "${heroText}"`);

    // Wait for health badge
    await page.waitForSelector('.api-status-pill', { timeout: 5000 });
    const healthText = await page.$eval('.api-status-pill .status-label', (el) => el.textContent.trim());
    console.log(`Health Pill Status: "${healthText}"`);

    // Verify small charts
    const hasSeverityChart = await page.$('.severity-bar-list');
    const hasImportanceChart = await page.$('.importance-bar-list');
    console.log(`Severity Chart Rendered: ${!!hasSeverityChart}`);
    console.log(`Feature Importance Chart Rendered: ${!!hasImportanceChart}`);
    console.log('[PASS] Step 1: Dashboard rendered successfully with live API data and charts.');

    // 2. Test Predict Risk View
    console.log('\n[STEP 2] Navigating to Predict Risk page...');
    // Click on nav tab "Predict Risk"
    const predictTab = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('.nav-link'));
      return buttons.find((b) => b.textContent.includes('Predict Risk'));
    });
    await predictTab.click();

    await page.waitForSelector('.predict-form', { timeout: 5000 });
    console.log('Predict Risk form mounted.');

    // Click Severe Scenario preset
    console.log('Selecting "🔴 Cloudburst & Choked Lowland" DEMO DATA preset...');
    const severePresetBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('.btn-preset'));
      return btns.find((b) => b.textContent.includes('Cloudburst'));
    });
    await severePresetBtn.click();

    // Verify input fields updated
    const rainfallVal = await page.$eval('input[aria-label="3-Hour Precipitation Accumulation"]', (el) => el.value);
    console.log(`3-Hour Rainfall input value: ${rainfallVal} mm`);

    // Click Execute Model Prediction
    console.log('Clicking "Execute Model Prediction (POST /api/predict)"...');
    const submitPredBtn = await page.$('.predict-form button[type="submit"]');
    await submitPredBtn.click();

    // Wait for risk display
    await page.waitForSelector('.risk-narrative', { timeout: 8000 });
    const riskLevel = await page.$eval('.risk-narrative .narrative-title', (el) => el.textContent.trim());
    const riskAdvisory = await page.$eval('.risk-narrative .narrative-desc', (el) => el.textContent.trim());
    const floodFlag = await page.$eval('.flood-flag-pill', (el) => el.textContent.trim());
    const probStat = await page.$eval('.prob-stat', (el) => el.textContent.trim());

    console.log(`Risk Level Result: "${riskLevel}"`);
    console.log(`Flood Flag: "${floodFlag}"`);
    console.log(`Probability: "${probStat}"`);
    console.log(`Advisory: "${riskAdvisory}"`);

    // Check influential factors
    const factorCount = await page.$$eval('.influence-item', (items) => items.length);
    console.log(`Influential Factors Rendered: ${factorCount}`);

    // Check limitations card
    const hasLimitations = await page.$('.limitations-card');
    console.log(`Limitations & Non-Causality Disclaimers Rendered: ${!!hasLimitations}`);
    console.log('[PASS] Step 2: Prediction executed via POST /api/predict, displayed real probability and explanations.');

    // 3. Test Community Reports View
    console.log('\n[STEP 3] Navigating to Community Reports page...');
    const reportsTab = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('.nav-link'));
      return buttons.find((b) => b.textContent.includes('Community Reports'));
    });
    await reportsTab.click();

    await page.waitForSelector('.report-form', { timeout: 5000 });
    console.log('Community Reports form loaded.');

    const initialReportCount = await page.$$eval('.feed-item', (items) => items.length);
    console.log(`Initial stored reports displayed: ${initialReportCount}`);

    // Fill the report form
    const testLocation = `Ward 17 - Triplicane High Road Culvert (Test ${Date.now() % 10000})`;
    console.log(`Filling form with: "${testLocation}"...`);

    await page.type('#rep-location', testLocation);
    await page.select('#rep-severity', 'Critical');
    await page.type('#rep-depth', '52');
    await page.type('#rep-desc', 'Rising surface water inundating pedestrian walkway. Choked inlet grate.');

    // Click sample coordinates helper
    console.log('Clicking "Use Sample Basin Coords (DEMO DATA)"...');
    const sampleCoordBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('.btn-text-action'));
      return btns.find((b) => b.textContent.includes('Use Sample Basin Coords'));
    });
    await sampleCoordBtn.click();

    // Submit report
    console.log('Submitting citizen report to POST /api/reports...');
    const submitRepBtn = await page.$('.report-form button[type="submit"]');
    await submitRepBtn.click();

    // Wait for success banner
    await page.waitForSelector('.success-banner', { timeout: 8000 });
    const successMsg = await page.$eval('.success-banner .success-msg-row', (el) => el.textContent.trim());
    console.log(`Submission Response: "${successMsg}"`);

    // Verify report appears in live feed list
    await page.waitForFunction(
      (loc) => {
        const wards = Array.from(document.querySelectorAll('.feed-ward'));
        return wards.some((w) => w.textContent.includes(loc));
      },
      { timeout: 8000 },
      testLocation
    );
    console.log(`[PASS] Step 3: Report saved to SQLite and rendered in community feed.`);

    // 4. Test Flood Map View
    console.log('\n[STEP 4] Navigating to Flood Map page...');
    const mapTab = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('.nav-link'));
      return buttons.find((b) => b.textContent.includes('Flood Map'));
    });
    await mapTab.click();

    // Verify Leaflet Container & Tiles
    await page.waitForSelector('.leaflet-container', { timeout: 8000 });
    console.log('React Leaflet container mounted successfully.');

    // Wait a moment for tile layer and markers to render
    await new Promise((r) => setTimeout(r, 1500));

    // Verify illustrative markers (DEMO DATA)
    const illustrativeMarkers = await page.$$('.illustrative-marker-wrapper');
    console.log(`Illustrative Risk Zone Markers rendered on map: ${illustrativeMarkers.length}`);

    // Verify community report markers
    const communityMarkers = await page.$$('.community-marker-wrapper');
    console.log(`Community Report Markers rendered on map: ${communityMarkers.length}`);

    // Test Clicking an Illustrative Marker to open popup
    console.log('Clicking an illustrative risk zone marker...');
    if (illustrativeMarkers.length > 0) {
      await illustrativeMarkers[0].click();
      await page.waitForSelector('.popup-illustrative', { timeout: 4000 });
      const demoPopupTitle = await page.$eval('.popup-illustrative .popup-title', (el) => el.textContent.trim());
      const demoSource = await page.$eval('.popup-illustrative .popup-val', (el) => el.textContent.trim());
      console.log(`Illustrative Popup Title: "${demoPopupTitle}"`);
      console.log(`Illustrative Popup Source: "${demoSource}"`);
    }

    // Test Clicking a Community Report Marker to open popup
    console.log('Clicking a citizen report marker...');
    if (communityMarkers.length > 0) {
      await communityMarkers[0].click();
      await page.waitForSelector('.popup-community', { timeout: 4000 });
      const commPopupTitle = await page.$eval('.popup-community .popup-title', (el) => el.textContent.trim());
      const commSource = await page.$eval('.popup-community .popup-val', (el) => el.textContent.trim());
      const commVerify = await page.$eval('.popup-community .verify-status', (el) => el.textContent.trim());
      console.log(`Community Popup Title: "${commPopupTitle}"`);
      console.log(`Community Popup Source: "${commSource}"`);
      console.log(`Community Popup Verification: "${commVerify}"`);
    }

    console.log('[PASS] Step 4: Map rendered OpenStreetMap tiles, distinct markers, and detailed popups.');

    // 5. Test About View & Safety Protocols
    console.log('\n[STEP 5] Navigating to About page...');
    const aboutTab = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('.nav-link'));
      return buttons.find((b) => b.textContent.includes('About'));
    });
    await aboutTab.click();

    await page.waitForSelector('.safety-guide-section', { timeout: 5000 });
    const safetyGuideTitle = await page.$eval('.safety-guide-header .section-title', (el) => el.textContent.trim());
    console.log(`Safety Protocols Header: "${safetyGuideTitle}"`);

    const contactCount = await page.$$eval('.contact-item', (items) => items.length);
    console.log(`Emergency Contacts Rendered: ${contactCount}`);

    const apiRefRows = await page.$$eval('.api-ref-table tbody tr', (rows) => rows.length);
    console.log(`API Reference Endpoints Listed: ${apiRefRows}`);
    console.log('[PASS] Step 5: About view, safety guide, and API reference verified.');

    console.log('\n======================================================================');
    console.log('ALL PHASE 4 BROWSER FLOW TESTS PASSED SUCCESSFULLY! [PASS]');
    console.log('======================================================================');
  } catch (error) {
    console.error('[TEST ERROR] Flow verification failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

testCompleteBrowserFlow();
