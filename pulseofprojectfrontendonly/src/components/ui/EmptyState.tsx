import React from 'react'
import { Inbox as InboxIcon } from '@mui/icons-material'
import { Button } from './Button'

export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    icon?: React.ReactNode
  }
  className?: string
}

/**
 * ChatGPT-style Empty State Component
 *
 * Features:
 * - Clean, centered design
 * - Optional icon
 * - Title and description
 * - Optional call-to-action button
 * - Subtle, friendly appearance
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      {/* Icon */}
      <div className="mb-4 p-4 bg-gray-100 rounded-full text-gray-400">
        {icon || <InboxIcon className="w-12 h-12" />}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-sm text-gray-500 max-w-md mb-6">
          {description}
        </p>
      )}

      {/* Action */}
      {action && (
        <Button
          variant="primary"
          onClick={action.onClick}
          icon={action.icon}
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}

export default EmptyState
