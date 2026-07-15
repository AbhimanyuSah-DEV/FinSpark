import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface State { hasError: boolean; error?: Error }

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="bg-surface border border-danger/30 rounded-xl p-8 max-w-md w-full text-center">
          <div className="w-12 h-12 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={24} className="text-danger" />
          </div>
          <h2 className="text-lg font-bold text-text mb-2">Something went wrong</h2>
          <p className="text-muted text-sm mb-2">{this.state.error?.message ?? 'An unexpected error occurred.'}</p>
          <p className="text-subtle text-xs mb-6">Check the browser console for details.</p>
          <button
            onClick={() => { this.setState({ hasError: false }); window.location.reload() }}
            className="btn-primary mx-auto"
          >
            <RefreshCw size={14} /> Reload Page
          </button>
        </div>
      </div>
    )
  }
}

export default ErrorBoundary
