import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CloudUpload as UploadIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { usePermission } from '../../hooks/usePermission';

interface UploadResult {
  success: boolean;
  message: string;
  stats?: {
    total: number;
    inserted: number;
    updated: number;
    failed: number;
  };
  errors?: string[];
}

export function PollingBoothUpload() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSuperAdmin = usePermission('manage_organizations');

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [dragActive, setDragActive] = useState(false);

  React.useEffect(() => {
    if (!isSuperAdmin) {
      navigate('/unauthorized');
    }
  }, [isSuperAdmin, navigate]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
        setUploadResult(null);
      } else {
        alert('Please upload a CSV file');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadResult(null);
    }
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n').filter((line) => line.trim());
    const headers = lines[0].split(',').map((h) => h.trim());

    return lines.slice(1).map((line) => {
      const values = line.split(',');
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = values[index]?.trim() || '';
      });
      return obj;
    });
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file');
      return;
    }

    setUploading(true);
    setUploadResult(null);

    try {
      // Read file content
      const text = await file.text();
      const data = parseCSV(text);

      let inserted = 0;
      let updated = 0;
      let failed = 0;
      const errors: string[] = [];

      // Process each row
      for (const row of data) {
        try {
          // Call Django API to create/update polling booth
          const response = await fetch('http://127.0.0.1:8000/api/polling-booths/bulk-upload/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            },
            body: JSON.stringify({
              booth_number: row.booth_number,
              booth_name: row.booth_name,
              constituency_code: row.constituency_code,
              constituency_name: row.constituency_name,
              district: row.district,
              address: row.address,
              total_voters: parseInt(row.total_voters) || 0,
              male_voters: parseInt(row.male_voters) || 0,
              female_voters: parseInt(row.female_voters) || 0,
              transgender_voters: parseInt(row.transgender_voters) || 0,
              latitude: parseFloat(row.latitude) || null,
              longitude: parseFloat(row.longitude) || null,
            }),
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.message || 'Failed to process booth');
          }

          if (result.created) {
            inserted++;
          } else {
            updated++;
          }
        } catch (error: any) {
          failed++;
          errors.push(`Row ${data.indexOf(row) + 2}: ${error.message}`);
        }
      }

      setUploadResult({
        success: true,
        message: 'Upload completed successfully',
        stats: {
          total: data.length,
          inserted,
          updated,
          failed,
        },
        errors: errors.slice(0, 10), // Show first 10 errors
      });
    } catch (error: any) {
      setUploadResult({
        success: false,
        message: error.message || 'Failed to upload file',
      });
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const template = `booth_number,booth_name,constituency_code,constituency_name,district,address,total_voters,male_voters,female_voters,transgender_voters,latitude,longitude
1,Primary School ABC,TN001,Chennai Central,Chennai,"123 Main Street, Chennai",1250,625,620,5,13.0827,80.2707
2,Community Hall XYZ,TN001,Chennai Central,Chennai,"456 Second Street, Chennai",980,490,488,2,13.0878,80.2785`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'polling_booth_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 -mx-8 -mt-6 mb-8">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <UploadIcon className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Polling Booth Data Upload</h1>
                <p className="text-sm text-gray-500">Upload CSV file with polling booth information</p>
              </div>
            </div>
            <button
              onClick={downloadTemplate}
              className="flex items-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
            >
              <DownloadIcon className="w-5 h-5 mr-2" />
              Download Template
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl">
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <div className="flex items-start">
            <InfoIcon className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">CSV File Requirements</h3>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>CSV file must contain the following columns: booth_number, booth_name, constituency_code, constituency_name, district, address, total_voters, male_voters, female_voters, transgender_voters, latitude, longitude</li>
                <li>booth_number and constituency_code together must be unique</li>
                <li>Voter counts should be numbers</li>
                <li>Latitude and longitude are optional but recommended</li>
                <li>If a booth already exists, it will be updated</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <UploadIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              {file ? file.name : 'Drop your CSV file here'}
            </p>
            <p className="text-sm text-gray-500 mb-4">or</p>
            <label className="inline-block">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <span className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
                Browse Files
              </span>
            </label>
            {file && (
              <button
                onClick={() => {
                  setFile(null);
                  setUploadResult(null);
                }}
                className="ml-3 px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50"
              >
                <DeleteIcon className="w-5 h-5 inline mr-1" />
                Remove
              </button>
            )}
          </div>

          {file && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {uploading ? 'Uploading...' : 'Upload and Process'}
              </button>
            </div>
          )}
        </div>

        {/* Upload Result */}
        {uploadResult && (
          <div
            className={`rounded-lg border p-6 ${
              uploadResult.success
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex items-start">
              {uploadResult.success ? (
                <SuccessIcon className="w-6 h-6 text-green-600 mr-3 flex-shrink-0" />
              ) : (
                <ErrorIcon className="w-6 h-6 text-red-600 mr-3 flex-shrink-0" />
              )}
              <div className="flex-1">
                <h3
                  className={`text-lg font-semibold mb-2 ${
                    uploadResult.success ? 'text-green-900' : 'text-red-900'
                  }`}
                >
                  {uploadResult.message}
                </h3>

                {uploadResult.stats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-sm text-gray-600">Total Rows</p>
                      <p className="text-2xl font-bold text-gray-900">{uploadResult.stats.total}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-sm text-gray-600">Inserted</p>
                      <p className="text-2xl font-bold text-green-600">{uploadResult.stats.inserted}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-sm text-gray-600">Updated</p>
                      <p className="text-2xl font-bold text-blue-600">{uploadResult.stats.updated}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-sm text-gray-600">Failed</p>
                      <p className="text-2xl font-bold text-red-600">{uploadResult.stats.failed}</p>
                    </div>
                  </div>
                )}

                {uploadResult.errors && uploadResult.errors.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-red-900 mb-2">Errors:</p>
                    <div className="bg-white rounded-lg p-3 max-h-48 overflow-y-auto">
                      <ul className="text-sm text-red-800 space-y-1">
                        {uploadResult.errors.map((error, index) => (
                          <li key={index} className="break-words">
                            {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PollingBoothUpload;
