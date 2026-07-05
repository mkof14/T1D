import React from 'react';
import type { Language } from '../types';
import { ERROR_BOUNDARY_COPY } from '../content/workspace-beta-copy';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallbackTitle?: string;
  lang?: Language;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

const resolveLang = (lang?: Language): Language => {
  if (lang) return lang;
  if (typeof document === 'undefined') return 'en';
  const htmlLang = document.documentElement.lang;
  return (htmlLang in ERROR_BOUNDARY_COPY ? htmlLang : 'en') as Language;
};

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
      const lang = resolveLang(this.props.lang);
      const copy = ERROR_BOUNDARY_COPY[lang];
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#1c1410] px-6 text-center text-amber-50">
          <div className="max-w-md space-y-4">
            <h1 className="text-2xl font-extrabold tracking-tight">{this.props.fallbackTitle || copy.title}</h1>
            <p className="text-sm text-amber-100/80">{copy.body}</p>
            <button
              type="button"
              className="t1d-btn-warm-primary t1d-btn-warm-primary--dark rounded-full px-5 py-3 text-sm font-semibold"
              onClick={() => window.location.reload()}
            >
              {copy.action}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
