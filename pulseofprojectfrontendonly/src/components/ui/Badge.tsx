import React from 'react'

export interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md' | 'lg'
  rounded?: boolean
  icon?: React.ReactNode
  className?: string
}

/**
 * ChatGPT-style Badge Component
 *
 * Features:
 * - Multiple color variants
 * - Different sizes
 * - Optional icon
 * - Pill or rounded shape
 * - Subtle, modern design
 */
export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  rounded = false,
  icon,
  className = ''
}) => {
  const baseStyles = 'inline-flex items-center gap-1.5 font-medium transition-colors duration-200'

  const variantStyles = {
    default: 'bg-gray-100 text-gray-700 border border-gray-200',
    primary: 'bg-accent-light text-accent border border-accent/20',
    success: 'bg-green-100 text-green-700 border border-green-200',
    warning: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
    danger: 'bg-red-100 text-red-700 border border-red-200',
    info: 'bg-blue-100 text-blue-700 border border-blue-200'
  }

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  }

  const shapeStyle = rounded ? 'rounded-full' : 'rounded-md'

  return (
    <span
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${shapeStyle} ${className}`}
    >
      {icon && <span className="flex items-center">{icon}</span>}
      {children}
    </span>
  )
}

// Dot Badge - for status indicators
export interface DotBadgeProps {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md' | 'lg'
  pulse?: boolean
  className?: string
}

export const DotBadge: React.FC<DotBadgeProps> = ({
  variant = 'default',
  size = 'md',
  pulse = false,
  className = ''
}) => {
  const dotColors = {
    default: 'bg-gray-400',
    primary: 'bg-accent',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500'
  }

  const dotSizes = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3'
  }

  return (
    <span className={`relative inline-flex ${className}`}>
      <span
        className={`${dotSizes[size]} ${dotColors[variant]} rounded-full`}
      />
      {pulse && (
        <span
          className={`absolute inline-flex h-full w-full rounded-full ${dotColors[variant]} opacity-75 animate-ping`}
        />
      )}
    </span>
  )
}

// Counter Badge - for notification counts
export interface CounterBadgeProps {
  count: number
  max?: number
  variant?: 'default' | 'primary' | 'danger'
  size?: 'sm' | 'md'
  className?: string
}

export const CounterBadge: React.FC<CounterBadgeProps> = ({
  count,
  max = 99,
  variant = 'danger',
  size = 'md',
  className = ''
}) => {
  const displayCount = count > max ? `${max}+` : count

  const variantStyles = {
    default: 'bg-gray-500 text-white',
    primary: 'bg-accent text-white',
    danger: 'bg-red-500 text-white'
  }

  const sizeStyles = {
    sm: 'min-w-[18px] h-[18px] text-xs',
    md: 'min-w-[20px] h-[20px] text-sm'
  }

  if (count === 0) return null

  return (
    <span
      className={`
        inline-flex items-center justify-center
        px-1.5 rounded-full font-semibold
        ${variantStyles[variant]} ${sizeStyles[size]} ${className}
      `}
    >
      {displayCount}
    </span>
  )
}

export default Badge
