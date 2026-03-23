'use client';

import type { ErrorInfo, ReactNode } from 'react';
import { Component } from 'react';

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(_error: Error, _errorInfo: ErrorInfo): void {}

  public render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="card-shell flex min-h-[280px] flex-col items-center justify-center px-6 py-10 text-center">
          <span className="label-meta">Unexpected error</span>
          <h2 className="mt-3 text-lg font-medium text-primary">Something went wrong</h2>
          <p className="mt-2 max-w-md text-sm text-secondary">Please reload the page and try again.</p>
        </div>
      );
    }

    return this.props.children;
  }
}
