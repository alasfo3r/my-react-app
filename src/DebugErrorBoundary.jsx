import React from 'react';

export default class DebugErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { err: null };
  }
  static getDerivedStateFromError(err) { return { err }; }
  componentDidCatch(err, info) { console.error('[ErrorBoundary]', err, info); }

  render() {
    if (this.state.err) {
      return (
        <div style={{ padding: 16 }}>
          <h1 style={{ color: '#b91c1c' }}>A runtime error occurred</h1>
          <pre style={{ whiteSpace: 'pre-wrap' }}>
            {String(this.state.err?.message || this.state.err)}
          </pre>
          <p>Check the console for the full stack trace.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
