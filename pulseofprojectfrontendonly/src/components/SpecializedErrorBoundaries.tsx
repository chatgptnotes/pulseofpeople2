import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  Database as DatabaseIcon,
  CloudOff as NetworkIcon,
  Lock as AuthIcon,
  AlertTriangle as GenericIcon,
  RefreshCw as RefreshIcon,
} from 'lucide-react';
import { errorLogger } from '../lib/error-logger';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorId?: string;
}

/**
 * Base error boundary with custom UI
 */
abstract class SpecializedErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  abstract getName(): string;
  abstract getIcon(): ReactNode;
  abstract getTitle(): string;
  abstract getDefaultMessage(): string;
  abstract getSeverity(): 'low' | 'medium' | 'high' | 'critical';
  abstract getCategory(): 'ui' | 'api' | 'auth' | 'network' | 'unknown';

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorId = errorLogger.logError(error, {
      componentStack: errorInfo.componentStack,
      severity: this.getSeverity(),
      category: this.getCategory(),
      metadata: {
        boundaryName: this.getName(),
      },
    });

    this.setState({ errorId });
    console.error(`[${this.getName()}] Error:`, error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorId: undefined });
  };

  render() {
    if (this.state.hasError) {
      const message = this.props.fallbackMessage || this.getDefaultMessage();

      return (
        <div className="flex flex-col items-center justify-center p-8 bg-red-50 border border-red-200 rounded-lg">
          {this.getIcon()}
          <h3 className="text-lg font-semibold text-red-900 mb-2">{this.getTitle()}</h3>
          <p className="text-sm text-red-700 mb-4 text-center max-w-md">{message}</p>
          {this.state.errorId && (
            <p className="text-xs text-gray-500 mb-4">
              Error ID: <code className="bg-gray-100 px-1 py-0.5 rounded">{this.state.errorId}</code>
            </p>
          )}
          <button
            onClick={this.handleRetry}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <RefreshIcon className="w-4 h-4 mr-2" />
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Database Error Boundary
 * Use for components that fetch data from database
 */
export class DatabaseErrorBoundary extends SpecializedErrorBoundary {
  getName() {
    return 'DatabaseErrorBoundary';
  }

  getIcon() {
    return <DatabaseIcon className="w-12 h-12 text-red-500 mb-4" />;
  }

  getTitle() {
    return 'Database Error';
  }

  getDefaultMessage() {
    return 'Failed to load data from the database. Please try again or contact support if the problem persists.';
  }

  getSeverity() {
    return 'high' as const;
  }

  getCategory() {
    return 'api' as const;
  }
}

/**
 * Network Error Boundary
 * Use for components that make network requests
 */
export class NetworkErrorBoundary extends SpecializedErrorBoundary {
  getName() {
    return 'NetworkErrorBoundary';
  }

  getIcon() {
    return <NetworkIcon className="w-12 h-12 text-red-500 mb-4" />;
  }

  getTitle() {
    return 'Network Error';
  }

  getDefaultMessage() {
    return 'Network connection failed. Please check your internet connection and try again.';
  }

  getSeverity() {
    return 'high' as const;
  }

  getCategory() {
    return 'network' as const;
  }
}

/**
 * Authentication Error Boundary
 * Use for authentication-related components
 */
export class AuthErrorBoundary extends SpecializedErrorBoundary {
  getName() {
    return 'AuthErrorBoundary';
  }

  getIcon() {
    return <AuthIcon className="w-12 h-12 text-red-500 mb-4" />;
  }

  getTitle() {
    return 'Authentication Error';
  }

  getDefaultMessage() {
    return 'Authentication failed. Please log in again to continue.';
  }

  getSeverity() {
    return 'critical' as const;
  }

  getCategory() {
    return 'auth' as const;
  }

  handleRetry = () => {
    // Redirect to login on auth errors
    window.location.href = '/login';
  };
}

/**
 * UI Error Boundary
 * Use for UI components that might have rendering errors
 */
export class UIErrorBoundary extends SpecializedErrorBoundary {
  getName() {
    return 'UIErrorBoundary';
  }

  getIcon() {
    return <GenericIcon className="w-12 h-12 text-red-500 mb-4" />;
  }

  getTitle() {
    return 'Display Error';
  }

  getDefaultMessage() {
    return 'Failed to render this component. The component will be hidden until the issue is resolved.';
  }

  getSeverity() {
    return 'medium' as const;
  }

  getCategory() {
    return 'ui' as const;
  }
}

/**
 * Async Error Boundary
 * Use for components with async operations
 */
export class AsyncErrorBoundary extends SpecializedErrorBoundary {
  getName() {
    return 'AsyncErrorBoundary';
  }

  getIcon() {
    return <GenericIcon className="w-12 h-12 text-red-500 mb-4" />;
  }

  getTitle() {
    return 'Operation Failed';
  }

  getDefaultMessage() {
    return 'An asynchronous operation failed. Please try again.';
  }

  getSeverity() {
    return 'medium' as const;
  }

  getCategory() {
    return 'unknown' as const;
  }
}

/**
 * Inline Error Boundary
 * Minimal error boundary that doesn't take up much space
 */
export class InlineErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    errorLogger.logError(error, {
      componentStack: errorInfo.componentStack,
      severity: 'low',
      category: 'ui',
      metadata: { boundaryName: 'InlineErrorBoundary' },
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-between px-4 py-2 bg-red-50 border border-red-200 rounded text-sm">
          <span className="text-red-700">
            {this.props.fallbackMessage || 'Failed to load'}
          </span>
          <button
            onClick={this.handleRetry}
            className="ml-3 text-red-600 hover:text-red-700 underline"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
