import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle, Download, X as XIcon } from 'lucide-react';
import { djangoApi } from '../services/djangoApi';

interface BulkImportProgressProps {
  jobId: string;
  onClose: () => void;
  onComplete: () => void;
}

interface JobStatus {
  job_id: string;
  status: string;
  file_name: string;
  total_rows: number;
  processed_rows: number;
  success_count: number;
  failed_count: number;
  progress_percentage: number;
  validation_errors: string[];
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export default function BulkImportProgress({ jobId, onClose, onComplete }: BulkImportProgressProps) {
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [error, setError] = useState<string>('');
  const [isPolling, setIsPolling] = useState(true);

  // Poll for job status
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const fetchStatus = async () => {
      try {
        const status = await djangoApi.getBulkUploadStatus(jobId);
        setJobStatus(status);

        // Stop polling if job is completed, failed, or cancelled
        if (['completed', 'failed', 'cancelled'].includes(status.status)) {
          setIsPolling(false);
          if (status.status === 'completed') {
            onComplete();
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch job status');
        setIsPolling(false);
      }
    };

    // Initial fetch
    fetchStatus();

    // Poll every 2 seconds if still processing
    if (isPolling) {
      intervalId = setInterval(fetchStatus, 2000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [jobId, isPolling, onComplete]);

  const handleDownloadErrors = async () => {
    try {
      const blob = await djangoApi.downloadBulkErrors(jobId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bulk_upload_errors_${jobId}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || 'Failed to download error report');
    }
  };

  const getStatusIcon = () => {
    if (!jobStatus) return <Clock className="h-8 w-8 text-gray-400 animate-spin" />;

    switch (jobStatus.status) {
      case 'completed':
        return <CheckCircle className="h-8 w-8 text-green-600" />;
      case 'failed':
        return <XCircle className="h-8 w-8 text-red-600" />;
      case 'cancelled':
        return <XIcon className="h-8 w-8 text-gray-600" />;
      case 'pending':
      case 'validating':
      case 'processing':
        return <Clock className="h-8 w-8 text-blue-600 animate-spin" />;
      default:
        return <AlertCircle className="h-8 w-8 text-yellow-600" />;
    }
  };

  const getStatusColor = () => {
    if (!jobStatus) return 'gray';

    switch (jobStatus.status) {
      case 'completed':
        return 'green';
      case 'failed':
        return 'red';
      case 'cancelled':
        return 'gray';
      default:
        return 'blue';
    }
  };

  const getStatusText = () => {
    if (!jobStatus) return 'Loading...';

    switch (jobStatus.status) {
      case 'pending':
        return 'Pending...';
      case 'validating':
        return 'Validating CSV...';
      case 'processing':
        return 'Creating users...';
      case 'completed':
        return 'Completed!';
      case 'failed':
        return 'Failed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return jobStatus.status;
    }
  };

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full">
          <div className="text-center">
            <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={onClose}
              className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
        <div className="text-center mb-6">
          {getStatusIcon()}
          <h2 className="text-2xl font-bold text-gray-900 mt-4 mb-2">
            Bulk User Import {getStatusText()}
          </h2>
          {jobStatus && (
            <p className="text-gray-600">
              File: {jobStatus.file_name}
            </p>
          )}
        </div>

        {jobStatus && (
          <>
            {/* Progress Bar */}
            {['pending', 'validating', 'processing'].includes(jobStatus.status) && (
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{jobStatus.progress_percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`bg-${getStatusColor()}-600 h-3 rounded-full transition-all duration-300`}
                    style={{ width: `${jobStatus.progress_percentage}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2 text-center">
                  {jobStatus.processed_rows} of {jobStatus.total_rows} rows processed
                </p>
              </div>
            )}

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{jobStatus.total_rows}</p>
                <p className="text-sm text-gray-600">Total Rows</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{jobStatus.success_count}</p>
                <p className="text-sm text-gray-600">Success</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-red-600">{jobStatus.failed_count}</p>
                <p className="text-sm text-gray-600">Failed</p>
              </div>
            </div>

            {/* Validation Errors */}
            {jobStatus.validation_errors && jobStatus.validation_errors.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-yellow-900 mb-2">Validation Errors:</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {jobStatus.validation_errors.map((error, idx) => (
                    <li key={idx}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Download Error Report */}
            {jobStatus.failed_count > 0 && ['completed', 'failed'].includes(jobStatus.status) && (
              <button
                onClick={handleDownloadErrors}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mb-4"
              >
                <Download className="h-5 w-5" />
                Download Error Report
              </button>
            )}

            {/* Status Messages */}
            {jobStatus.status === 'completed' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-700 text-center">
                  {jobStatus.success_count > 0 && `${jobStatus.success_count} user(s) created successfully. `}
                  {jobStatus.failed_count > 0 && `${jobStatus.failed_count} user(s) failed.`}
                  {jobStatus.success_count > 0 && ' Welcome emails have been sent to all new users.'}
                </p>
              </div>
            )}

            {jobStatus.status === 'failed' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-700 text-center">
                  The bulk upload job failed. Please check the error report for details.
                </p>
              </div>
            )}
          </>
        )}

        {/* Close Button */}
        {jobStatus && ['completed', 'failed', 'cancelled'].includes(jobStatus.status) && (
          <button
            onClick={onClose}
            className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
}
