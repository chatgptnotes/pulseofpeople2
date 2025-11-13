/**
 * Gauge Chart Component
 * Circular gauge for sentiment scores, progress, KPIs
 */

import React from 'react';

interface GaugeChartProps {
  value: number; // 0-100
  title?: string;
  subtitle?: string;
  size?: number;
  color?: 'auto' | string;
  showValue?: boolean;
}

const getColorByValue = (value: number): string => {
  if (value >= 70) return '#10b981'; // green
  if (value >= 50) return '#f59e0b'; // amber
  if (value >= 30) return '#f97316'; // orange
  return '#ef4444'; // red
};

export const GaugeChart: React.FC<GaugeChartProps> = ({
  value,
  title,
  subtitle,
  size = 200,
  color = 'auto',
  showValue = true,
}) => {
  const normalizedValue = Math.min(Math.max(value, 0), 100);
  const gaugeColor = color === 'auto' ? getColorByValue(normalizedValue) : color;
  const radius = size / 2 - 10;
  const circumference = Math.PI * radius;
  const offset = circumference - (normalizedValue / 100) * circumference;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col items-center">
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>}
      <div className="relative" style={{ width: size, height: size / 2 + 20 }}>
        <svg width={size} height={size / 2 + 20} className="overflow-visible">
          {/* Background arc */}
          <path
            d={`M ${size / 2 - radius} ${size / 2} A ${radius} ${radius} 0 0 1 ${size / 2 + radius} ${size / 2}`}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Value arc */}
          <path
            d={`M ${size / 2 - radius} ${size / 2} A ${radius} ${radius} 0 0 1 ${size / 2 + radius} ${size / 2}`}
            fill="none"
            stroke={gaugeColor}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: 'stroke-dashoffset 1s ease-in-out',
            }}
          />
        </svg>
        {showValue && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center" style={{ marginTop: '-20px' }}>
              <div className="text-3xl font-bold" style={{ color: gaugeColor }}>
                {normalizedValue.toFixed(0)}%
              </div>
              {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
