import React, { Component, type ReactNode } from 'react'
import { logError } from '@utils/errorLogger'

/**
 * Props for the ErrorBoundary component
 */
interface ErrorBoundaryProps {
  /** Child components to protect with error boundary */
  children: ReactNode
  /** Optional fallback UI to show when an error occurs */
  fallback?: ReactNode
  /** Optional callback when an error is caught */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

/**
 * State for the ErrorBoundary component
 */
interface ErrorBoundaryState {
  /** Whether an error has been caught */
  hasError: boolean
  /** The caught error object */
  error: Error | null
  /** Additional error information */
  errorInfo: React.ErrorInfo | null
}

/**
 * ErrorBoundary component catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing the entire app.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  /**
   * Updates state when an error is caught
   * @param error - The error that was thrown
   * @returns Updated state
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    }
  }

  /**
   * Logs error details and calls optional error callback
   * @param error - The error that was thrown
   * @param errorInfo - Additional error information
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Use centralized error logging
    logError({
      message: 'ErrorBoundary caught an error',
      error,
      context: 'react-error-boundary',
      action: 'component-error',
    })

    // Update state with error info
    this.setState({
      errorInfo,
    })

    // Call optional error callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  /**
   * Resets the error boundary state
   */
  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  /**
   * Check if we're in development mode
   * This method can be mocked in tests
   */
  isDevelopment(): boolean {
    return import.meta.env.DEV
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback UI
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <h2>🚨 Something went wrong</h2>
            <p>
              We're sorry! Something unexpected happened. The error has been
              logged and we'll work to fix it.
            </p>
            <button
              onClick={this.resetError}
              className="btn-primary"
              style={{ marginTop: '1rem' }}
            >
              Try Again
            </button>

            {/* Show error details in development */}
            {this.isDevelopment() && this.state.error && (
              <details style={{ marginTop: '1rem', textAlign: 'left' }}>
                <summary>Error Details (Development)</summary>
                <pre
                  style={{
                    background: '#f5f5f5',
                    padding: '1rem',
                    borderRadius: '4px',
                    fontSize: '0.875rem',
                    overflow: 'auto',
                    maxHeight: '200px',
                  }}
                >
                  <strong>Error:</strong> {this.state.error.message}
                  {'\n\n'}
                  <strong>Stack:</strong> {this.state.error.stack}
                  {this.state.errorInfo && (
                    <>
                      {'\n\n'}
                      <strong>Component Stack:</strong>{' '}
                      {this.state.errorInfo.componentStack}
                    </>
                  )}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
