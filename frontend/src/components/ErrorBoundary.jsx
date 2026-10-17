import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a2540',
          color: '#ffffff',
          fontFamily: 'Inter, sans-serif',
          padding: '2rem'
        }}>
          <div style={{
            maxWidth: '600px',
            background: '#0f172a',
            padding: '2rem',
            borderRadius: '12px',
            border: '1px solid #1e293b',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
          }}>
            <h2 style={{ color: '#f87171', marginBottom: '1rem', fontSize: '1.4rem' }}>
              ⚠️ Application Interface Notice
            </h2>
            <p style={{ color: '#cbd5e1', marginBottom: '1rem', fontSize: '0.9rem', lineHeight: '1.5' }}>
              An interface error occurred during rendering. Details:
            </p>
            <pre style={{
              background: '#020617',
              color: '#38bdf8',
              padding: '1rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              overflowX: 'auto',
              marginBottom: '1.5rem'
            }}>
              {this.state.error?.toString() || 'Unknown error'}
            </pre>
            <button
              onClick={this.handleReset}
              style={{
                backgroundColor: '#0d9488',
                color: '#ffffff',
                border: 'none',
                padding: '0.65rem 1.25rem',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
