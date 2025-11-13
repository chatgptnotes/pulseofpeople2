import React, { useState } from 'react';
import {
  Help as HelpIcon,
  PlayArrow as PlayIcon,
  CheckCircle as CompletedIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Tour as TourIcon,
} from '@mui/icons-material';
import { useOnboarding } from '../contexts/OnboardingContext';
import { useAuth } from '../contexts/AuthContext';
import {
  isTourCompleted,
  isTourSkipped,
  resetTour,
} from '../lib/onboarding';

export function HelpMenu() {
  const { user } = useAuth();
  const { availableTours, startTourById } = useOnboarding();
  const [showMenu, setShowMenu] = useState(false);

  function handleStartTour(tourId: string) {
    startTourById(tourId);
    setShowMenu(false);
  }

  function handleResetTour(tourId: string) {
    if (!user) return;
    resetTour(user.id, tourId);
    startTourById(tourId);
    setShowMenu(false);
  }

  function getTourStatus(tourId: string): 'pending' | 'completed' | 'skipped' {
    if (!user) return 'pending';

    if (isTourCompleted(user.id, tourId)) {
      return 'completed';
    }
    if (isTourSkipped(user.id, tourId)) {
      return 'skipped';
    }
    return 'pending';
  }

  return (
    <>
      {/* Help Button */}
      <button
        onClick={() => setShowMenu(true)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
        title="Help & Tours"
      >
        <HelpIcon className="w-6 h-6" />
        {availableTours.length > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-blue-500 rounded-full">
            {availableTours.length}
          </span>
        )}
      </button>

      {/* Help Menu Modal */}
      {showMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <TourIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Guided Tours</h2>
                  <p className="text-sm text-gray-500">Learn how to use the platform</p>
                </div>
              </div>
              <button
                onClick={() => setShowMenu(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <CloseIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Tours List */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-100px)]">
              {availableTours.length === 0 ? (
                <div className="text-center py-12">
                  <CompletedIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    All Tours Completed!
                  </h3>
                  <p className="text-gray-600">
                    You've completed all available tours. Great job!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {availableTours.map((tour) => {
                    const status = getTourStatus(tour.id);

                    return (
                      <div
                        key={tour.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {tour.name}
                              </h3>
                              {status === 'completed' && (
                                <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                                  Completed
                                </span>
                              )}
                              {status === 'skipped' && (
                                <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                                  Skipped
                                </span>
                              )}
                            </div>

                            <p className="text-sm text-gray-600 mb-3">
                              {tour.steps.length} steps • Learn key features and workflows
                            </p>

                            <div className="flex items-center space-x-2">
                              {status === 'completed' || status === 'skipped' ? (
                                <button
                                  onClick={() => handleResetTour(tour.id)}
                                  className="flex items-center px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                  <RefreshIcon className="w-4 h-4 mr-2" />
                                  Restart Tour
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleStartTour(tour.id)}
                                  className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                  <PlayIcon className="w-4 h-4 mr-2" />
                                  Start Tour
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Tour Steps Preview */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                            Tour Outline
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            {tour.steps.slice(0, 6).map((step, index) => (
                              <div key={step.id} className="flex items-center text-sm text-gray-600">
                                <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-gray-100 text-gray-600 rounded-full text-xs font-medium mr-2">
                                  {index + 1}
                                </span>
                                <span className="truncate">{step.title}</span>
                              </div>
                            ))}
                            {tour.steps.length > 6 && (
                              <div className="text-sm text-gray-400 italic">
                                +{tour.steps.length - 6} more steps
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Help Resources */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Additional Help</h3>
                <div className="grid grid-cols-2 gap-4">
                  <a
                    href="/docs"
                    className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Documentation</p>
                      <p className="text-xs text-gray-500">Detailed guides and API docs</p>
                    </div>
                  </a>
                  <a
                    href="/support"
                    className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Support</p>
                      <p className="text-xs text-gray-500">Get help from our team</p>
                    </div>
                  </a>
                  <a
                    href="/video-tutorials"
                    className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Video Tutorials</p>
                      <p className="text-xs text-gray-500">Watch step-by-step videos</p>
                    </div>
                  </a>
                  <a
                    href="/community"
                    className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Community</p>
                      <p className="text-xs text-gray-500">Join our user community</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default HelpMenu;
