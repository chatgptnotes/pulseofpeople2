/**
 * SentimentLegend Component
 * Color scale guide for map sentiment visualization
 */

import React from 'react';
import { motion } from 'framer-motion';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import RemoveIcon from '@mui/icons-material/Remove';

interface SentimentLegendProps {
  className?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export const SentimentLegend: React.FC<SentimentLegendProps> = ({
  className = '',
  position = 'bottom-right'
}) => {
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  };

  const sentimentLevels = [
    {
      label: 'Strong Positive',
      color: '#15803d', // green-700
      icon: <ThumbUpIcon className="w-4 h-4" />,
      range: '70-100%'
    },
    {
      label: 'Positive',
      color: '#22c55e', // green-500
      icon: <ThumbUpIcon className="w-4 h-4" />,
      range: '50-69%'
    },
    {
      label: 'Neutral',
      color: '#eab308', // yellow-500
      icon: <RemoveIcon className="w-4 h-4" />,
      range: '40-49%'
    },
    {
      label: 'Negative',
      color: '#ef4444', // red-500
      icon: <ThumbDownIcon className="w-4 h-4" />,
      range: '30-39%'
    },
    {
      label: 'Strong Negative',
      color: '#991b1b', // red-800
      icon: <ThumbDownIcon className="w-4 h-4" />,
      range: '0-29%'
    },
    {
      label: 'No Data',
      color: '#9ca3af', // gray-400
      icon: null,
      range: 'N/A'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.5 }}
      className={`
        absolute z-[1000] bg-white rounded-lg shadow-lg p-4
        ${positionClasses[position]}
        ${className}
      `}
    >
      {/* Header */}
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Sentiment Scale</h3>
        <p className="text-xs text-gray-500 mt-0.5">Based on TVK support</p>
      </div>

      {/* Legend items */}
      <div className="space-y-2">
        {sentimentLevels.map((level, index) => (
          <motion.div
            key={level.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + index * 0.05 }}
            className="flex items-center space-x-2"
          >
            {/* Color box */}
            <div
              className="w-6 h-6 rounded border-2 border-white shadow-sm flex-shrink-0"
              style={{ backgroundColor: level.color }}
            />

            {/* Label and icon */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1">
                {level.icon && (
                  <span style={{ color: level.color }}>{level.icon}</span>
                )}
                <span className="text-xs font-medium text-gray-700">{level.label}</span>
              </div>
              <span className="text-xs text-gray-500">{level.range}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer note */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500 leading-relaxed">
          Colors represent sentiment strength based on aggregated voter data, polls, and social media analysis.
        </p>
      </div>
    </motion.div>
  );
};
