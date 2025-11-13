/**
 * DrillDownControls Component
 * Breadcrumb navigation for map drill-down levels
 */

import React from 'react';
import { motion } from 'framer-motion';
import { MapDrillDownLevel } from '../../types/geography';
import HomeIcon from '@mui/icons-material/Home';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import PublicIcon from '@mui/icons-material/Public';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import PlaceIcon from '@mui/icons-material/Place';

interface DrillDownControlsProps {
  drillDownLevel: MapDrillDownLevel;
  stateName?: string;
  districtName?: string;
  constituencyName?: string;
  onLevelClick: (level: 'state' | 'district' | 'constituency' | 'booth') => void;
  className?: string;
}

export const DrillDownControls: React.FC<DrillDownControlsProps> = ({
  drillDownLevel,
  stateName = 'Tamil Nadu',
  districtName,
  constituencyName,
  onLevelClick,
  className = ''
}) => {
  const breadcrumbs = [
    {
      level: 'state' as const,
      label: stateName,
      icon: <PublicIcon className="w-4 h-4" />,
      active: drillDownLevel.level === 'state'
    }
  ];

  if (drillDownLevel.selectedDistrictCode && districtName) {
    breadcrumbs.push({
      level: 'district' as const,
      label: districtName,
      icon: <LocationCityIcon className="w-4 h-4" />,
      active: drillDownLevel.level === 'district'
    });
  }

  if (drillDownLevel.selectedConstituencyCode && constituencyName) {
    breadcrumbs.push({
      level: 'constituency' as const,
      label: constituencyName,
      icon: <HowToVoteIcon className="w-4 h-4" />,
      active: drillDownLevel.level === 'constituency'
    });
  }

  if (drillDownLevel.level === 'booth') {
    breadcrumbs.push({
      level: 'booth' as const,
      label: 'Polling Booths',
      icon: <PlaceIcon className="w-4 h-4" />,
      active: true
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-lg shadow-md p-4 ${className}`}
    >
      <div className="flex items-center space-x-2">
        {/* Home button */}
        <button
          onClick={() => onLevelClick('state')}
          className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-blue-50 transition-colors"
          title="Back to State View"
        >
          <HomeIcon className="w-5 h-5 text-blue-600" />
        </button>

        <ChevronRightIcon className="w-4 h-4 text-gray-400" />

        {/* Breadcrumb items */}
        <div className="flex items-center space-x-2 overflow-x-auto">
          {breadcrumbs.map((item, index) => (
            <React.Fragment key={item.level}>
              {index > 0 && <ChevronRightIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />}

              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onLevelClick(item.level)}
                className={`
                  flex items-center space-x-2 px-3 py-1.5 rounded-md transition-all duration-200
                  ${item.active
                    ? 'bg-blue-600 text-white font-medium'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {item.icon}
                <span className="whitespace-nowrap text-sm">{item.label}</span>
              </motion.button>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Level info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-3 pt-3 border-t border-gray-200"
      >
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            Current View: <span className="font-semibold text-gray-900 capitalize">{drillDownLevel.level}</span>
          </span>

          <div className="flex items-center space-x-4 text-xs text-gray-500">
            {drillDownLevel.level === 'district' && (
              <span>Click a district to view constituencies</span>
            )}
            {drillDownLevel.level === 'constituency' && (
              <span>Click a constituency to view polling booths</span>
            )}
            {drillDownLevel.level === 'booth' && (
              <span>Viewing all polling booths</span>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
