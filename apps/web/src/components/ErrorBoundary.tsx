import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  name?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[ErrorBoundary${this.props.name ? `: ${this.props.name}` : ''}]`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 12, padding: 16, color: '#fca5a5', fontSize: 11,
        }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>
            ⚠️ {this.props.name || 'Component'} Error
          </div>
          <div style={{ opacity: 0.8 }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              marginTop: 8, background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 6, padding: '4px 10px', color: '#fca5a5', cursor: 'pointer', fontSize: 10,
            }}
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
