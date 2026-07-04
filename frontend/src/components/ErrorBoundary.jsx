import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('Application crash:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: 'var(--bg-primary, #0A0A0A)',
          color: 'var(--text-primary, #FFFFFF)',
          padding: '48px 24px',
          fontFamily: 'var(--font-body, sans-serif)'
        }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', marginBottom: '16px' }}>Application Crash</h2>
            <p style={{ color: 'var(--text-muted, #A1A1AA)', marginBottom: '20px' }}>
              A frontend runtime exception was caught. The details are shown below.
            </p>
            <pre style={{
              whiteSpace: 'pre-wrap',
              overflowX: 'auto',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
              borderRadius: '8px',
              padding: '18px',
              color: '#ffb4b4'
            }}>
              {String(this.state.error)}
            </pre>
            <button
              type="button"
              onClick={() => this.setState({ hasError: false, error: null })}
              className="btn-primary"
              style={{ marginTop: '20px' }}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
