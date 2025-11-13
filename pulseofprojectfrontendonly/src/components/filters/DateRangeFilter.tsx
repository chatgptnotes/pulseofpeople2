/**
 * Date Range Filter Component
 * Reusable date range picker with presets
 */

import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';

interface DateRangeFilterProps {
  onDateChange: (startDate: Date | null, endDate: Date | null) => void;
  defaultPreset?: string;
}

const presets = [
  { label: 'Last 7 days', value: '7d', getDates: () => [subDays(new Date(), 7), new Date()] },
  { label: 'Last 30 days', value: '30d', getDates: () => [subDays(new Date(), 30), new Date()] },
  { label: 'This month', value: 'month', getDates: () => [startOfMonth(new Date()), endOfMonth(new Date())] },
  { label: 'Last month', value: 'lastMonth', getDates: () => [startOfMonth(subMonths(new Date(), 1)), endOfMonth(subMonths(new Date(), 1))] },
  { label: 'Last 90 days', value: '90d', getDates: () => [subDays(new Date(), 90), new Date()] },
  { label: 'Custom', value: 'custom', getDates: () => [null, null] },
];

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  onDateChange,
  defaultPreset = '30d',
}) => {
  const [selectedPreset, setSelectedPreset] = useState(defaultPreset);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const handlePresetChange = (presetValue: string) => {
    setSelectedPreset(presetValue);
    const preset = presets.find((p) => p.value === presetValue);
    if (preset && presetValue !== 'custom') {
      const [start, end] = preset.getDates();
      if (start && end) {
        onDateChange(start, end);
        setStartDate(format(start, 'yyyy-MM-dd'));
        setEndDate(format(end, 'yyyy-MM-dd'));
      }
    }
  };

  const handleCustomDateChange = () => {
    if (startDate && endDate) {
      onDateChange(new Date(startDate), new Date(endDate));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center mb-3">
        <Calendar className="h-5 w-5 text-gray-400 mr-2" />
        <h3 className="text-sm font-semibold text-gray-900">Date Range</h3>
      </div>

      {/* Preset Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {presets.map((preset) => (
          <button
            key={preset.value}
            onClick={() => handlePresetChange(preset.value)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              selectedPreset === preset.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Custom Date Inputs */}
      {selectedPreset === 'custom' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              onBlur={handleCustomDateChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              onBlur={handleCustomDateChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};
