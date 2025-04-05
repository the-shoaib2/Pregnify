import React from 'react'
import { AlertCircle, RefreshCcw } from "lucide-react"
import toast from "react-hot-toast"

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to your error reporting service
    console.error('Error caught by boundary:', error, errorInfo)
    
    // Store error info for better debugging
    this.setState({ errorInfo })
    
    // Show toast notification for better UX
    toast.error(error?.message || "An unexpected error occurred")
  }

  handleRetry = () => {
    try {
      // Clear error state first
      this.setState({ 
        hasError: false, 
        error: null,
        errorInfo: null 
      })

      // If onRetry prop is provided, call it first
      if (this.props.onRetry) {
        this.props.onRetry()
      } else {
        // Default to page reload if no onRetry provided
        window.location.reload()
      }
    } catch (error) {
      console.error('Error during retry:', error)
      toast.error("Failed to recover from error")
      
      // Reset error state
      this.setState({ 
        hasError: true, 
        error,
        errorInfo: null
      })
    }
  }

  render() {
    const { hasError, error, errorInfo } = this.state
    const { fallback, children } = this.props

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback({ error, errorInfo, reset: this.handleRetry })
      }

      // Default error UI
      return (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 my-4">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-red-900 mb-1">
                Something went wrong
              </h3>
              <p className="text-sm text-red-700 mb-4 break-words">
                {error?.message || "An unexpected error occurred. Please try again."}
              </p>
              {process.env.NODE_ENV === 'development' && errorInfo && (
                <pre className="text-xs text-red-600 bg-red-100 p-2 rounded mb-4 overflow-auto">
                  {errorInfo.componentStack}
                </pre>
              )}
              <button 
                onClick={this.handleRetry}
                className="inline-flex items-center gap-2 rounded-md bg-red-100 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-200 transition-colors"
              >
                <RefreshCcw className="h-4 w-4" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      )
    }

    return children
  }
}

export default ErrorBoundary
