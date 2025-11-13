/**
 * Card Tooltip Component
 *
 * Displays a 5-second summary notification in the top-right corner when hovering over dashboard cards
 * Light visibility with smooth fade-in/fade-out animations
 */

import React, { useState, useEffect } from 'react';
import { Info } from 'lucide-react';

interface CardTooltipProps {
  title: string;
  summary: string;
  children: React.ReactNode;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export const CardTooltip: React.FC<CardTooltipProps> = ({
  title,
  summary,
  children,
  position = 'top-right'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    setIsVisible(true);

    // Auto-hide after 5 seconds
    const id = setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    setTimeoutId(id);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      {/* Tooltip Notification */}
      {isVisible && (
        <div
          className={`fixed ${positionClasses[position]} z-50 max-w-sm animate-in fade-in slide-in-from-top-2 duration-300`}
        >
          <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-indigo-100 p-4 space-y-2">
            {/* Header */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Info className="w-4 h-4 text-indigo-600" />
              </div>
              <h4 className="text-sm font-bold text-gray-900">{title}</h4>
            </div>

            {/* Summary Text */}
            <p className="text-xs text-gray-600 leading-relaxed">
              {summary}
            </p>

            {/* Progress Bar */}
            <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full animate-progress"
                style={{
                  animation: 'progress 5s linear'
                }}
              />
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

// Wrapper component for easy integration with existing cards
interface WithTooltipProps {
  title: string;
  summary: string;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  children: React.ReactNode;
}

export const WithTooltip: React.FC<WithTooltipProps> = ({ title, summary, position, children }) => {
  return (
    <CardTooltip title={title} summary={summary} position={position}>
      {children}
    </CardTooltip>
  );
};
