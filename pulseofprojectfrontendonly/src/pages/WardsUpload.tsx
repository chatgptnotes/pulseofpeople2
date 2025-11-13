import React, { useState } from 'react';
import { CloudUpload, CheckCircle, Error, TableChart, Visibility, Close } from '@mui/icons-material';
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
  { key: 'ward_code', label: 'Ward Code', required: true },
  { key: 'ward_name', label: 'Ward Name', required: true },
  { key: 'constituency_code', label: 'Constituency Code', required: true },
  { key: 'constituency_name', label: 'Constituency Name', required: true },
  { key: 'district', label: 'District', required: false },
  { key: 'population', label: 'Population', required: false },
  { key: 'area_sqkm', label: 'Area (sq km)', required: false },
];

export default function WardsUpload() {
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
              row: index + 2, // +2 because row 1 is header and index is 0-based
              column: col.label,
              value: value || 'Empty',
              message: `${col.label} is required`,
            });
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

    // Simulate upload progress
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
      // Transform data according to column mappings
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
      // const response = await fetch('/api/wards/bulk-upload', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ wards: transformedData }),
      // });

      // Simulate API call
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Wards Data</h1>
        <p className="text-gray-600">Upload CSV or Excel file containing ward information</p>
      </div>

      {!showPreview ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${
              isDragging
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300 hover:border-red-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <CloudUpload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {isDragging ? 'Drop your file here' : 'Upload Ward Data File'}
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
              className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 cursor-pointer transition-colors"
            >
              <CloudUpload className="w-5 h-5" />
              Choose File
            </label>

            <div className="mt-8 text-left bg-gray-50 rounded-lg p-6">
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
          {/* File Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {state.file?.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {state.data.length} rows found
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

          {/* Column Mapping */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Column Mapping</h3>
            <div className="space-y-3">
              {REQUIRED_COLUMNS.map(col => {
                const mapping = state.columnMappings.find(m => m.targetColumn === col.key);
                return (
                  <div key={col.key} className="flex items-center gap-4">
                    <div className="w-1/3">
                      <label className="text-sm font-medium text-gray-900">
                        {col.label}
                        {col.required && <span className="text-red-600 ml-1">*</span>}
                      </label>
                    </div>
                    <div className="flex-1">
                      <select
                        value={mapping?.fileColumn || ''}
                        onChange={(e) => updateColumnMapping(col.key, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option value="">-- Select Column --</option>
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

          {/* Preview Table */}
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Row
                    </th>
                    {REQUIRED_COLUMNS.map(col => (
                      <th
                        key={col.key}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {state.data.slice(0, 10).map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{idx + 1}</td>
                      {REQUIRED_COLUMNS.map(col => {
                        const mapping = state.columnMappings.find(m => m.targetColumn === col.key);
                        const value = mapping ? row[mapping.fileColumn] : '';
                        return (
                          <td
                            key={col.key}
                            className="px-4 py-3 text-sm text-gray-900"
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

          {/* Validation Errors */}
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

          {/* Upload Progress */}
          {state.uploading && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Uploading...</span>
                <span className="text-sm text-gray-600">{state.uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${state.uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Success Message */}
          {state.uploadSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <h3 className="text-lg font-semibold text-green-900">Upload Successful!</h3>
                  <p className="text-sm text-green-700 mt-1">
                    {state.data.length} wards have been uploaded successfully.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4">
            <button
              onClick={() => {
                setState(prev => ({ ...prev, errors: [] }));
                const errors = validateData();
                if (errors.length === 0) {
                  alert('Validation passed! No errors found.');
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
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <CloudUpload className="w-5 h-5 inline mr-2" />
              Upload Wards
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
