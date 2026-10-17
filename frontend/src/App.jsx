import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { DashboardView } from './views/DashboardView';
import { FloodMapView } from './views/FloodMapView';
import { PredictRiskView } from './views/PredictRiskView';
import { CommunityReportsView } from './views/CommunityReportsView';
import { AboutView } from './views/AboutView';
import { checkBackendHealth } from './services/api';
import { API_BASE_URL, APP_CONFIG } from './config';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [health, setHealth] = useState({
    ok: false,
    status: 'checking',
    statusCode: 0,
    latencyMs: 0,
    endpoint: `${API_BASE_URL}/api/health`,
    data: null,
    error: 'Initializing health probe...',
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Health fetcher
  const refreshHealth = useCallback(async (manual = false) => {
    if (manual) setIsRefreshing(true);
    try {
      const result = await checkBackendHealth();
      setHealth(result);
    } catch (err) {
      setHealth({
        ok: false,
        status: 'error',
        statusCode: 0,
        latencyMs: 0,
        endpoint: `${API_BASE_URL}/api/health`,
        data: null,
        error: err.message || 'Health probe failed',
      });
    } finally {
      if (manual) setIsRefreshing(false);
    }
  }, []);

  // Poll on mount and periodically
  useEffect(() => {
    let isMounted = true;
    checkBackendHealth().then((result) => {
      if (isMounted) setHealth(result);
    });
    const interval = setInterval(() => {
      checkBackendHealth().then((result) => {
        if (isMounted) setHealth(result);
      });
    }, APP_CONFIG.refreshIntervalMs);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="app-layout">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        health={health}
        onRefreshHealth={refreshHealth}
        isRefreshing={isRefreshing}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {activeTab === 'dashboard' && (
          <DashboardView
            health={health}
            onRefreshHealth={refreshHealth}
            isRefreshing={isRefreshing}
            onNavigate={setActiveTab}
          />
        )}
        {activeTab === 'map' && <FloodMapView />}
        {activeTab === 'predict' && <PredictRiskView />}
        {activeTab === 'reports' && <CommunityReportsView />}
        {activeTab === 'about' && <AboutView apiBaseUrl={API_BASE_URL} />}
      </main>

      {/* Bottom Footer */}
      <Footer
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />
    </div>
  );
}
