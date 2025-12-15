import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <span className="material-symbols-outlined text-4xl text-red-600">
                  error
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Oops! Something went wrong
              </h1>
              <p className="text-gray-600 mb-4">
                We encountered an unexpected error. Please try refreshing the page.
              </p>
              {this.state.error && (
                <details className="text-left bg-gray-50 rounded-lg p-4 mb-4">
                  <summary className="text-sm font-medium text-gray-700 cursor-pointer">
                    Error details
                  </summary>
                  <pre className="mt-2 text-xs text-red-600 overflow-auto">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-semibold"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
