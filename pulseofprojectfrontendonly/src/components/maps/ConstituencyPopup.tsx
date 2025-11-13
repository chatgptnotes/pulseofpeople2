/**
 * ConstituencyPopup Component
 * Detailed information popup for selected regions
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import PeopleIcon from '@mui/icons-material/People';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import RemoveIcon from '@mui/icons-material/Remove';
import VerifiedIcon from '@mui/icons-material/Verified';
import { SentimentScore } from '../../types/geography';

interface ConstituencyPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  sentiment?: SentimentScore;
  totalVoters?: number;
  pollingBooths?: number;
  additionalInfo?: Record<string, any>;
  onDrillDown?: () => void;
  canDrillDown?: boolean;
}

export const ConstituencyPopup: React.FC<ConstituencyPopupProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  sentiment,
  totalVoters,
  pollingBooths,
  additionalInfo,
  onDrillDown,
  canDrillDown = false
}) => {
  if (!isOpen) return null;

  const getSentimentIcon = (overall: string) => {
    if (overall === 'positive') return <TrendingUpIcon className="w-5 h-5 text-green-600" />;
    if (overall === 'negative') return <TrendingDownIcon className="w-5 h-5 text-red-600" />;
    return <RemoveIcon className="w-5 h-5 text-yellow-600" />;
  };

  const getSentimentBadgeColor = (overall: string) => {
    if (overall === 'positive') return 'bg-green-100 text-green-800';
    if (overall === 'negative') return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-[2000] flex items-center justify-center p-4"
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="fixed inset-0 z-[2001] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full pointer-events-auto overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 relative">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
                >
                  <CloseIcon className="w-5 h-5" />
                </button>

                <h2 className="text-2xl font-bold pr-10">{title}</h2>
                {subtitle && (
                  <p className="text-blue-100 mt-1 text-sm">{subtitle}</p>
                )}
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Sentiment Overview */}
                {sentiment && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Overall Sentiment</span>
                      <div className={`flex items-center space-x-1 px-3 py-1 rounded-full ${getSentimentBadgeColor(sentiment.overall)}`}>
                        {getSentimentIcon(sentiment.overall)}
                        <span className="text-sm font-semibold capitalize">{sentiment.overall}</span>
                      </div>
                    </div>

                    {/* Sentiment Bars */}
                    <div className="space-y-2">
                      {/* Positive */}
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-green-700 font-medium">Positive</span>
                          <span className="text-green-900 font-bold">{sentiment.positive}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${sentiment.positive}%` }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="bg-green-500 h-2 rounded-full"
                          />
                        </div>
                      </div>

                      {/* Neutral */}
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-yellow-700 font-medium">Neutral</span>
                          <span className="text-yellow-900 font-bold">{sentiment.neutral}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${sentiment.neutral}%` }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="bg-yellow-500 h-2 rounded-full"
                          />
                        </div>
                      </div>

                      {/* Negative */}
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-red-700 font-medium">Negative</span>
                          <span className="text-red-900 font-bold">{sentiment.negative}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${sentiment.negative}%` }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="bg-red-500 h-2 rounded-full"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Confidence Score */}
                    <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                      <VerifiedIcon className="w-4 h-4 text-blue-600" />
                      <span>Confidence: <span className="font-semibold">{Math.round(sentiment.confidence * 100)}%</span></span>
                    </div>
                  </div>
                )}

                {/* Statistics */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  {totalVoters && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="flex items-center space-x-2 text-blue-600 mb-1">
                        <PeopleIcon className="w-4 h-4" />
                        <span className="text-xs font-medium">Total Voters</span>
                      </div>
                      <p className="text-xl font-bold text-blue-900">
                        {totalVoters.toLocaleString()}
                      </p>
                    </div>
                  )}

                  {pollingBooths && (
                    <div className="bg-purple-50 rounded-lg p-3">
                      <div className="flex items-center space-x-2 text-purple-600 mb-1">
                        <HowToVoteIcon className="w-4 h-4" />
                        <span className="text-xs font-medium">Polling Booths</span>
                      </div>
                      <p className="text-xl font-bold text-purple-900">
                        {pollingBooths.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>

                {/* Additional Info */}
                {additionalInfo && Object.keys(additionalInfo).length > 0 && (
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Additional Information</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      {Object.entries(additionalInfo).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                          <span className="font-medium">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Close
                </button>

                {canDrillDown && onDrillDown && (
                  <button
                    onClick={onDrillDown}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Details →
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
