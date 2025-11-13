/**
 * Line Chart Component
 * Reusable line chart using recharts with responsive design
 */

import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface LineChartProps {
  data: any[];
  xKey: string;
  yKey: string | string[];
  title?: string;
  color?: string | string[];
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  formatYAxis?: (value: any) => string;
  formatXAxis?: (value: any) => string;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  xKey,
  yKey,
  title,
  color = '#3b82f6',
  height = 300,
  showLegend = true,
  showGrid = true,
  formatYAxis,
  formatXAxis,
}) => {
  const colors = Array.isArray(color) ? color : [color];
  const yKeys = Array.isArray(yKey) ? yKey : [yKey];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              dot={{ fill: colors[index % colors.length], r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};
