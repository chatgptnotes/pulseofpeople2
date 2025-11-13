import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Block as BlockIcon,
  Home as HomeIcon,
  ArrowBack as BackIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { VersionFooter } from '../components/VersionFooter';

export function Unauthorized() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-red-100 p-6">
              <BlockIcon className="w-20 h-20 text-red-600" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>

          {/* Message */}
          <p className="text-lg text-gray-600 mb-8">
            You don't have permission to access this page or resource.
          </p>

          {/* Details */}
          <div className="bg-white rounded-lg shadow p-6 mb-8 text-left">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">
              Why am I seeing this?
            </h2>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="flex-shrink-0 w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-2"></span>
                <span>You may not have the required role or permissions</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-2"></span>
                <span>Your account may not be activated yet</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-2"></span>
                <span>You may need to be assigned to this tenant or organization</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => navigate(-1)}
              className="w-full flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <BackIcon className="w-5 h-5 mr-2" />
              Go Back
            </button>

            <button
              onClick={() => navigate('/dashboard/legacy')}
              className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <HomeIcon className="w-5 h-5 mr-2" />
              Go to Dashboard
            </button>

            {user && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-3">
                  Need access? Contact your administrator:
                </p>
                <a
                  href="mailto:admin@yourorganization.com"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                >
                  <EmailIcon className="w-4 h-4 mr-1" />
                  Request Access
                </a>
              </div>
            )}
          </div>

          {/* Current User Info */}
          {user && (
            <div className="mt-8 p-4 bg-gray-100 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Logged in as:</p>
              <p className="text-sm font-medium text-gray-900">{user.email}</p>
              {user.role && (
                <p className="text-xs text-gray-500 mt-1">Role: {user.role}</p>
              )}
            </div>
          )}
        </div>
      </div>

      <VersionFooter />
    </div>
  );
}

export default Unauthorized;
