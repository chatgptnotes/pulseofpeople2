import React, { useState, useEffect } from 'react';
import {
  Download as DownloadIcon,
  CloudDownload as CloudDownloadIcon,
  FilterList as FilterIcon,
  ViewColumn as ColumnIcon,
  History as HistoryIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Schedule as PendingIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useTenant } from '../contexts/TenantContext';
import {
  exportData,
  batchExport,
  exportWithColumns,
  ExportFormat,
  ExportConfig,
  ExportColumn,
  ExportJob,
  getExportJobStatus,
  cancelExportJob,
} from '../lib/data-export';

interface DataSource {
  id: string;
  name: string;
  label: string;
  columns: string[];
  estimatedRows: number;
}

const DATA_SOURCES: DataSource[] = [
  {
    id: 'voters',
    name: 'voters',
    label: 'Voter Database',
    columns: ['id', 'name', 'phone', 'email', 'address', 'booth_no', 'created_at'],
    estimatedRows: 10000,
  },
  {
    id: 'campaigns',
    name: 'campaigns',
    label: 'Campaign Data',
    columns: ['id', 'name', 'start_date', 'end_date', 'status', 'budget', 'reach'],
    estimatedRows: 50,
  },
  {
    id: 'activities',
    name: 'activities',
    label: 'Activity Logs',
    columns: ['id', 'type', 'description', 'user_id', 'created_at'],
    estimatedRows: 50000,
  },
  {
    id: 'analytics',
    name: 'analytics',
    label: 'Analytics Data',
    columns: ['id', 'metric', 'value', 'date', 'category'],
    estimatedRows: 25000,
  },
];

export function DataExportManager() {
  const { supabase, user } = useAuth();
  const { currentTenant } = useTenant();
  const [showDialog, setShowDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');

  // Export configuration
  const [selectedSource, setSelectedSource] = useState<DataSource>(DATA_SOURCES[0]);
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [filename, setFilename] = useState('');
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);

  // Date filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Export state
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [exportHistory, setExportHistory] = useState<ExportJob[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedSource) {
      setSelectedColumns(selectedSource.columns);
    }
  }, [selectedSource]);

  useEffect(() => {
    if (showDialog && activeTab === 'history') {
      loadExportHistory();
    }
  }, [showDialog, activeTab]);

  async function loadExportHistory() {
    if (!currentTenant) return;

    try {
      const { data, error } = await supabase
        .from('export_jobs')
        .select('*')
        .eq('tenant_id', currentTenant.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setExportHistory(data || []);
    } catch (err) {
      console.error('Failed to load export history:', err);
    }
  }

  async function fetchData(offset: number, limit: number): Promise<any[]> {
    if (!currentTenant) return [];

    let query = supabase
      .from(selectedSource.name)
      .select(selectedColumns.join(','))
      .eq('tenant_id', currentTenant.id);

    // Apply date filters
    if (startDate && selectedSource.columns.includes('created_at')) {
      query = query.gte('created_at', startDate);
    }
    if (endDate && selectedSource.columns.includes('created_at')) {
      query = query.lte('created_at', endDate);
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  }

  async function handleExport() {
    if (!currentTenant) return;

    try {
      setExporting(true);
      setProgress(0);
      setError(null);

      const config: ExportConfig = {
        format,
        filename: filename || `${selectedSource.label}-${new Date().toISOString().split('T')[0]}`,
        includeHeaders,
        dateFormat: 'YYYY-MM-DD HH:mm:ss',
      };

      // For large datasets, use batch export
      if (selectedSource.estimatedRows > 5000) {
        await batchExport(
          fetchData,
          selectedSource.estimatedRows,
          config,
          (prog) => setProgress(Math.round(prog))
        );
      } else {
        // For smaller datasets, fetch all at once
        const data = await fetchData(0, selectedSource.estimatedRows);

        // Create custom columns with labels
        const columns: ExportColumn<any>[] = selectedColumns.map((col) => ({
          key: col,
          label: col.charAt(0).toUpperCase() + col.slice(1).replace(/_/g, ' '),
          format: (value: any) => {
            if (value instanceof Date) {
              return value.toLocaleString();
            }
            if (typeof value === 'object') {
              return JSON.stringify(value);
            }
            return String(value || '');
          },
        }));

        await exportWithColumns(data, columns, config);
        setProgress(100);
      }

      // Save export job to history
      await supabase.from('export_jobs').insert({
        tenant_id: currentTenant.id,
        user_id: user?.id,
        type: selectedSource.name,
        format,
        status: 'completed',
        progress: 100,
        total_records: selectedSource.estimatedRows,
        processed_records: selectedSource.estimatedRows,
        completed_at: new Date().toISOString(),
      });

      // Success - reload history
      await loadExportHistory();
      setActiveTab('history');
    } catch (err) {
      console.error('Export failed:', err);
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExporting(false);
    }
  }

  function toggleColumn(column: string) {
    setSelectedColumns((prev) =>
      prev.includes(column)
        ? prev.filter((c) => c !== column)
        : [...prev, column]
    );
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'completed':
        return <SuccessIcon className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <ErrorIcon className="w-5 h-5 text-red-500" />;
      default:
        return <PendingIcon className="w-5 h-5 text-yellow-500" />;
    }
  }

  function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setShowDialog(true)}
        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <DownloadIcon className="w-5 h-5 mr-2" />
        Export Data
      </button>

      {/* Export Dialog */}
      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <CloudDownloadIcon className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Data Export Manager</h2>
              </div>
              <button
                onClick={() => setShowDialog(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <CloseIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('new')}
                className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                  activeTab === 'new'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                New Export
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                  activeTab === 'history'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <HistoryIcon className="w-5 h-5 inline mr-2" />
                Export History
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {activeTab === 'new' ? (
                <div className="space-y-6">
                  {/* Data Source Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data Source
                    </label>
                    <select
                      value={selectedSource.id}
                      onChange={(e) =>
                        setSelectedSource(
                          DATA_SOURCES.find((s) => s.id === e.target.value) || DATA_SOURCES[0]
                        )
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={exporting}
                    >
                      {DATA_SOURCES.map((source) => (
                        <option key={source.id} value={source.id}>
                          {source.label} ({source.estimatedRows.toLocaleString()} rows)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Format Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Export Format
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                      {(['csv', 'excel', 'json', 'pdf'] as ExportFormat[]).map((fmt) => (
                        <button
                          key={fmt}
                          onClick={() => setFormat(fmt)}
                          disabled={exporting}
                          className={`px-4 py-3 rounded-lg border-2 font-medium transition-colors ${
                            format === fmt
                              ? 'border-blue-600 bg-blue-50 text-blue-700'
                              : 'border-gray-200 text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {fmt.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Filename */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Filename (optional)
                    </label>
                    <input
                      type="text"
                      value={filename}
                      onChange={(e) => setFilename(e.target.value)}
                      placeholder={`${selectedSource.label}-${new Date().toISOString().split('T')[0]}`}
                      disabled={exporting}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Date Range Filters */}
                  {selectedSource.columns.includes('created_at') && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          disabled={exporting}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          disabled={exporting}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}

                  {/* Column Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <ColumnIcon className="w-4 h-4 inline mr-1" />
                      Select Columns
                    </label>
                    <div className="border border-gray-200 rounded-lg p-4 max-h-48 overflow-y-auto">
                      <div className="grid grid-cols-2 gap-3">
                        {selectedSource.columns.map((column) => (
                          <label key={column} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedColumns.includes(column)}
                              onChange={() => toggleColumn(column)}
                              disabled={exporting}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              {column.charAt(0).toUpperCase() + column.slice(1).replace(/_/g, ' ')}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Options */}
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={includeHeaders}
                        onChange={(e) => setIncludeHeaders(e.target.checked)}
                        disabled={exporting}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Include column headers</span>
                    </label>
                  </div>

                  {/* Progress Bar */}
                  {exporting && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-700">Exporting...</span>
                        <span className="text-sm font-medium text-blue-700">{progress}%</span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <ErrorIcon className="w-5 h-5 text-red-500 mt-0.5 mr-3" />
                        <div>
                          <h4 className="text-sm font-medium text-red-800">Export Failed</h4>
                          <p className="text-sm text-red-700 mt-1">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Export History */
                <div>
                  {exportHistory.length === 0 ? (
                    <div className="text-center py-12">
                      <HistoryIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No export history yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {exportHistory.map((job) => (
                        <div
                          key={job.id}
                          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start flex-1">
                              <div className="mt-1">{getStatusIcon(job.status)}</div>
                              <div className="ml-3 flex-1">
                                <div className="flex items-center">
                                  <h4 className="text-sm font-medium text-gray-900">
                                    {job.type.charAt(0).toUpperCase() + job.type.slice(1)} Export
                                  </h4>
                                  <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                                    {job.format.toUpperCase()}
                                  </span>
                                </div>
                                <div className="mt-1 text-sm text-gray-500">
                                  {job.totalRecords.toLocaleString()} records •{' '}
                                  {new Date(job.createdAt).toLocaleString()}
                                </div>
                                {job.status === 'completed' && job.fileUrl && (
                                  <a
                                    href={job.fileUrl}
                                    download
                                    className="inline-flex items-center mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                                  >
                                    <DownloadIcon className="w-4 h-4 mr-1" />
                                    Download
                                  </a>
                                )}
                              </div>
                            </div>
                            {job.status === 'processing' && (
                              <button
                                onClick={() => cancelExportJob(job.id)}
                                className="ml-4 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {activeTab === 'new' && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="text-sm text-gray-500">
                  {selectedColumns.length} columns selected
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowDialog(false)}
                    disabled={exporting}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleExport}
                    disabled={exporting || selectedColumns.length === 0}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {exporting ? 'Exporting...' : 'Export Data'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default DataExportManager;
