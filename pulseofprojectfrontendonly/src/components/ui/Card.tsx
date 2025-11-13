import React from 'react'

export interface CardProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  headerAction?: React.ReactNode
  footer?: React.ReactNode
  variant?: 'default' | 'bordered' | 'elevated'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hoverable?: boolean
  clickable?: boolean
  onClick?: () => void
  className?: string
}

/**
 * ChatGPT-style Card Component
 *
 * Features:
 * - Clean, modern design
 * - Optional header with title and action
 * - Optional footer
 * - Hover effects
 * - Multiple variants
 * - Configurable padding
 */
export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  headerAction,
  footer,
  variant = 'default',
  padding = 'md',
  hoverable = false,
  clickable = false,
  onClick,
  className = ''
}) => {
  const baseStyles = 'bg-white rounded-xl transition-all duration-200'

  const variantStyles = {
    default: 'border border-gray-200',
    bordered: 'border-2 border-red-200',
    elevated: 'shadow-md border border-red-100'
  }

  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }

  const hoverStyles = hoverable
    ? 'hover:shadow-lg hover:border-red-300 cursor-pointer'
    : ''

  const clickableStyles = clickable && onClick
    ? 'cursor-pointer active:scale-[0.98]'
    : ''

  const handleClick = () => {
    if (clickable && onClick) {
      onClick()
    }
  }

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${hoverStyles} ${clickableStyles} ${className}`}
      onClick={handleClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      {/* Header */}
      {(title || subtitle || headerAction) && (
        <div className={`flex items-start justify-between border-b border-gray-200 ${paddingStyles[padding]} pb-4`}>
          <div className="flex-1">
            {title && (
              <h3 className="text-lg font-semibold text-gray-900">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="mt-1 text-sm text-gray-500">
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && (
            <div className="ml-4 flex-shrink-0">
              {headerAction}
            </div>
          )}
        </div>
      )}

      {/* Body */}
      <div className={paddingStyles[padding]}>
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className={`border-t border-gray-200 ${paddingStyles[padding]} pt-4`}>
          {footer}
        </div>
      )}
    </div>
  )
}

// Stat Card - for displaying metrics
export interface StatCardProps {
  label: string
  value: string | number
  change?: {
    value: number
    type: 'increase' | 'decrease'
  }
  icon?: React.ReactNode
  trend?: React.ReactNode
  className?: string
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  change,
  icon,
  trend,
  className = ''
}) => {
  return (
    <Card
      variant="elevated"
      padding="md"
      hoverable
      className={className}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>

          {change && (
            <div className="mt-2 flex items-center gap-1">
              <span
                className={`text-sm font-medium ${
                  change.type === 'increase'
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {change.type === 'increase' ? '↑' : '↓'} {Math.abs(change.value)}%
              </span>
              <span className="text-sm text-gray-500">vs last period</span>
            </div>
          )}
        </div>

        {icon && (
          <div className="flex-shrink-0 p-3 bg-gradient-to-br from-red-50 to-yellow-50 border border-red-200 rounded-lg">
            <div className="text-red-600">{icon}</div>
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-4">
          {trend}
        </div>
      )}
    </Card>
  )
}

export default Card
