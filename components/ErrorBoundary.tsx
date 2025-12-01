'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        this.setState({ errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 text-white p-8">
                    <div className="max-w-2xl w-full bg-red-900/20 border border-red-500/50 rounded-xl p-6 backdrop-blur-xl">
                        <h2 className="text-2xl font-bold text-red-400 mb-4">Application Error</h2>
                        <p className="mb-4 text-gray-300">Something went wrong. Please check the console for more details.</p>

                        {this.state.error && (
                            <div className="mb-4 p-4 bg-black/50 rounded-lg overflow-auto max-h-40">
                                <p className="font-mono text-sm text-red-300">{this.state.error.toString()}</p>
                            </div>
                        )}

                        {this.state.errorInfo && (
                            <details className="mb-6">
                                <summary className="cursor-pointer text-gray-400 hover:text-white mb-2">Component Stack</summary>
                                <pre className="p-4 bg-black/50 rounded-lg overflow-auto max-h-60 text-xs font-mono text-gray-400">
                                    {this.state.errorInfo.componentStack}
                                </pre>
                            </details>
                        )}

                        <button
                            onClick={() => {
                                this.setState({ hasError: false, error: null, errorInfo: null });
                                window.location.reload();
                            }}
                            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
