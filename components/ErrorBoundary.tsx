"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="container" style={{ padding: 'var(--space-lg)' }}>
          <Card padding="lg" elevation="md">
            <div style={{ textAlign: 'center' }}>
              <h1 style={{ color: 'var(--color-error)', marginBottom: 'var(--space-md)' }}>
                Something went wrong
              </h1>
              
              <p style={{ 
                color: 'var(--color-text-secondary)', 
                marginBottom: 'var(--space-lg)',
                fontSize: 'var(--font-size-sm)'
              }}>
                We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details style={{ 
                  marginBottom: 'var(--space-lg)',
                  textAlign: 'left',
                  backgroundColor: 'var(--color-surface-secondary)',
                  padding: 'var(--space-md)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--font-size-xs)'
                }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 500 }}>
                    Error Details (Development)
                  </summary>
                  <pre style={{ 
                    marginTop: 'var(--space-sm)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}>
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}

              <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button variant="primary" onClick={this.handleReset}>
                  Try Again
                </Button>
                <Button variant="secondary" onClick={this.handleReload}>
                  Reload Page
                </Button>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for functional components to throw errors
export const useErrorHandler = () => {
  return (error: Error) => {
    console.error('Error caught by useErrorHandler:', error);
    throw error;
  };
};
