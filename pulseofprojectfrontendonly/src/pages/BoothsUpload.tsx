import React, { useState } from 'react';
import { CloudUpload, CheckCircle, Error, TableChart, Visibility, Close, LocationOn } from '@mui/icons-material';
import * as XLSX from 'xlsx';

interface ColumnMapping {
  fileColumn: string;
  targetColumn: string;
}

interface ValidationError {
  row: number;
  column: string;
  value: string;
  message: string;
}

interface UploadState {
  file: File | null;
  data: any[];
  headers: string[];
  columnMappings: ColumnMapping[];
  errors: ValidationError[];
  uploading: boolean;
  uploadProgress: number;
  uploadSuccess: boolean;
}

const REQUIRED_COLUMNS = [
  { key: 'booth_code', label: 'Booth Code', required: true },
  { key: 'booth_name', label: 'Booth Name', required: true },
  { key: 'ward_code', label: 'Ward Code', required: true },
  { key: 'constituency_code', label: 'Constituency Code', required: true },
  { key: 'address', label: 'Address', required: false },
  { key: 'latitude', label: 'Latitude', required: false },
  { key: 'longitude', label: 'Longitude', required: false },
  { key: 'total_voters', label: 'Total Voters', required: false },
  { key: 'male_voters', label: 'Male Voters', required: false },
  { key: 'female_voters', label: 'Female Voters', required: false },
  { key: 'transgender_voters', label: 'Transgender Voters', required: false },
  { key: 'accessibility', label: 'Accessibility', required: false },
];

export default function BoothsUpload() {
  const [state, setState] = useState<UploadState>({
    file: null,
    data: [],
    headers: [],
    columnMappings: [],
    errors: [],
    uploading: false,
    uploadProgress: 0,
    uploadSuccess: false,
  });

  const [showPreview, setShowPreview] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = async (file: File) => {
    const fileExt = file.name.split('.').pop()?.toLowerCase();

    if (!['csv', 'xlsx', 'xls'].includes(fileExt || '')) {
      alert('Please upload a CSV or Excel file');
      return;
    }

    setState(prev => ({ ...prev, file, errors: [], uploadSuccess: false }));

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];

        if (jsonData.length === 0) {
          alert('File is empty');
          return;
        }

        const headers = jsonData[0].map(String);
        const rows = jsonData.slice(1).map(row => {
          const obj: any = {};
          headers.forEach((header, idx) => {
            obj[header] = row[idx];
          });
          return obj;
        });

        // Auto-detect column mappings
        const mappings = REQUIRED_COLUMNS.map(col => {
          const matchedHeader = headers.find(h =>
            h.toLowerCase().replace(/[_\s]/g, '') === col.key.toLowerCase().replace(/[_\s]/g, '')
          );
          return {
            fileColumn: matchedHeader || '',
            targetColumn: col.key,
          };
        });

        setState(prev => ({
          ...prev,
          data: rows,
          headers,
          columnMappings: mappings,
        }));

        setShowPreview(true);
      } catch (error) {
        console.error('Error parsing file:', error);
        alert('Error reading file. Please check the file format.');
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const validateData = (): ValidationError[] => {
    const errors: ValidationError[] = [];

    state.data.forEach((row, index) => {
      REQUIRED_COLUMNS.forEach(col => {
        if (col.required) {
          const mapping = state.columnMappings.find(m => m.targetColumn === col.key);
          const value = mapping ? row[mapping.fileColumn] : null;

          if (!value || value === '') {
            errors.push({
              row: index + 2,
              column: col.label,
              value: value || 'Empty',
              message: `${col.label} is required`,
            });
          }
        }

        // Validate GPS coordinates if present
        if (col.key === 'latitude' || col.key === 'longitude') {
          const mapping = state.columnMappings.find(m => m.targetColumn === col.key);
          const value = mapping ? row[mapping.fileColumn] : null;

          if (value && value !== '') {
            const numValue = parseFloat(value);
            if (isNaN(numValue)) {
              errors.push({
                row: index + 2,
                column: col.label,
                value: String(value),
                message: `${col.label} must be a valid number`,
              });
            } else if (col.key === 'latitude' && (numValue < -90 || numValue > 90)) {
              errors.push({
                row: index + 2,
                column: col.label,
                value: String(value),
                message: `${col.label} must be between -90 and 90`,
              });
            } else if (col.key === 'longitude' && (numValue < -180 || numValue > 180)) {
              errors.push({
                row: index + 2,
                column: col.label,
                value: String(value),
                message: `${col.label} must be between -180 and 180`,
              });
            }
          }
        }

        // Validate voter counts
        if (['total_voters', 'male_voters', 'female_voters', 'transgender_voters'].includes(col.key)) {
          const mapping = state.columnMappings.find(m => m.targetColumn === col.key);
          const value = mapping ? row[mapping.fileColumn] : null;

          if (value && value !== '') {
            const numValue = parseInt(value);
            if (isNaN(numValue) || numValue < 0) {
              errors.push({
                row: index + 2,
                column: col.label,
                value: String(value),
                message: `${col.label} must be a positive number`,
              });
            }
          }
        }
      });
    });

    return errors;
  };

  const handleUpload = async () => {
    const validationErrors = validateData();

    if (validationErrors.length > 0) {
      setState(prev => ({ ...prev, errors: validationErrors }));
      alert(`Found ${validationErrors.length} validation errors. Please fix them before uploading.`);
      return;
    }

    setState(prev => ({ ...prev, uploading: true, uploadProgress: 0 }));

    const interval = setInterval(() => {
      setState(prev => {
        if (prev.uploadProgress >= 90) {
          clearInterval(interval);
          return prev;
        }
        return { ...prev, uploadProgress: prev.uploadProgress + 10 };
      });
    }, 200);

    try {
      const transformedData = state.data.map(row => {
        const transformed: any = {};
        state.columnMappings.forEach(mapping => {
          if (mapping.fileColumn) {
            transformed[mapping.targetColumn] = row[mapping.fileColumn];
          }
        });
        return transformed;
      });

      // TODO: Replace with actual API call
      // const response = await fetch('/api/booths/bulk-upload', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ booths: transformedData }),
      // });

      await new Promise(resolve => setTimeout(resolve, 1000));

      clearInterval(interval);
      setState(prev => ({
        ...prev,
        uploading: false,
        uploadProgress: 100,
        uploadSuccess: true
      }));

      setTimeout(() => {
        setState({
          file: null,
          data: [],
          headers: [],
          columnMappings: [],
          errors: [],
          uploading: false,
          uploadProgress: 0,
          uploadSuccess: false,
        });
        setShowPreview(false);
      }, 3000);
    } catch (error) {
      clearInterval(interval);
      console.error('Upload error:', error);
      setState(prev => ({ ...prev, uploading: false, uploadProgress: 0 }));
      alert('Upload failed. Please try again.');
    }
  };

  const updateColumnMapping = (targetColumn: string, fileColumn: string) => {
    setState(prev => ({
      ...prev,
      columnMappings: prev.columnMappings.map(m =>
        m.targetColumn === targetColumn ? { ...m, fileColumn } : m
      ),
    }));
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Polling Booths Data</h1>
        <p className="text-gray-600">Upload CSV or Excel file containing polling booth information with GPS coordinates</p>
      </div>

      {!showPreview ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${
              isDragging
                ? 'border-yellow-600 bg-yellow-50'
                : 'border-gray-300 hover:border-yellow-500'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <CloudUpload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {isDragging ? 'Drop your file here' : 'Upload Polling Booths Data File'}
            </h3>
            <p className="text-gray-600 mb-6">Drag and drop or click to browse</p>

            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center gap-2 bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 cursor-pointer transition-colors"
            >
              <CloudUpload className="w-5 h-5" />
              Choose File
            </label>

            <div className="mt-8 text-left bg-gray-50 rounded-lg p-6">
              <div className="flex items-start gap-3 mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <LocationOn className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-semibold mb-1">GPS Coordinates Required for Map View</p>
                  <p>Include latitude and longitude for each booth to display on the interactive map</p>
                </div>
              </div>

              <h4 className="font-semibold text-gray-900 mb-3">Required Columns:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                {REQUIRED_COLUMNS.filter(col => col.required).map(col => (
                  <li key={col.key} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    {col.label}
                  </li>
                ))}
              </ul>
              <h4 className="font-semibold text-gray-900 mt-4 mb-3">Optional Columns:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                {REQUIRED_COLUMNS.filter(col => !col.required).map(col => (
                  <li key={col.key} className="flex items-center gap-2">
                    <TableChart className="w-4 h-4 text-gray-400" />
                    {col.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {state.file?.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {state.data.length} polling booths found
                </p>
              </div>
              <button
                onClick={() => {
                  setState({
                    file: null,
                    data: [],
                    headers: [],
                    columnMappings: [],
                    errors: [],
                    uploading: false,
                    uploadProgress: 0,
                    uploadSuccess: false,
                  });
                  setShowPreview(false);
                }}
                className="text-gray-600 hover:text-gray-900"
              >
                <Close className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Column Mapping</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {REQUIRED_COLUMNS.map(col => {
                const mapping = state.columnMappings.find(m => m.targetColumn === col.key);
                return (
                  <div key={col.key} className="flex items-center gap-3">
                    <div className="w-1/2">
                      <label className="text-sm font-medium text-gray-900">
                        {col.label}
                        {col.required && <span className="text-red-600 ml-1">*</span>}
                      </label>
                    </div>
                    <div className="flex-1">
                      <select
                        value={mapping?.fileColumn || ''}
                        onChange={(e) => updateColumnMapping(col.key, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm"
                      >
                        <option value="">-- Select --</option>
                        {state.headers.map(header => (
                          <option key={header} value={header}>
                            {header}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Data Preview</h3>
              <span className="text-sm text-gray-600">
                Showing first 10 rows
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Row
                    </th>
                    {REQUIRED_COLUMNS.slice(0, 8).map(col => (
                      <th
                        key={col.key}
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {state.data.slice(0, 10).map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-sm text-gray-900">{idx + 1}</td>
                      {REQUIRED_COLUMNS.slice(0, 8).map(col => {
                        const mapping = state.columnMappings.find(m => m.targetColumn === col.key);
                        const value = mapping ? row[mapping.fileColumn] : '';
                        return (
                          <td
                            key={col.key}
                            className="px-3 py-2 text-sm text-gray-900 max-w-xs truncate"
                          >
                            {value || <span className="text-gray-400">-</span>}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {state.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <Error className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-900 mb-3">
                    {state.errors.length} Validation Error(s) Found
                  </h3>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {state.errors.slice(0, 50).map((error, idx) => (
                      <div key={idx} className="text-sm text-red-800">
                        <span className="font-medium">Row {error.row}:</span> {error.message}
                        {error.value !== 'Empty' && ` (Value: "${error.value}")`}
                      </div>
                    ))}
                    {state.errors.length > 50 && (
                      <p className="text-sm text-red-700 font-medium mt-2">
                        ... and {state.errors.length - 50} more errors
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {state.uploading && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Uploading...</span>
                <span className="text-sm text-gray-600">{state.uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${state.uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {state.uploadSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <h3 className="text-lg font-semibold text-green-900">Upload Successful!</h3>
                  <p className="text-sm text-green-700 mt-1">
                    {state.data.length} polling booths have been uploaded successfully.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-4">
            <button
              onClick={() => {
                setState(prev => ({ ...prev, errors: [] }));
                const errors = validateData();
                if (errors.length === 0) {
                  alert('Validation passed! No errors found.');
                } else {
                  setState(prev => ({ ...prev, errors }));
                }
              }}
              disabled={state.uploading}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <Visibility className="w-5 h-5 inline mr-2" />
              Validate Data
            </button>
            <button
              onClick={handleUpload}
              disabled={state.uploading || state.uploadSuccess}
              className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <CloudUpload className="w-5 h-5 inline mr-2" />
              Upload Booths
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
