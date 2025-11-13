/**
 * Error Logging Service
 * Centralized error logging with integration to monitoring services
 */

export interface ErrorLog {
  errorId: string;
  timestamp: string;
  message: string;
  stack?: string;
  componentStack?: string;
  userAgent: string;
  url: string;
  userId?: string;
  tenantId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'ui' | 'api' | 'auth' | 'network' | 'unknown';
  metadata?: Record<string, any>;
}

export interface ErrorLoggerConfig {
  enabled: boolean;
  sentryDsn?: string;
  endpoint?: string;
  sampleRate?: number;
  ignoreErrors?: string[];
}

class ErrorLogger {
  private config: ErrorLoggerConfig = {
    enabled: true,
    sampleRate: 1.0,
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
    ],
  };

  private errorCache = new Set<string>();
  private maxCacheSize = 100;

  /**
   * Initialize error logger with configuration
   */
  initialize(config: Partial<ErrorLoggerConfig>): void {
    this.config = { ...this.config, ...config };

    // Set up global error handlers
    if (typeof window !== 'undefined' && this.config.enabled) {
      window.addEventListener('error', this.handleGlobalError.bind(this));
      window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));
    }
  }

  /**
   * Log an error
   */
  logError(
    error: Error,
    context?: {
      componentStack?: string;
      userId?: string;
      tenantId?: string;
      severity?: 'low' | 'medium' | 'high' | 'critical';
      category?: 'ui' | 'api' | 'auth' | 'network' | 'unknown';
      metadata?: Record<string, any>;
    }
  ): string {
    if (!this.config.enabled) {
      return '';
    }

    // Check if error should be ignored
    if (this.shouldIgnoreError(error.message)) {
      return '';
    }

    // Check sampling rate
    if (Math.random() > (this.config.sampleRate || 1)) {
      return '';
    }

    // Generate unique error ID
    const errorId = this.generateErrorId(error);

    // Deduplicate errors (don't log the same error multiple times)
    if (this.errorCache.has(errorId)) {
      return errorId;
    }

    const errorLog: ErrorLog = {
      errorId,
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      componentStack: context?.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: context?.userId,
      tenantId: context?.tenantId,
      severity: context?.severity || this.inferSeverity(error),
      category: context?.category || this.inferCategory(error),
      metadata: context?.metadata,
    };

    // Add to cache
    this.addToCache(errorId);

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('[ErrorLogger]', errorLog);
    }

    // Send to monitoring services
    this.sendToMonitoring(errorLog);

    // Store locally for debugging
    this.storeLocally(errorLog);

    return errorId;
  }

  /**
   * Handle global error events
   */
  private handleGlobalError(event: ErrorEvent): void {
    this.logError(event.error || new Error(event.message), {
      category: 'unknown',
      severity: 'high',
      metadata: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    });
  }

  /**
   * Handle unhandled promise rejections
   */
  private handleUnhandledRejection(event: PromiseRejectionEvent): void {
    const error = event.reason instanceof Error
      ? event.reason
      : new Error(String(event.reason));

    this.logError(error, {
      category: 'unknown',
      severity: 'high',
      metadata: {
        type: 'unhandledRejection',
        reason: event.reason,
      },
    });
  }

  /**
   * Check if error should be ignored
   */
  private shouldIgnoreError(message: string): boolean {
    return this.config.ignoreErrors?.some(pattern => message.includes(pattern)) || false;
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(error: Error): string {
    const hash = this.hashCode(error.message + error.stack);
    return `err_${Date.now()}_${hash}`;
  }

  /**
   * Simple hash function
   */
  private hashCode(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Add error to cache
   */
  private addToCache(errorId: string): void {
    this.errorCache.add(errorId);

    // Maintain cache size
    if (this.errorCache.size > this.maxCacheSize) {
      const firstItem = this.errorCache.values().next().value;
      this.errorCache.delete(firstItem);
    }
  }

  /**
   * Infer error severity
   */
  private inferSeverity(error: Error): 'low' | 'medium' | 'high' | 'critical' {
    const message = error.message.toLowerCase();

    if (message.includes('critical') || message.includes('fatal')) {
      return 'critical';
    }
    if (message.includes('network') || message.includes('timeout')) {
      return 'high';
    }
    if (message.includes('warning') || message.includes('deprecated')) {
      return 'low';
    }

    return 'medium';
  }

  /**
   * Infer error category
   */
  private inferCategory(error: Error): 'ui' | 'api' | 'auth' | 'network' | 'unknown' {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';

    if (message.includes('network') || message.includes('fetch') || message.includes('xhr')) {
      return 'network';
    }
    if (message.includes('auth') || message.includes('unauthorized') || message.includes('forbidden')) {
      return 'auth';
    }
    if (message.includes('api') || stack.includes('/api/')) {
      return 'api';
    }
    if (stack.includes('component') || message.includes('render')) {
      return 'ui';
    }

    return 'unknown';
  }

  /**
   * Send error to monitoring services
   */
  private async sendToMonitoring(errorLog: ErrorLog): Promise<void> {
    try {
      // Send to Sentry if configured
      if (this.config.sentryDsn) {
        await this.sendToSentry(errorLog);
      }

      // Send to custom endpoint if configured
      if (this.config.endpoint) {
        await fetch(this.config.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(errorLog),
        });
      }
    } catch (error) {
      // Fail silently to avoid recursive errors
      console.error('Failed to send error to monitoring:', error);
    }
  }

  /**
   * Send to Sentry
   */
  private async sendToSentry(errorLog: ErrorLog): Promise<void> {
    // Sentry integration placeholder
    // In production, use @sentry/react SDK
    console.log('Would send to Sentry:', errorLog);
  }

  /**
   * Store error locally for debugging
   */
  private storeLocally(errorLog: ErrorLog): void {
    try {
      const key = 'error_logs';
      const stored = localStorage.getItem(key);
      const logs = stored ? JSON.parse(stored) : [];

      logs.push(errorLog);

      // Keep only last 50 errors
      if (logs.length > 50) {
        logs.shift();
      }

      localStorage.setItem(key, JSON.stringify(logs));
    } catch (error) {
      // Fail silently if localStorage is full
    }
  }

  /**
   * Get stored error logs
   */
  getStoredErrors(): ErrorLog[] {
    try {
      const stored = localStorage.getItem('error_logs');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Clear stored error logs
   */
  clearStoredErrors(): void {
    localStorage.removeItem('error_logs');
    this.errorCache.clear();
  }

  /**
   * Log API error
   */
  logApiError(
    endpoint: string,
    status: number,
    message: string,
    context?: {
      userId?: string;
      tenantId?: string;
      metadata?: Record<string, any>;
    }
  ): string {
    const error = new Error(`API Error (${status}): ${message}`);
    return this.logError(error, {
      category: 'api',
      severity: status >= 500 ? 'critical' : 'high',
      userId: context?.userId,
      tenantId: context?.tenantId,
      metadata: {
        endpoint,
        status,
        ...context?.metadata,
      },
    });
  }

  /**
   * Log network error
   */
  logNetworkError(
    message: string,
    context?: {
      userId?: string;
      tenantId?: string;
      metadata?: Record<string, any>;
    }
  ): string {
    const error = new Error(`Network Error: ${message}`);
    return this.logError(error, {
      category: 'network',
      severity: 'high',
      ...context,
    });
  }

  /**
   * Log authentication error
   */
  logAuthError(
    message: string,
    context?: {
      userId?: string;
      tenantId?: string;
      metadata?: Record<string, any>;
    }
  ): string {
    const error = new Error(`Auth Error: ${message}`);
    return this.logError(error, {
      category: 'auth',
      severity: 'critical',
      ...context,
    });
  }
}

// Export singleton instance
export const errorLogger = new ErrorLogger();

// Initialize with default config
errorLogger.initialize({
  enabled: true,
  sampleRate: 1.0,
  endpoint: import.meta.env.VITE_ERROR_LOGGING_ENDPOINT,
  sentryDsn: import.meta.env.VITE_SENTRY_DSN,
});

export default errorLogger;
