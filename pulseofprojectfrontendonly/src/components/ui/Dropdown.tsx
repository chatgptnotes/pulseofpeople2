import React, { useState, useRef, useEffect } from 'react'
import { Check as CheckIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material'

export interface DropdownOption {
  value: string
  label: string
  icon?: React.ReactNode
  disabled?: boolean
}

export interface DropdownProps {
  options: DropdownOption[]
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  error?: string
  label?: string
}

/**
 * ChatGPT-style Dropdown Component
 *
 * Features:
 * - Smooth slide and fade animations
 * - Keyboard navigation (Arrow keys, Enter, Escape)
 * - Click outside to close
 * - Icons support
 * - Check mark for selected item
 * - Accessible
 */
export const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  className = '',
  disabled = false,
  error,
  label
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const selectedOption = options.find(opt => opt.value === value)

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (isOpen && focusedIndex >= 0) {
          const option = options[focusedIndex]
          if (!option.disabled) {
            onChange(option.value)
            setIsOpen(false)
          }
        } else {
          setIsOpen(!isOpen)
        }
        break
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        buttonRef.current?.focus()
        break
      case 'ArrowDown':
        e.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
          setFocusedIndex(0)
        } else {
          setFocusedIndex(prev =>
            prev < options.length - 1 ? prev + 1 : prev
          )
        }
        break
      case 'ArrowUp':
        e.preventDefault()
        if (isOpen) {
          setFocusedIndex(prev => prev > 0 ? prev - 1 : 0)
        }
        break
    }
  }

  const handleSelect = (option: DropdownOption) => {
    if (!option.disabled) {
      onChange(option.value)
      setIsOpen(false)
      buttonRef.current?.focus()
    }
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}

      {/* Trigger button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between
          px-4 py-2.5 text-base
          bg-white border rounded-lg
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-0
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
            : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500/20'
          }
          ${isOpen ? 'ring-2 ring-primary-500/20 border-primary-500' : ''}
        `}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2 flex-1 text-left">
          {selectedOption?.icon && (
            <span className="flex items-center text-gray-500">
              {selectedOption.icon}
            </span>
          )}
          <span className={selectedOption ? 'text-gray-900' : 'text-gray-400'}>
            {selectedOption?.label || placeholder}
          </span>
        </span>

        <ExpandMoreIcon
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>

      {error && (
        <p className="mt-1.5 text-sm text-red-600">{error}</p>
      )}

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg animate-slideDown"
          role="listbox"
        >
          <div className="py-1.5 max-h-60 overflow-y-auto scrollbar-thin">
            {options.map((option, index) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option)}
                onMouseEnter={() => setFocusedIndex(index)}
                disabled={option.disabled}
                className={`
                  w-full flex items-center justify-between gap-2
                  px-4 py-2.5 text-sm text-left
                  transition-colors duration-150
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${focusedIndex === index
                    ? 'bg-gray-100'
                    : 'hover:bg-gray-50'
                  }
                  ${option.value === value
                    ? 'text-accent font-medium'
                    : 'text-gray-900'
                  }
                `}
                role="option"
                aria-selected={option.value === value}
              >
                <span className="flex items-center gap-2 flex-1">
                  {option.icon && (
                    <span className="flex items-center text-gray-500">
                      {option.icon}
                    </span>
                  )}
                  {option.label}
                </span>

                {option.value === value && (
                  <CheckIcon className="w-4 h-4 text-accent" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dropdown
