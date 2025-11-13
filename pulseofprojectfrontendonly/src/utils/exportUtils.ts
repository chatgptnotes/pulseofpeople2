/**
 * Export Utilities
 * Functions for exporting data to CSV, Excel, and charts to PNG
 */

import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';

/**
 * Export data to CSV
 */
export const exportToCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      headers.map((header) => {
        const value = row[header];
        // Handle values with commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    ),
  ].join('\n');

  downloadFile(csvContent, filename, 'text/csv');
};

/**
 * Export data to Excel
 */
export const exportToExcel = (data: any[], filename: string, sheetName = 'Sheet1') => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

/**
 * Export chart/element to PNG
 */
export const exportToPNG = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    alert('Element not found');
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2, // Higher quality
    });

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.png`;
        link.click();
        URL.revokeObjectURL(url);
      }
    });
  } catch (error) {
    console.error('Error exporting to PNG:', error);
    alert('Failed to export image');
  }
};

/**
 * Helper function to download file
 */
const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

/**
 * Format data for export (convert objects to flat structure)
 */
export const flattenForExport = (data: any[]): any[] => {
  return data.map((item) => {
    const flattened: any = {};
    Object.keys(item).forEach((key) => {
      if (typeof item[key] === 'object' && item[key] !== null && !Array.isArray(item[key])) {
        // Flatten nested objects
        Object.keys(item[key]).forEach((nestedKey) => {
          flattened[`${key}_${nestedKey}`] = item[key][nestedKey];
        });
      } else if (Array.isArray(item[key])) {
        // Convert arrays to comma-separated strings
        flattened[key] = item[key].join(', ');
      } else {
        flattened[key] = item[key];
      }
    });
    return flattened;
  });
};
