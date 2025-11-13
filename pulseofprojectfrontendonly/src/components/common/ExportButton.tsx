/**
 * Export Button Component
 * Dropdown menu for exporting data in various formats
 */

import React, { useState, useRef, useEffect } from 'react';
import { Download, FileSpreadsheet, FileText, Image } from 'lucide-react';
import { exportToCSV, exportToExcel, exportToPNG } from '../../utils/exportUtils';

interface ExportButtonProps {
  data?: any[];
  filename: string;
  chartElementId?: string;
  formats?: ('csv' | 'excel' | 'png')[];
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  data,
  filename,
  chartElementId,
  formats = ['csv', 'excel'],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = async (format: 'csv' | 'excel' | 'png') => {
    setIsOpen(false);

    try {
      if (format === 'csv' && data) {
        exportToCSV(data, `${filename}.csv`);
      } else if (format === 'excel' && data) {
        exportToExcel(data, filename);
      } else if (format === 'png' && chartElementId) {
        await exportToPNG(chartElementId, filename);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export. Please try again.');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Download className="h-4 w-4 mr-2" />
        Export
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          {formats.includes('csv') && data && (
            <button
              onClick={() => handleExport('csv')}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <FileText className="h-4 w-4 mr-3 text-gray-400" />
              Export as CSV
            </button>
          )}
          {formats.includes('excel') && data && (
            <button
              onClick={() => handleExport('excel')}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <FileSpreadsheet className="h-4 w-4 mr-3 text-gray-400" />
              Export as Excel
            </button>
          )}
          {formats.includes('png') && chartElementId && (
            <button
              onClick={() => handleExport('png')}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Image className="h-4 w-4 mr-3 text-gray-400" />
              Export as PNG
            </button>
          )}
        </div>
      )}
    </div>
  );
};
