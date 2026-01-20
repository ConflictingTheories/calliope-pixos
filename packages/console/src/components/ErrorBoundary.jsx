import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-overlay">
                    <div className="error-box">
                        <h2>Critical System Failure</h2>
                        <p>The engine encountered a fatal error and could not continue.</p>
                        <details>
                            <summary>Technical Details</summary>
                            <pre>{this.state.error && this.state.error.toString()}</pre>
                            <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
                        </details>
                        <button onClick={() => window.location.reload()}>Reboot System</button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
