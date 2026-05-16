import { Component, type ReactNode, type ErrorInfo } from 'react'

interface State { hasError: boolean; message: string }
interface Props { children: ReactNode }

export class RootErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ROADSoS] Root error:', error.message)
    console.error('[ROADSoS] Component stack:', info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="app-error-container">
          <div className="app-error-icon">🚨</div>
          <div className="app-error-title">
            ROADSoS encountered an error
          </div>
          <div className="app-error-message">
            {this.state.message}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="app-error-button"
          >
            🔄 Reload App
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
