import React from 'react'
import { Error as ErrorIcon } from '@mui/icons-material'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

/**
 * ChatGPT-style Input Component
 *
 * Features:
 * - Clean, modern design
 * - Icon support (left and right)
 * - Error states with messages
 * - Helper text
 * - Focus ring with accent color
 * - Smooth transitions
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const widthStyle = fullWidth ? 'w-full' : ''
    const errorId = error && props.id ? `${props.id}-error` : undefined
    const helperId = helperText && props.id ? `${props.id}-helper` : undefined
    const describedBy = errorId || helperId

    return (
      <div className={`${widthStyle} ${className}`}>
        {label && (
          <label
            htmlFor={props.id}
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={describedBy}
            className={`
              w-full px-4 py-2.5 text-base text-gray-900
              bg-white border rounded-lg
              placeholder-gray-400
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-0
              disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50
              ${leftIcon ? 'pl-10' : ''}
              ${rightIcon || error ? 'pr-10' : ''}
              ${error
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500/20'
              }
            `}
            {...props}
          />

          {(rightIcon || error) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {error ? (
                <ErrorIcon className="w-5 h-5 text-red-500" />
              ) : (
                <span className="text-gray-400">{rightIcon}</span>
              )}
            </div>
          )}
        </div>

        {(error || helperText) && (
          <p
            id={error ? errorId : helperId}
            className={`mt-1.5 text-sm ${
              error ? 'text-red-600' : 'text-gray-500'
            }`}
            role={error ? 'alert' : undefined}
          >
            {error || helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

// TextArea component
export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
  fullWidth?: boolean
  resize?: boolean
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      resize = true,
      className = '',
      ...props
    },
    ref
  ) => {
    const widthStyle = fullWidth ? 'w-full' : ''
    const resizeStyle = resize ? 'resize-y' : 'resize-none'
    const errorId = error && props.id ? `${props.id}-error` : undefined
    const helperId = helperText && props.id ? `${props.id}-helper` : undefined
    const describedBy = errorId || helperId

    return (
      <div className={`${widthStyle} ${className}`}>
        {label && (
          <label
            htmlFor={props.id}
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedBy}
          className={`
            w-full px-4 py-2.5 text-base text-gray-900
            bg-white border rounded-lg
            placeholder-gray-400
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-0
            disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50
            ${resizeStyle}
            ${error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
              : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500/20'
            }
          `}
          {...props}
        />

        {(error || helperText) && (
          <p
            id={error ? errorId : helperId}
            className={`mt-1.5 text-sm ${
              error ? 'text-red-600' : 'text-gray-500'
            }`}
            role={error ? 'alert' : undefined}
          >
            {error || helperText}
          </p>
        )}
      </div>
    )
  }
)

TextArea.displayName = 'TextArea'

export default Input
