import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, Lock, MapPin, BarChart3, FileText, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Viewer Dashboard - Read-Only Access
 *
 * Geographic Scope: Assigned Area (depends on viewer's assignment)
 * - View dashboards and reports (NO editing)
 * - View analytics and charts
 * - Export reports (view only)
 * - Cannot submit feedback or modify data
 */
export default function ViewerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    sentiment: 0,
    totalFeedback: 0,
    activeAgents: 0,
    coverage: 0,
  });

  useEffect(() => {
    // Load read-only stats
    setStats({
      sentiment: 0.68,
      totalFeedback: 1250,
      activeAgents: 45,
      coverage: 72,
    });
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Eye className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-600">READ-ONLY MODE</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Viewer Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome, {user?.name}. You have read-only access to view reports and analytics.
        </p>
      </div>

      {/* Read-Only Notice */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
        <div className="flex items-start">
          <Lock className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">Limited Access</p>
            <p className="text-sm text-blue-700 mt-1">
              You can view all data and reports, but cannot submit feedback or make changes.
              Contact your administrator for elevated permissions.
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics - Read Only */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overall Sentiment</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {(stats.sentiment * 100).toFixed(0)}%
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Feedback</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {stats.totalFeedback.toLocaleString()}
              </p>
            </div>
            <FileText className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Agents</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.activeAgents}</p>
            </div>
            <Eye className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Coverage</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.coverage}%</p>
            </div>
            <MapPin className="h-8 w-8 text-indigo-500" />
          </div>
        </div>
      </div>

      {/* Available Views */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Views</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/analytics"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <BarChart3 className="h-8 w-8 text-blue-500 mr-4" />
            <div>
              <p className="font-medium text-gray-900">View Analytics</p>
              <p className="text-sm text-gray-500">Charts and insights (read-only)</p>
            </div>
          </Link>

          <Link
            to="/reports"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileText className="h-8 w-8 text-green-500 mr-4" />
            <div>
              <p className="font-medium text-gray-900">View Reports</p>
              <p className="text-sm text-gray-500">Export and view reports</p>
            </div>
          </Link>

          <Link
            to="/tamil-nadu-map"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <MapPin className="h-8 w-8 text-purple-500 mr-4" />
            <div>
              <p className="font-medium text-gray-900">View Map</p>
              <p className="text-sm text-gray-500">Geographic data visualization</p>
            </div>
          </Link>

          <Link
            to="/voter-database"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Eye className="h-8 w-8 text-indigo-500 mr-4" />
            <div>
              <p className="font-medium text-gray-900">View Data</p>
              <p className="text-sm text-gray-500">Browse voter database</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Restrictions Notice */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">What You Cannot Do</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <span className="mr-2">•</span>
                Submit feedback or field reports
              </li>
              <li className="flex items-center">
                <span className="mr-2">•</span>
                Edit or modify any data
              </li>
              <li className="flex items-center">
                <span className="mr-2">•</span>
                Manage users or booth agents
              </li>
              <li className="flex items-center">
                <span className="mr-2">•</span>
                Change settings or configurations
              </li>
            </ul>
            <p className="mt-4 text-sm text-gray-700">
              Need more access? Contact your administrator to request elevated permissions.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Last updated: {new Date().toLocaleString()}</p>
        <p className="mt-1">Read-Only Access • Contact admin for permissions</p>
      </div>
    </div>
  );
}
