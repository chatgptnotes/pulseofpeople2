import React from 'react'
import { CircularProgress } from '@mui/material'

export interface LoadingStateProps {
  size?: 'sm' | 'md' | 'lg'
  message?: string
  fullScreen?: boolean
  className?: string
}

/**
 * ChatGPT-style Loading State Component
 *
 * Features:
 * - Clean, minimal spinner
 * - Optional loading message
 * - Full screen overlay option
 * - Multiple sizes
 */
export const LoadingState: React.FC<LoadingStateProps> = ({
  size = 'md',
  message,
  fullScreen = false,
  className = ''
}) => {
  const sizeMap = {
    sm: 24,
    md: 40,
    lg: 56
  }

  const textSizeMap = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  const LoadingContent = (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <CircularProgress
        size={sizeMap[size]}
        thickness={4}
        sx={{
          color: '#10A37F' // accent color
        }}
      />
      {message && (
        <p className={`${textSizeMap[size]} text-gray-600 font-medium animate-pulse`}>
          {message}
        </p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {LoadingContent}
      </div>
    )
  }

  return LoadingContent
}

// Skeleton Loader for content placeholders
export interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
  className?: string
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  className = ''
}) => {
  const baseStyles = 'bg-gray-200 animate-pulse'

  const variantStyles = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg'
  }

  const style: React.CSSProperties = {
    width: width || (variant === 'text' ? '100%' : undefined),
    height: height || (variant === 'circular' ? width : undefined)
  }

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      style={style}
    />
  )
}

// Skeleton Group for multiple skeletons
export const SkeletonGroup: React.FC<{ count?: number; className?: string }> = ({
  count = 3,
  className = ''
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} />
      ))}
    </div>
  )
}

export default LoadingState
