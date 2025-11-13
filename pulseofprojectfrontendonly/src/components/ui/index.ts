/**
 * ChatGPT-style UI Component Library
 *
 * Modern, clean, and accessible components for React applications.
 * All components follow ChatGPT's design principles:
 * - Clean typography (16-18px body text)
 * - Generous spacing
 * - Soft rounded corners
 * - Subtle shadows
 * - Smooth animations
 * - Neutral color palette with accent colors
 */

// Button components
export { Button, IconButton } from './Button'
export type { ButtonProps, IconButtonProps } from './Button'

// Modal component
export { Modal } from './Modal'
export type { ModalProps } from './Modal'

// Dropdown component
export { Dropdown } from './Dropdown'
export type { DropdownProps, DropdownOption } from './Dropdown'

// Input components
export { Input, TextArea } from './Input'
export type { InputProps, TextAreaProps } from './Input'

// Toast/Notification components
export { Toast, ToastContainer } from './Toast'
export type { ToastProps, ToastType, ToastData } from './Toast'

// Badge components
export { Badge, DotBadge, CounterBadge } from './Badge'
export type { BadgeProps, DotBadgeProps, CounterBadgeProps } from './Badge'

// Card components
export { Card, StatCard } from './Card'
export type { CardProps, StatCardProps } from './Card'

// Loading components
export { LoadingState, Skeleton, SkeletonGroup } from './LoadingState'
export type { LoadingStateProps, SkeletonProps } from './LoadingState'

// Empty state component
export { EmptyState } from './EmptyState'
export type { EmptyStateProps } from './EmptyState'
