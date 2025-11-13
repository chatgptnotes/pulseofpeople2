/**
 * Bar Chart Component
 * Reusable bar chart with horizontal/vertical options
 */

import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface BarChartProps {
  data: any[];
  xKey: string;
  yKey: string | string[];
  title?: string;
  color?: string | string[];
  height?: number;
  horizontal?: boolean;
  showLegend?: boolean;
  showGrid?: boolean;
  colorByValue?: boolean;
  formatYAxis?: (value: any) => string;
  formatXAxis?: (value: any) => string;
}

const getColorByValue = (value: number): string => {
  if (value >= 70) return '#10b981'; // green
  if (value >= 50) return '#f59e0b'; // yellow
  if (value >= 30) return '#f97316'; // orange
  return '#ef4444'; // red
};

export const BarChart: React.FC<BarChartProps> = ({
  data,
  xKey,
  yKey,
  title,
  color = '#3b82f6',
  height = 300,
  horizontal = false,
  showLegend = false,
  showGrid = true,
  colorByValue = false,
  formatYAxis,
  formatXAxis,
}) => {
  const colors = Array.isArray(color) ? color : [color];
  const yKeys = Array.isArray(yKey) ? yKey : [yKey];

  const ChartComponent = RechartsBarChart;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <ChartComponent
          data={data}
          layout={horizontal ? 'vertical' : 'horizontal'}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
          {horizontal ? (
            <>
              <XAxis type="number" stroke="#6b7280" tickFormatter={formatXAxis} style={{ fontSize: '12px' }} />
              <YAxis dataKey={xKey} type="category" stroke="#6b7280" tickFormatter={formatYAxis} style={{ fontSize: '12px' }} />
            </>
          ) : (
            <>
              <XAxis dataKey={xKey} stroke="#6b7280" tickFormatter={formatXAxis} style={{ fontSize: '12px' }} />
              <YAxis stroke="#6b7280" tickFormatter={formatYAxis} style={{ fontSize: '12px' }} />
            </>
          )}
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
            <Bar
              key={key}
              dataKey={key}
              fill={colors[index % colors.length]}
              radius={[4, 4, 0, 0]}
            >
              {colorByValue && data.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={getColorByValue(entry[key])} />
              ))}
            </Bar>
          ))}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
};
