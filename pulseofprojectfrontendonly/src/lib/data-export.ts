/**
 * Data Export System
 * Export data in CSV, Excel, JSON, and PDF formats
 */

export type ExportFormat = 'csv' | 'excel' | 'json' | 'pdf';

export interface ExportConfig {
  format: ExportFormat;
  filename?: string;
  includeHeaders?: boolean;
  dateFormat?: string;
  timezone?: string;
}

export interface ExportJob {
  id: string;
  tenantId: string;
  userId: string;
  type: string;
  format: ExportFormat;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  totalRecords: number;
  processedRecords: number;
  fileUrl?: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

/**
 * Export data to CSV
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  config: ExportConfig = { format: 'csv' }
): string {
  if (data.length === 0) {
    return '';
  }

  const headers = Object.keys(data[0]);
  const csvRows: string[] = [];

  // Add headers
  if (config.includeHeaders !== false) {
    csvRows.push(headers.map(escapeCSVValue).join(','));
  }

  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      return escapeCSVValue(formatValue(value, config));
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}

/**
 * Export data to Excel (XLSX)
 */
export async function exportToExcel<T extends Record<string, any>>(
  data: T[],
  config: ExportConfig = { format: 'excel' }
): Promise<Blob> {
  // In production, use a library like xlsx or exceljs
  // For now, create CSV and rename to .xlsx (basic Excel compatibility)
  const csvContent = exportToCSV(data, config);
  return new Blob([csvContent], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

/**
 * Export data to JSON
 */
export function exportToJSON<T extends Record<string, any>>(
  data: T[],
  config: ExportConfig = { format: 'json' }
): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Export data to PDF
 */
export async function exportToPDF<T extends Record<string, any>>(
  data: T[],
  config: ExportConfig & { title?: string; orientation?: 'portrait' | 'landscape' } = { format: 'pdf' }
): Promise<Blob> {
  // In production, use a library like jsPDF or pdfmake
  // For now, create a simple HTML representation
  const html = generatePDFHTML(data, config);
  return new Blob([html], { type: 'application/pdf' });
}

/**
 * Generate HTML for PDF
 */
function generatePDFHTML<T extends Record<string, any>>(
  data: T[],
  config: { title?: string; orientation?: 'portrait' | 'landscape' }
): string {
  const headers = data.length > 0 ? Object.keys(data[0]) : [];

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${config.title || 'Export'}</title>
      <style>
        @page { size: ${config.orientation || 'portrait'}; margin: 20mm; }
        body { font-family: Arial, sans-serif; font-size: 12px; }
        h1 { text-align: center; color: #333; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background-color: #3b82f6; color: white; padding: 8px; text-align: left; }
        td { border: 1px solid #ddd; padding: 6px; }
        tr:nth-child(even) { background-color: #f9fafb; }
      </style>
    </head>
    <body>
      <h1>${config.title || 'Data Export'}</h1>
      <table>
        <thead>
          <tr>
            ${headers.map(h => `<th>${h}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.map(row => `
            <tr>
              ${headers.map(h => `<td>${row[h] || ''}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
      <p style="margin-top: 20px; text-align: center; color: #666; font-size: 10px;">
        Generated on ${new Date().toLocaleString()}
      </p>
    </body>
    </html>
  `;
}

/**
 * Download exported file
 */
export function downloadFile(content: string | Blob, filename: string, mimeType: string): void {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export data with automatic format detection
 */
export async function exportData<T extends Record<string, any>>(
  data: T[],
  config: ExportConfig
): Promise<void> {
  const timestamp = new Date().toISOString().split('T')[0];
  const baseFilename = config.filename || `export-${timestamp}`;

  let content: string | Blob;
  let filename: string;
  let mimeType: string;

  switch (config.format) {
    case 'csv':
      content = exportToCSV(data, config);
      filename = `${baseFilename}.csv`;
      mimeType = 'text/csv;charset=utf-8;';
      break;

    case 'excel':
      content = await exportToExcel(data, config);
      filename = `${baseFilename}.xlsx`;
      mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      break;

    case 'json':
      content = exportToJSON(data, config);
      filename = `${baseFilename}.json`;
      mimeType = 'application/json;charset=utf-8;';
      break;

    case 'pdf':
      content = await exportToPDF(data, config);
      filename = `${baseFilename}.pdf`;
      mimeType = 'application/pdf';
      break;

    default:
      throw new Error(`Unsupported export format: ${config.format}`);
  }

  downloadFile(content, filename, mimeType);
}

/**
 * Create export job for large datasets (background processing)
 */
export async function createExportJob(
  tenantId: string,
  userId: string,
  type: string,
  format: ExportFormat,
  filters?: Record<string, any>
): Promise<ExportJob> {
  const job: ExportJob = {
    id: `export_${Date.now()}`,
    tenantId,
    userId,
    type,
    format,
    status: 'pending',
    progress: 0,
    totalRecords: 0,
    processedRecords: 0,
    createdAt: new Date().toISOString(),
  };

  // In production, submit to job queue (Redis, BullMQ, etc.)
  // For now, simulate immediate processing
  console.log('Export job created:', job);

  return job;
}

/**
 * Get export job status
 */
export async function getExportJobStatus(jobId: string): Promise<ExportJob | null> {
  // In production, query job queue or database
  return null;
}

/**
 * Cancel export job
 */
export async function cancelExportJob(jobId: string): Promise<boolean> {
  // In production, cancel job in queue
  console.log('Cancelling export job:', jobId);
  return true;
}

// Helper functions

function escapeCSVValue(value: string): string {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);

  // Escape quotes and wrap in quotes if needed
  if (
    stringValue.includes(',') ||
    stringValue.includes('"') ||
    stringValue.includes('\n') ||
    stringValue.includes('\r')
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

function formatValue(value: any, config: ExportConfig): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (value instanceof Date) {
    return config.dateFormat
      ? formatDate(value, config.dateFormat)
      : value.toISOString();
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
}

function formatDate(date: Date, format: string): string {
  // Simple date formatting (use date-fns or dayjs in production)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * Batch export with chunking (for large datasets)
 */
export async function batchExport<T extends Record<string, any>>(
  getData: (offset: number, limit: number) => Promise<T[]>,
  totalRecords: number,
  config: ExportConfig,
  onProgress?: (progress: number) => void
): Promise<void> {
  const chunkSize = 1000;
  const chunks: T[][] = [];

  for (let offset = 0; offset < totalRecords; offset += chunkSize) {
    const chunk = await getData(offset, chunkSize);
    chunks.push(chunk);

    if (onProgress) {
      const progress = Math.min(((offset + chunk.length) / totalRecords) * 100, 100);
      onProgress(progress);
    }
  }

  const allData = chunks.flat();
  await exportData(allData, config);
}

/**
 * Export with custom formatting
 */
export interface ExportColumn<T> {
  key: keyof T;
  label: string;
  format?: (value: any) => string;
}

export async function exportWithColumns<T extends Record<string, any>>(
  data: T[],
  columns: ExportColumn<T>[],
  config: ExportConfig
): Promise<void> {
  const formatted = data.map(row => {
    const newRow: Record<string, any> = {};
    for (const col of columns) {
      const value = row[col.key];
      newRow[col.label] = col.format ? col.format(value) : value;
    }
    return newRow;
  });

  await exportData(formatted, config);
}

export default {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  exportData,
  downloadFile,
  createExportJob,
  getExportJobStatus,
  cancelExportJob,
  batchExport,
  exportWithColumns,
};
