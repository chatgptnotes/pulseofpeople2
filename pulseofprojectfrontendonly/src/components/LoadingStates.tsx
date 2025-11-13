import React from 'react';
import { Loader2 as LoaderIcon } from 'lucide-react';

/**
 * Loading Spinner
 * Simple centered loading spinner
 */
export function LoadingSpinner({ size = 'md', message }: { size?: 'sm' | 'md' | 'lg'; message?: string }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <LoaderIcon className={`${sizeClasses[size]} animate-spin text-blue-600`} />
      {message && <p className="mt-3 text-sm text-gray-600">{message}</p>}
    </div>
  );
}

/**
 * Full Page Loading
 * Loading state that covers the entire viewport
 */
export function FullPageLoading({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
      <div className="text-center">
        <LoaderIcon className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-lg text-gray-900 font-medium">{message}</p>
      </div>
    </div>
  );
}

/**
 * Skeleton Loader
 * Animated skeleton for content placeholders
 */
export function Skeleton({ className = '', variant = 'rect' }: { className?: string; variant?: 'rect' | 'circle' | 'text' }) {
  const variantClasses = {
    rect: 'rounded-lg',
    circle: 'rounded-full',
    text: 'rounded h-4',
  };

  return (
    <div
      className={`bg-gray-200 animate-pulse ${variantClasses[variant]} ${className}`}
      style={{ minHeight: variant === 'text' ? '1rem' : undefined }}
    />
  );
}

/**
 * Table Loading Skeleton
 */
export function TableLoadingSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="w-full">
      {/* Table Header */}
      <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-10" />
        ))}
      </div>

      {/* Table Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid gap-4 mb-3" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-12" />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Card Loading Skeleton
 */
export function CardLoadingSkeleton({ count = 1 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
          <Skeleton className="h-6 w-3/4 mb-4" />
          <Skeleton className="h-4 w-full mb-2" variant="text" />
          <Skeleton className="h-4 w-5/6 mb-2" variant="text" />
          <Skeleton className="h-4 w-2/3" variant="text" />
          <div className="flex items-center justify-between mt-6">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-8" variant="circle" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Dashboard Loading Skeleton
 */
export function DashboardLoadingSkeleton() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" variant="text" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
            <Skeleton className="h-12 w-12 mb-4" variant="circle" />
            <Skeleton className="h-8 w-20 mb-2" />
            <Skeleton className="h-4 w-32" variant="text" />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <Skeleton className="h-64 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * List Loading Skeleton
 */
export function ListLoadingSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center p-4 bg-white rounded-lg border border-gray-200">
          <Skeleton className="w-12 h-12 mr-4" variant="circle" />
          <div className="flex-1">
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" variant="text" />
          </div>
          <Skeleton className="w-20 h-8" />
        </div>
      ))}
    </div>
  );
}

/**
 * Inline Loading
 * Small loading indicator for inline use
 */
export function InlineLoading({ message }: { message?: string }) {
  return (
    <div className="inline-flex items-center text-sm text-gray-600">
      <LoaderIcon className="w-4 h-4 animate-spin mr-2" />
      {message && <span>{message}</span>}
    </div>
  );
}

/**
 * Button Loading State
 * Loading state for buttons
 */
export function ButtonLoading({ children, loading, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button {...props} disabled={loading || props.disabled}>
      {loading ? (
        <span className="flex items-center">
          <LoaderIcon className="w-4 h-4 animate-spin mr-2" />
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
}

/**
 * Progress Bar
 * Animated progress bar for long-running operations
 */
export function ProgressBar({ progress, message }: { progress: number; message?: string }) {
  return (
    <div className="w-full">
      {message && <p className="text-sm text-gray-600 mb-2">{message}</p>}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-1 text-right">{Math.round(progress)}%</p>
    </div>
  );
}

/**
 * Indeterminate Progress Bar
 * For operations without known duration
 */
export function IndeterminateProgressBar({ message }: { message?: string }) {
  return (
    <div className="w-full">
      {message && <p className="text-sm text-gray-600 mb-2">{message}</p>}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div className="bg-blue-600 h-2 rounded-full animate-indeterminate-progress" />
      </div>
      <style>{`
        @keyframes indeterminate-progress {
          0% {
            transform: translateX(-100%);
            width: 30%;
          }
          100% {
            transform: translateX(400%);
            width: 30%;
          }
        }
        .animate-indeterminate-progress {
          animation: indeterminate-progress 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

/**
 * Overlay Loading
 * Semi-transparent overlay with loading indicator
 */
export function OverlayLoading({ message }: { message?: string }) {
  return (
    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
      <div className="text-center">
        <LoaderIcon className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
        {message && <p className="text-sm text-gray-600">{message}</p>}
      </div>
    </div>
  );
}

/**
 * Dots Loading
 * Simple animated dots indicator
 */
export function DotsLoading() {
  return (
    <div className="flex items-center space-x-1">
      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
}

/**
 * Suspense Fallback
 * Loading state for React.Suspense
 */
export function SuspenseFallback({ message = 'Loading component...' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="text-center">
        <LoaderIcon className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
        <p className="text-sm text-gray-600">{message}</p>
      </div>
    </div>
  );
}

/**
 * Shimmer Effect
 * Modern shimmer loading effect
 */
export function Shimmer({ className = '' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-gray-200 ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      <style>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}

/**
 * Pulse Loading
 * Pulsing circle loader
 */
export function PulseLoading({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-blue-600 animate-ping opacity-75`} />
  );
}

/**
 * Custom Loading with Logo
 * Branded loading screen
 */
export function BrandedLoading({ message = 'Loading Pulse of People...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center z-50">
      <div className="text-center">
        {/* Replace with your logo */}
        <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          <span className="text-white text-3xl font-bold">P</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Pulse of People</h2>
        <p className="text-gray-600 mb-4">{message}</p>
        <IndeterminateProgressBar />
      </div>
    </div>
  );
}

export default {
  LoadingSpinner,
  FullPageLoading,
  Skeleton,
  TableLoadingSkeleton,
  CardLoadingSkeleton,
  DashboardLoadingSkeleton,
  ListLoadingSkeleton,
  InlineLoading,
  ButtonLoading,
  ProgressBar,
  IndeterminateProgressBar,
  OverlayLoading,
  DotsLoading,
  SuspenseFallback,
  Shimmer,
  PulseLoading,
  BrandedLoading,
};
