/**
 * Error Message Component
 * Displays error states with retry functionality
 */

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  error: Error | null;
  retry?: () => void;
  title?: string;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  retry,
  title = 'Error Loading Data',
  className = '',
}) => {
  if (!error) return null;

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-red-200 p-6 ${className}`}>
      <div className="flex items-start">
        <AlertCircle className="h-6 w-6 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-600 mb-4">{error.message}</p>
          {retry && (
            <button
              onClick={retry}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
