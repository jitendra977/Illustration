// src/components/ErrorBoundary.jsx
import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-4 bg-red-50 border border-red-200 rounded">
                    <h2 className="text-red-800 font-bold">エラーが発生しました</h2>
                    <p className="text-red-600">{this.state.error?.message}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
                    >
                        リロード
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;