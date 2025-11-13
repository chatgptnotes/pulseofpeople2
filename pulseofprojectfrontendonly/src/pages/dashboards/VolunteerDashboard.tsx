import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { MessageSquare, Camera, MapPin, CheckCircle, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Volunteer Dashboard - Simplified Field Data Collection
 *
 * Geographic Scope: Assigned Area/Booth
 * - Ultra-simple interface (mobile-first)
 * - Quick feedback submission (voice input friendly)
 * - Photo upload
 * - Location marking
 * - Minimal metrics (just today's work)
 */
export default function VolunteerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    todayFeedback: 0,
    todayPhotos: 0,
    todayHours: 0,
  });

  useEffect(() => {
    // Load today's stats
    setStats({
      todayFeedback: 8,
      todayPhotos: 3,
      todayHours: 4.5,
    });
  }, []);

  return (
    <div className="p-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Volunteer Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome, {user?.name}! Ready to collect feedback?
        </p>
      </div>

      {/* Today's Progress */}
      <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-lg shadow-lg p-6 mb-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Today's Progress</h3>
          <Award className="h-8 w-8 opacity-50" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-2xl font-bold">{stats.todayFeedback}</p>
            <p className="text-sm text-green-100">Feedback</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.todayPhotos}</p>
            <p className="text-sm text-green-100">Photos</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.todayHours}h</p>
            <p className="text-sm text-green-100">Hours</p>
          </div>
        </div>
      </div>

      {/* Main Actions - Large Buttons for Mobile */}
      <div className="space-y-4 mb-6">
        <Link
          to="/submit-data"
          className="block w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-lg p-6 transition-all transform hover:scale-105"
        >
          <div className="flex items-center justify-center">
            <MessageSquare className="h-10 w-10 mr-4" />
            <div className="text-left">
              <p className="text-xl font-bold">Collect Feedback</p>
              <p className="text-sm text-blue-100">Submit voter feedback form</p>
            </div>
          </div>
        </Link>

        <Link
          to="/submit-data"
          className="block w-full bg-purple-500 hover:bg-purple-600 text-white rounded-xl shadow-lg p-6 transition-all transform hover:scale-105"
        >
          <div className="flex items-center justify-center">
            <Camera className="h-10 w-10 mr-4" />
            <div className="text-left">
              <p className="text-xl font-bold">Upload Photo</p>
              <p className="text-sm text-purple-100">Take and upload field photos</p>
            </div>
          </div>
        </Link>

        <Link
          to="/submit-data"
          className="block w-full bg-green-500 hover:bg-green-600 text-white rounded-xl shadow-lg p-6 transition-all transform hover:scale-105"
        >
          <div className="flex items-center justify-center">
            <MapPin className="h-10 w-10 mr-4" />
            <div className="text-left">
              <p className="text-xl font-bold">Mark Location</p>
              <p className="text-sm text-green-100">Tag your current location</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Submissions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Submissions</h2>
        <div className="space-y-3">
          <div className="flex items-center p-3 bg-green-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Feedback submitted</p>
              <p className="text-xs text-gray-500">10 minutes ago</p>
            </div>
          </div>
          <div className="flex items-center p-3 bg-green-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Photo uploaded</p>
              <p className="text-xs text-gray-500">1 hour ago</p>
            </div>
          </div>
          <div className="flex items-center p-3 bg-green-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Location marked</p>
              <p className="text-xs text-gray-500">2 hours ago</p>
            </div>
          </div>
        </div>
      </div>

      {/* Help Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Help?</h3>
        <p className="text-sm text-gray-600 mb-4">
          Contact your coordinator if you have any questions or issues.
        </p>
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
          Contact Support
        </button>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Last updated: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
}
