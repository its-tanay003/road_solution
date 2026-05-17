import { Component, type ReactNode, type ErrorInfo } from 'react'

interface State { 
  hasError: boolean; 
  message: string; 
  errorStack?: string; 
  showDevOpsGuide: boolean;
  copied: boolean;
}
interface Props { children: ReactNode }

export class RootErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { 
      hasError: false, 
      message: '', 
      errorStack: '',
      showDevOpsGuide: false,
      copied: false
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      message: error.message, 
      errorStack: error.stack,
      showDevOpsGuide: false,
      copied: false
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ROADSoS] Root error caught:', error.message)
    console.error('[ROADSoS] Component stack:', info.componentStack)
  }

  handleCopyReport = () => {
    const report = [
      `ROADSoS EMERGENCY RUNTIME SHIELD REPORT`,
      `======================================`,
      `Timestamp: ${new Date().toISOString()}`,
      `Error Message: ${this.state.message}`,
      `Error Stack: ${this.state.errorStack || 'No stack trace available'}`,
      `User Agent: ${navigator.userAgent}`
    ].join('\n\n');

    navigator.clipboard.writeText(report)
      .then(() => {
        this.setState({ copied: true });
        setTimeout(() => this.setState({ copied: false }), 2000);
      })
      .catch((err) => console.error('[ROADSoS] Failed to copy error report:', err));
  };

  render() {
    if (this.state.hasError) {
      const isSupabaseIssue = 
        this.state.message.toLowerCase().includes('supabase') || 
        this.state.message.toLowerCase().includes('anon_key') || 
        this.state.message.toLowerCase().includes('supabasekey') ||
        this.state.message.toLowerCase().includes('supabaseurl') ||
        this.state.message.toLowerCase().includes('createbrowserclient') ||
        this.state.message.toLowerCase().includes('project url');

      return (
        <div className="app-error-overlay">
          {/* Custom style overrides to guarantee premium Nexus Dark presentation even if main CSS bundle fails */}
          <style>{`
            .app-error-overlay {
              min-height: 100vh;
              min-height: 100dvh;
              background: radial-gradient(circle at center, #0B1321 0%, #05080F 100%);
              color: #F0F4FF;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 24px;
              font-family: 'Space Grotesk', 'Inter', system-ui, sans-serif;
            }

            .app-error-glass-panel {
              background: rgba(13, 19, 33, 0.75);
              border: 1px solid rgba(255, 255, 255, 0.08);
              box-shadow: 0 24px 64px rgba(0, 0, 0, 0.6), 0 0 40px rgba(255, 153, 51, 0.05);
              border-radius: 24px;
              width: 100%;
              max-width: 680px;
              padding: 40px;
              backdrop-filter: blur(20px);
              -webkit-backdrop-filter: blur(20px);
              display: flex;
              flex-direction: column;
              gap: 24px;
              box-sizing: border-box;
            }

            .app-error-header {
              display: flex;
              align-items: center;
              gap: 16px;
            }

            .app-error-alert-badge {
              width: 48px;
              height: 48px;
              background: rgba(255, 23, 68, 0.12);
              border: 1px solid rgba(255, 23, 68, 0.40);
              color: #FF1744;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 12px;
              font-size: 24px;
              animation: errorPulse 2.5s infinite ease-in-out;
            }

            @keyframes errorPulse {
              0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 23, 68, 0.4); }
              50% { transform: scale(1.05); box-shadow: 0 0 20px 4px rgba(255, 23, 68, 0.2); }
            }

            .app-error-title-section h1 {
              margin: 0;
              font-size: 22px;
              font-weight: 700;
              letter-spacing: -0.01em;
              color: #F0F4FF;
              background: linear-gradient(135deg, #F0F4FF 0%, #8892A4 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
            }

            .app-error-title-section p {
              margin: 4px 0 0 0;
              font-size: 13px;
              color: #8892A4;
              font-family: 'Inter', sans-serif;
            }

            .app-error-trace-card {
              background: rgba(5, 8, 15, 0.6);
              border: 1px solid rgba(255, 23, 68, 0.15);
              border-radius: 12px;
              padding: 16px;
              display: flex;
              flex-direction: column;
              gap: 8px;
            }

            .app-error-trace-label {
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              color: #FF1744;
              font-family: 'Space Grotesk', sans-serif;
              font-weight: 600;
            }

            .app-error-trace-message {
              font-family: 'JetBrains Mono', 'Courier New', monospace;
              font-size: 13px;
              color: #FF4D6A;
              line-height: 1.5;
              word-break: break-word;
              margin: 0;
            }

            .supabase-guide-card {
              background: rgba(255, 179, 0, 0.05);
              border: 1px solid rgba(255, 179, 0, 0.20);
              border-radius: 16px;
              padding: 24px;
              display: flex;
              flex-direction: column;
              gap: 16px;
            }

            .supabase-guide-header {
              display: flex;
              align-items: center;
              gap: 10px;
              color: #FFB300;
              font-weight: 600;
              font-size: 15px;
            }

            .supabase-guide-text {
              font-size: 13px;
              color: #8892A4;
              line-height: 1.6;
              margin: 0;
              font-family: 'Inter', sans-serif;
            }

            .supabase-guide-env-box {
              background: rgba(0, 0, 0, 0.4);
              border: 1px solid rgba(255, 255, 255, 0.06);
              border-radius: 10px;
              padding: 12px 16px;
              font-family: 'JetBrains Mono', 'Courier New', monospace;
              font-size: 12px;
              color: #00E676;
              display: flex;
              flex-direction: column;
              gap: 6px;
            }

            .supabase-guide-env-line {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }

            .supabase-guide-env-key {
              color: #FF9933;
            }

            .supabase-guide-env-value {
              color: #8892A4;
              font-style: italic;
            }

            .toggle-devops-btn {
              background: none;
              border: none;
              color: #2979FF;
              font-size: 13px;
              font-weight: 600;
              cursor: pointer;
              text-align: left;
              padding: 0;
              text-decoration: underline;
              text-underline-offset: 3px;
              align-self: flex-start;
              font-family: 'Inter', sans-serif;
            }

            .toggle-devops-btn:hover {
              color: #5C9CFF;
            }

            .devops-steps {
              background: rgba(41, 121, 255, 0.03);
              border: 1px solid rgba(41, 121, 255, 0.15);
              border-radius: 12px;
              padding: 16px;
              display: flex;
              flex-direction: column;
              gap: 12px;
              font-size: 13px;
              line-height: 1.5;
              color: #8892A4;
              font-family: 'Inter', sans-serif;
            }

            .devops-steps ol {
              margin: 0;
              padding-left: 20px;
              display: flex;
              flex-direction: column;
              gap: 8px;
            }

            .devops-steps strong {
              color: #F0F4FF;
            }

            .app-error-actions {
              display: flex;
              flex-wrap: wrap;
              gap: 16px;
              margin-top: 8px;
            }

            .btn-reload {
              background: #FF9933;
              color: #05080F;
              border: none;
              padding: 14px 28px;
              border-radius: 999px;
              font-size: 14px;
              font-weight: 700;
              font-family: 'Space Grotesk', sans-serif;
              cursor: pointer;
              box-shadow: 0 4px 20px rgba(255, 153, 51, 0.35);
              transition: all 0.2s ease-out;
              display: flex;
              align-items: center;
              gap: 8px;
            }

            .btn-reload:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 24px rgba(255, 153, 51, 0.50);
            }

            .btn-reload:active {
              transform: translateY(0);
            }

            .btn-copy {
              background: transparent;
              color: #F0F4FF;
              border: 1px solid rgba(255, 255, 255, 0.15);
              padding: 14px 28px;
              border-radius: 999px;
              font-size: 14px;
              font-weight: 600;
              font-family: 'Space Grotesk', sans-serif;
              cursor: pointer;
              transition: all 0.2s ease-out;
            }

            .btn-copy:hover {
              background: rgba(255, 255, 255, 0.05);
              border-color: rgba(255, 255, 255, 0.30);
            }

            .btn-copy:active {
              background: rgba(255, 255, 255, 0.08);
            }
          `}</style>

          <div className="app-error-glass-panel">
            <div className="app-error-header">
              <div className="app-error-alert-badge">🚨</div>
              <div className="app-error-title-section">
                <h1>NEXUS SHIELD SECURE RUNTIME</h1>
                <p>A critical runtime exception was isolated to prevent full application crash.</p>
              </div>
            </div>

            <div className="app-error-trace-card">
              <div className="app-error-trace-label">isolated exception trace</div>
              <pre className="app-error-trace-message">{this.state.message}</pre>
            </div>

            {isSupabaseIssue && (
              <div className="supabase-guide-card">
                <div className="supabase-guide-header">
                  <span>⚠️</span> CRITICAL: Missing Supabase Environment Credentials
                </div>
                <p className="supabase-guide-text">
                  The application is failing to connect to the Supabase authentication/database API. 
                  Although ROADSoS has been hardened with automatic client mocking, the eager initial registration 
                  or an unhandled API invocation requires genuine credentials to unlock server-authenticated systems.
                </p>
                <div className="supabase-guide-env-box">
                  <div className="supabase-guide-env-line">
                    <span>VITE_SUPABASE_URL</span>
                    <span className="supabase-guide-env-value">&lt;project-url-required&gt;</span>
                  </div>
                  <div className="supabase-guide-env-line">
                    <span>VITE_SUPABASE_ANON_KEY</span>
                    <span className="supabase-guide-env-value">&lt;anon-key-required&gt;</span>
                  </div>
                </div>
              </div>
            )}

            <button 
              onClick={() => this.setState(prev => ({ showDevOpsGuide: !prev.showDevOpsGuide }))}
              className="toggle-devops-btn"
            >
              {this.state.showDevOpsGuide ? '▼ Hide DevOps Configuration Steps' : '▶ Show DevOps Configuration Steps'}
            </button>

            {this.state.showDevOpsGuide && (
              <div className="devops-steps">
                <p style={{ margin: '0 0 8px 0', fontWeight: 600, color: '#F0F4FF' }}>
                  🔧 How to configure environment variables for Vercel:
                </p>
                <ol>
                  <li>Go to your <strong>Vercel Dashboard</strong> and select the <strong>roadsos</strong> project.</li>
                  <li>Navigate to <strong>Settings</strong> &gt; <strong>Environment Variables</strong>.</li>
                  <li>Add <strong>VITE_SUPABASE_URL</strong> with your Supabase Project URL.</li>
                  <li>Add <strong>VITE_SUPABASE_ANON_KEY</strong> with your Supabase Anon API Key.</li>
                  <li>Ensure the variables are enabled for <strong>Production</strong>, <strong>Preview</strong>, and <strong>Development</strong> environments.</li>
                  <li>Trigger a redeployment from the <strong>Deployments</strong> tab to rebuild assets with credentials.</li>
                </ol>
                <p style={{ margin: '8px 0 0 0', fontSize: '12px', fontStyle: 'italic' }}>
                  * For local development, create a <code>.env.local</code> in the <code>frontend/</code> directory with these keys and restart the server.
                </p>
              </div>
            )}

            <div className="app-error-actions">
              <button onClick={() => window.location.reload()} className="btn-reload">
                🔄 Restart Application
              </button>
              <button onClick={this.handleCopyReport} className="btn-copy">
                {this.state.copied ? '✅ Report Copied' : '📋 Copy Error Report'}
              </button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

