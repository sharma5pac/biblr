import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null, errorInfo: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo)
        this.setState({ errorInfo })
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
                    <div className="bg-slate-800 rounded-2xl p-8 max-w-2xl w-full border border-red-500/20 shadow-2xl">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
                                <p className="text-slate-400">Application crashed with the following error:</p>
                            </div>
                        </div>

                        <div className="bg-black/50 rounded-xl p-4 mb-6 overflow-auto max-h-64 font-mono text-sm">
                            <p className="text-red-400 font-bold mb-2">{this.state.error?.toString()}</p>
                            <pre className="text-slate-500 whitespace-pre-wrap">{this.state.errorInfo?.componentStack}</pre>
                        </div>

                        <button
                            onClick={() => window.location.reload()}
                            className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors font-medium"
                        >
                            <RefreshCw className="w-5 h-5" />
                            Reload Application
                        </button>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}
