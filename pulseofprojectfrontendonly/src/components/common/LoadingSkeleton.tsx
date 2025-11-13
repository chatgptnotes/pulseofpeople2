/**
 * Loading Skeleton Components
 * Reusable skeleton loaders for different content types
 */

import React from 'react';

interface LoadingSkeletonProps {
  type: 'chart' | 'table' | 'card' | 'list' | 'stats';
  count?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ type, count = 1 }) => {
  switch (type) {
    case 'chart':
      return <ChartSkeleton />;
    case 'table':
      return <TableSkeleton rows={count} />;
    case 'card':
      return <CardSkeleton count={count} />;
    case 'list':
      return <ListSkeleton count={count} />;
    case 'stats':
      return <StatsSkeleton count={count} />;
    default:
      return <CardSkeleton count={count} />;
  }
};

const ChartSkeleton = () => (
  <div className="animate-pulse bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
    <div className="space-y-3">
      <div className="h-64 bg-gray-100 rounded"></div>
    </div>
  </div>
);

const TableSkeleton: React.FC<{ rows: number }> = ({ rows }) => (
  <div className="animate-pulse bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          <div className="h-4 bg-gray-100 rounded flex-1"></div>
          <div className="h-4 bg-gray-100 rounded flex-1"></div>
          <div className="h-4 bg-gray-100 rounded flex-1"></div>
        </div>
      ))}
    </div>
  </div>
);

const CardSkeleton: React.FC<{ count: number }> = ({ count }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="animate-pulse bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-8 w-8 bg-gray-200 rounded"></div>
        </div>
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-3 bg-gray-100 rounded w-1/4"></div>
      </div>
    ))}
  </div>
);

const ListSkeleton: React.FC<{ count: number }> = ({ count }) => (
  <div className="animate-pulse bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <div className="h-10 w-10 bg-gray-200 rounded-full flex-shrink-0"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-100 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const StatsSkeleton: React.FC<{ count: number }> = ({ count }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="animate-pulse bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="h-3 bg-gray-200 rounded w-2/3 mb-3"></div>
        <div className="h-8 bg-gray-300 rounded w-1/2 mb-2"></div>
        <div className="h-3 bg-gray-100 rounded w-1/3"></div>
      </div>
    ))}
  </div>
);
