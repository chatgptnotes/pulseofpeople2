import React from 'react'
import { CircularProgress } from '@mui/material'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
}

/**
 * ChatGPT-style Button Component
 *
 * Variants:
 * - primary: ChatGPT green background
 * - secondary: Neutral gray background
 * - ghost: Transparent with hover effect
 * - danger: Red for destructive actions
 * - success: Green for confirmations
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      children,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95'

    const variantStyles = {
      primary: 'bg-accent text-white hover:bg-accent-hover focus:ring-accent shadow-sm hover:shadow-md',
      secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-300 border border-gray-200',
      ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-300',
      danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 shadow-sm hover:shadow-md',
      success: 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500 shadow-sm hover:shadow-md'
    }

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-6 py-3 text-base'
    }

    const widthStyle = fullWidth ? 'w-full' : ''

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
        {...props}
      >
        {loading && (
          <CircularProgress
            size={size === 'sm' ? 14 : size === 'md' ? 16 : 18}
            className="mr-2"
            sx={{ color: 'currentColor' }}
          />
        )}

        {!loading && icon && iconPosition === 'left' && (
          <span className="mr-2 flex items-center">{icon}</span>
        )}

        {children}

        {!loading && icon && iconPosition === 'right' && (
          <span className="ml-2 flex items-center">{icon}</span>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

// Icon Button variant for icon-only buttons
export interface IconButtonProps extends Omit<ButtonProps, 'icon' | 'iconPosition'> {
  icon: React.ReactNode
  'aria-label': string
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, size = 'md', variant = 'ghost', className = '', ...props }, ref) => {
    const sizeStyles = {
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-12 h-12'
    }

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={`${sizeStyles[size]} p-0 ${className}`}
        {...props}
      >
        {icon}
      </Button>
    )
  }
)

IconButton.displayName = 'IconButton'
