import React, { useState } from 'react';
import { X, Download, AlertCircle } from 'lucide-react';
import FileUpload from './FileUpload';
import BulkImportProgress from './BulkImportProgress';
import { djangoApi } from '../services/djangoApi';

interface BulkUserImportProps {
  onClose: () => void;
  onComplete: () => void;
}

export default function BulkUserImport({ onClose, onComplete }: BulkUserImportProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');
  const [jobId, setJobId] = useState<string | null>(null);

  const handleDownloadTemplate = async () => {
    try {
      const blob = await djangoApi.downloadUserTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'bulk_user_upload_template.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      setUploadError(error.message || 'Failed to download template');
    }
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setUploadError('');
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file first');
      return;
    }

    try {
      setIsUploading(true);
      setUploadError('');

      const response = await djangoApi.uploadBulkUsers(selectedFile);
      setJobId(response.job_id);
    } catch (error: any) {
      setUploadError(error.message || 'Failed to upload file');
      setIsUploading(false);
    }
  };

  const handleProgressClose = () => {
    setJobId(null);
    setSelectedFile(null);
    setIsUploading(false);
    onClose();
  };

  const handleProgressComplete = () => {
    onComplete();
  };

  // Show progress modal if job started
  if (jobId) {
    return (
      <BulkImportProgress
        jobId={jobId}
        onClose={handleProgressClose}
        onComplete={handleProgressComplete}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Bulk Upload Users (CSV)</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isUploading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">CSV Format Required:</h3>
          <div className="bg-white rounded border border-blue-200 p-3 mb-3 overflow-x-auto">
            <pre className="text-xs font-mono">
name,email,role,phone,city,constituency{'\n'}
John Doe,john@example.com,user,+91 9876543210,Chennai,Chennai Central{'\n'}
Jane Smith,jane@example.com,analyst,+91 9876543211,Mumbai,Andheri West{'\n'}
Bob Johnson,bob@example.com,manager,+91 9876543212,Delhi,New Delhi
            </pre>
          </div>
          <div className="space-y-2 text-sm text-blue-700">
            <p><strong>Required columns:</strong> name, email, role, city, constituency</p>
            <p><strong>Optional columns:</strong> phone</p>
            <p><strong>Valid roles:</strong> admin, manager, analyst, user, volunteer, viewer</p>
            <p className="text-blue-600 italic">
              Password will be auto-generated and sent to users via email
            </p>
          </div>
        </div>

        {/* Download Template Button */}
        <button
          onClick={handleDownloadTemplate}
          className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors mb-6"
          disabled={isUploading}
        >
          <Download className="h-5 w-5" />
          Download CSV Template
        </button>

        {/* File Upload */}
        <div className="mb-6">
          <FileUpload
            onFileSelect={handleFileSelect}
            accept=".csv"
            maxSize={5 * 1024 * 1024}
            disabled={isUploading}
          />
        </div>

        {/* Error Message */}
        {uploadError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-700 font-medium">Error</p>
              <p className="text-red-600 text-sm">{uploadError}</p>
            </div>
          </div>
        )}

        {/* Important Notes */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-yellow-900 mb-2">Important Notes:</h3>
          <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
            <li>Maximum 10,000 users per upload</li>
            <li>Duplicate emails will be rejected</li>
            <li>You can only create users with roles below your own</li>
            <li>Invalid rows will be skipped and reported in error CSV</li>
            <li>Processing happens in background - you'll receive an email when done</li>
            <li>All new users will be forced to change password on first login</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Uploading...' : 'Start Upload'}
          </button>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
