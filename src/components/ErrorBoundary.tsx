import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallbackTitle?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    if (typeof window !== 'undefined' && window.__T1D_MONITORING__) {
      window.__T1D_MONITORING__.captureException(error);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#1c1410] px-6 text-center text-amber-50">
          <div className="max-w-md space-y-4">
            <h1 className="text-2xl font-extrabold tracking-tight">{this.props.fallbackTitle || 'Something went wrong'}</h1>
            <p className="text-sm text-amber-100/80">Refresh the page. If the problem continues, sign out and sign in again.</p>
            <button
              type="button"
              className="t1d-btn-warm-primary t1d-btn-warm-primary--dark rounded-full px-5 py-3 text-sm font-semibold"
              onClick={() => window.location.reload()}
            >
              Refresh
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
