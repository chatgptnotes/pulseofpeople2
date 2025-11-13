/**
 * Django API Connection Test Page
 * Simple page to test if React frontend can connect to Django backend
 */
import { useState } from 'react';
import { djangoApi } from '../services/djangoApi';

export default function DjangoTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async (testType: string) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let data;
      switch (testType) {
        case 'health':
          data = await djangoApi.healthCheck();
          break;
        case 'states':
          data = await djangoApi.getStates();
          break;
        case 'districts':
          data = await djangoApi.getDistricts();
          break;
        case 'issues':
          data = await djangoApi.getIssueCategories();
          break;
        case 'segments':
          data = await djangoApi.getVoterSegments();
          break;
        default:
          data = { message: 'Unknown test type' };
      }
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Django Backend Connection Test
          </h1>

          <p className="text-gray-600 mb-8">
            Click the buttons below to test different API endpoints from the Django backend.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <button
              onClick={() => testConnection('health')}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              Health Check
            </button>

            <button
              onClick={() => testConnection('states')}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
            >
              Get States
            </button>

            <button
              onClick={() => testConnection('districts')}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400"
            >
              Get Districts
            </button>

            <button
              onClick={() => testConnection('issues')}
              disabled={loading}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:bg-gray-400"
            >
              Get Issues (TVK)
            </button>

            <button
              onClick={() => testConnection('segments')}
              disabled={loading}
              className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 disabled:bg-gray-400"
            >
              Get Voter Segments
            </button>
          </div>

          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                  <p className="text-xs text-red-600 mt-2">
                    Make sure Django server is running at http://127.0.0.1:8000
                  </p>
                </div>
              </div>
            </div>
          )}

          {result && (
            <div className="bg-gray-50 rounded-md p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Response:</h3>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-md overflow-auto text-sm">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              Connection Info:
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                <strong>Django API URL:</strong>{' '}
                {import.meta.env.VITE_DJANGO_API_URL || 'http://127.0.0.1:8000/api'}
              </li>
              <li>
                <strong>React Dev Server:</strong> http://localhost:5173
              </li>
              <li>
                <strong>CORS:</strong> Configured in Django settings.py
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
