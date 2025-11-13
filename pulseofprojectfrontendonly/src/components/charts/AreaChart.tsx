/**
 * Area Chart Component
 * Reusable area chart for trend visualization
 */

import React from 'react';
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface AreaChartProps {
  data: any[];
  xKey: string;
  yKey: string | string[];
  title?: string;
  color?: string | string[];
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  stacked?: boolean;
  formatYAxis?: (value: any) => string;
  formatXAxis?: (value: any) => string;
}

export const AreaChart: React.FC<AreaChartProps> = ({
  data,
  xKey,
  yKey,
  title,
  color = '#3b82f6',
  height = 300,
  showLegend = true,
  showGrid = true,
  stacked = false,
  formatYAxis,
  formatXAxis,
}) => {
  const colors = Array.isArray(color) ? color : [color];
  const yKeys = Array.isArray(yKey) ? yKey : [yKey];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsAreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            {yKeys.map((key, index) => (
              <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors[index % colors.length]} stopOpacity={0.8} />
                <stop offset="95%" stopColor={colors[index % colors.length]} stopOpacity={0.1} />
              </linearGradient>
            ))}
          </defs>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
          <XAxis
            dataKey={xKey}
            stroke="#6b7280"
            tickFormatter={formatXAxis}
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#6b7280"
            tickFormatter={formatYAxis}
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          {showLegend && <Legend />}
          {yKeys.map((key, index) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              fill={`url(#gradient-${key})`}
              stackId={stacked ? '1' : undefined}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
};
