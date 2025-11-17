import React from 'react';
import { AlertCircle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Tab component error:', error);
    console.error('Error info:', errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '30px',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '8px',
          margin: '20px'
        }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <AlertCircle size={24} style={{ color: '#ff6b6b', flexShrink: 0, marginTop: '5px' }} />
            <div style={{ flex: 1 }}>
              <h2 style={{ color: '#d32f2f', margin: '0 0 10px 0' }}>Oops! Something went wrong</h2>
              <p style={{ margin: '0 0 10px 0', color: '#666' }}>
                The current tab encountered an error. Please try switching to another tab or refreshing the page.
              </p>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details style={{ marginTop: '10px', cursor: 'pointer', color: '#666' }}>
                  <summary style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                    Error Details (Development Only)
                  </summary>
                  <pre style={{
                    backgroundColor: '#f5f5f5',
                    padding: '10px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    overflow: 'auto',
                    margin: '10px 0 0 0'
                  }}>
                    {this.state.error.toString()}
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
