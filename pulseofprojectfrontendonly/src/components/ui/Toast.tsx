import React, { useEffect, useState } from 'react'
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Close as CloseIcon
} from '@mui/icons-material'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastProps {
  type: ToastType
  message: string
  description?: string
  duration?: number
  onClose?: () => void
  position?: 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left'
}

/**
 * ChatGPT-style Toast Component
 *
 * Features:
 * - Multiple types (success, error, warning, info)
 * - Auto-dismiss with custom duration
 * - Slide-in animation
 * - Manual close button
 * - Configurable position
 * - Progress bar indicator
 */
export const Toast: React.FC<ToastProps> = ({
  type,
  message,
  description,
  duration = 5000,
  onClose,
  position = 'top-right'
}) => {
  const [isVisible, setIsVisible] = useState(true)
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    if (duration > 0) {
      const startTime = Date.now()
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime
        const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
        setProgress(remaining)

        if (remaining === 0) {
          clearInterval(interval)
          handleClose()
        }
      }, 16) // ~60fps

      return () => clearInterval(interval)
    }
  }, [duration])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      onClose?.()
    }, 300) // Wait for exit animation
  }

  const typeStyles = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: <SuccessIcon className="w-5 h-5 text-green-500" />,
      progress: 'bg-green-500'
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: <ErrorIcon className="w-5 h-5 text-red-500" />,
      progress: 'bg-red-500'
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: <WarningIcon className="w-5 h-5 text-yellow-500" />,
      progress: 'bg-yellow-500'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: <InfoIcon className="w-5 h-5 text-blue-500" />,
      progress: 'bg-blue-500'
    }
  }

  const positionStyles = {
    'top-right': 'top-4 right-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
    'bottom-left': 'bottom-4 left-4'
  }

  const style = typeStyles[type]

  if (!isVisible) return null

  return (
    <div
      className={`fixed ${positionStyles[position]} z-50 w-96 max-w-[calc(100vw-2rem)] animate-slideInRight`}
      role="alert"
    >
      <div
        className={`
          relative overflow-hidden
          ${style.bg} ${style.border}
          border rounded-lg shadow-lg
          backdrop-blur-sm
        `}
      >
        {/* Content */}
        <div className="flex items-start gap-3 p-4">
          {/* Icon */}
          <div className="flex-shrink-0 mt-0.5">
            {style.icon}
          </div>

          {/* Message */}
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${style.text}`}>
              {message}
            </p>
            {description && (
              <p className={`mt-1 text-sm ${style.text} opacity-80`}>
                {description}
              </p>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className={`
              flex-shrink-0 p-1 rounded-md
              ${style.text} opacity-60 hover:opacity-100
              transition-opacity duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-2
            `}
            aria-label="Close notification"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar */}
        {duration > 0 && (
          <div className="h-1 bg-gray-200/50">
            <div
              className={`h-full ${style.progress} transition-all duration-100 ease-linear`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// Toast Container for managing multiple toasts
export interface ToastData extends Omit<ToastProps, 'onClose'> {
  id: string
}

export const ToastContainer: React.FC<{ toasts: ToastData[]; onRemove: (id: string) => void }> = ({
  toasts,
  onRemove
}) => {
  return (
    <>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </>
  )
}

export default Toast
