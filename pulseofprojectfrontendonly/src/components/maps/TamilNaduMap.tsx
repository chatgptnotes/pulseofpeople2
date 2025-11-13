/**
 * TamilNaduMap Component
 * Main interactive map with 4-level drill-down capability
 * State → District → Constituency → Polling Booth
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LeafletChoropleth } from './LeafletChoropleth';
import { DrillDownControls } from './DrillDownControls';
import { SentimentLegend } from './SentimentLegend';
import { ConstituencyPopup } from './ConstituencyPopup';
import { PollingBoothMarkers } from './PollingBoothMarkers';
import {
  MapDrillDownLevel,
  SentimentScore,
  AssemblyConstituency,
  District,
  PollingBooth
} from '../../types/geography';
import {
  tamilNaduState,
  pondicherryState,
  allDistricts,
  assemblyConstituencies,
  getSentimentColor,
  getDistrictByName,
  getConstituencyByName
} from '../../data/tamilnadu-data';
import {
  samplePollingBooths,
  generateMockBooths
} from '../../data/polling-booths-sample';
import tamilNaduStateGeoJSON from '../../data/geo/tamilnadu-state.json';
import tamilNaduDistrictsGeoJSON from '../../data/geo/tamilnadu-districts-full.json';
import tamilNaduConstituenciesGeoJSON from '../../data/geo/tamilnadu-constituencies-full.json';
import L from 'leaflet';

interface TamilNaduMapProps {
  height?: string;
  initialZoom?: number;
  className?: string;
}

export const TamilNaduMap: React.FC<TamilNaduMapProps> = React.memo(({
  height = '700px',
  initialZoom = 7.5,
  className = ''
}) => {
  // Map state
  const [drillDownLevel, setDrillDownLevel] = useState<MapDrillDownLevel>({
    level: 'state'
  });
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    tamilNaduState.center.lat,
    tamilNaduState.center.lng
  ]);
  const [mapZoom, setMapZoom] = useState<number>(initialZoom);
  const [currentGeoJSON, setCurrentGeoJSON] = useState<any>(tamilNaduStateGeoJSON);
  const [pollingBooths, setPollingBooths] = useState<PollingBooth[]>([]);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Popup state
  const [popupOpen, setPopupOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<{
    id: string;
    name: string;
    type: 'state' | 'district' | 'constituency';
    data: any;
  } | null>(null);

  // Get sentiment for a feature (memoized - uses only static data)
  const getSentiment = useCallback((featureId: string): SentimentScore | undefined => {
    // Try direct lookup by code (e.g., 'TN03', 'TN001')
    const districtByCode = allDistricts[featureId];
    if (districtByCode?.sentiment) return districtByCode.sentiment;

    const constituencyByCode = assemblyConstituencies[featureId];
    if (constituencyByCode?.sentiment) return constituencyByCode.sentiment;

    // Try lookup by name (for DataMeet GeoJSON compatibility)
    const districtByName = getDistrictByName(featureId);
    if (districtByName?.sentiment) return districtByName.sentiment;

    const constituencyByName = getConstituencyByName(featureId);
    if (constituencyByName?.sentiment) return constituencyByName.sentiment;

    // Try state codes
    if (featureId === 'TN') return tamilNaduState.sentiment;
    if (featureId === 'PY') return pondicherryState.sentiment;

    return undefined;
  }, []); // Empty deps - uses only static data

  // Handle feature click (memoized to prevent map re-renders)
  const handleFeatureClick = useCallback((featureId: string, properties: any) => {
    console.log('Feature clicked:', featureId, properties);

    if (drillDownLevel.level === 'state') {
      // Clicked on state, show district level
      // Try lookup by code first, then by name (DataMeet compatibility)
      let district = allDistricts[featureId];
      if (!district) {
        district = getDistrictByName(featureId);
      }

      if (district) {
        setSelectedFeature({
          id: district.code, // Use district code for consistency
          name: district.name,
          type: 'district',
          data: district
        });
        setPopupOpen(true);
      }
    } else if (drillDownLevel.level === 'district') {
      // Clicked on district, show constituency level
      // Try lookup by code first, then by name (DataMeet compatibility)
      let constituency = assemblyConstituencies[featureId];
      if (!constituency) {
        constituency = getConstituencyByName(featureId);
      }

      if (constituency) {
        setSelectedFeature({
          id: constituency.code, // Use constituency code for consistency
          name: constituency.name,
          type: 'constituency',
          data: constituency
        });
        setPopupOpen(true);
      }
    } else if (drillDownLevel.level === 'constituency') {
      // Clicked on constituency, show booth level
      // Try lookup by code first, then by name (DataMeet compatibility)
      let constituency = assemblyConstituencies[featureId];
      if (!constituency) {
        constituency = getConstituencyByName(featureId);
      }

      if (constituency) {
        drillDownToBooths(constituency.code, constituency);
      }
    }
  }, [drillDownLevel]); // Depends on drillDownLevel

  // Handle drill-down from popup (memoized)
  const handleDrillDown = useCallback(() => {
    if (!selectedFeature) return;

    if (selectedFeature.type === 'district') {
      drillDownToConstituencies(selectedFeature.id);
    } else if (selectedFeature.type === 'constituency') {
      drillDownToBooths(selectedFeature.id, selectedFeature.data);
    }

    setPopupOpen(false);
  }, [selectedFeature]); // Depends on selectedFeature

  // Drill down to districts (memoized)
  const drillDownToDistricts = useCallback(() => {
    // For now, we'll show a simplified district view
    // In production, load actual district GeoJSON
    setDrillDownLevel({
      level: 'district',
      selectedStateCode: 'TN'
    });

    // Load real district boundaries from GeoJSON file
    setCurrentGeoJSON(tamilNaduDistrictsGeoJSON);
    setMapZoom(8);
  }, []); // No dependencies - uses only setters and static data

  // Drill down to constituencies (memoized)
  const drillDownToConstituencies = useCallback((districtCode: string) => {
    const district = allDistricts[districtCode];
    if (!district) return;

    setDrillDownLevel({
      level: 'constituency',
      selectedStateCode: 'TN',
      selectedDistrictCode: districtCode
    });

    // Center on district
    setMapCenter([district.center.lat, district.center.lng]);
    setMapZoom(10);

    // Use real constituency boundaries for this district
    // Filter constituencies by district name
    const districtName = district.name.toUpperCase();
    const constituenciesForDistrict = {
      ...tamilNaduConstituenciesGeoJSON,
      features: (tamilNaduConstituenciesGeoJSON as any).features.filter(
        (f: any) => f.properties.DIST_NAME && f.properties.DIST_NAME.toUpperCase().includes(districtName)
      )
    };
    setCurrentGeoJSON(constituenciesForDistrict);
  }, []); // No dependencies - uses only setters and static data

  // Drill down to polling booths (memoized)
  const drillDownToBooths = useCallback((constituencyCode: string, constituency: AssemblyConstituency) => {
    setDrillDownLevel({
      level: 'booth',
      selectedStateCode: 'TN',
      selectedDistrictCode: constituency.districtCode,
      selectedConstituencyCode: constituencyCode
    });

    // Center on constituency
    setMapCenter([constituency.center.lat, constituency.center.lng]);
    setMapZoom(12);

    // Clear GeoJSON (show base map only)
    setCurrentGeoJSON(null);

    // Load polling booths for this constituency
    let booths = samplePollingBooths.filter(b => b.constituencyCode === constituencyCode);

    // If no sample booths, generate mock ones
    if (booths.length === 0) {
      const district = allDistricts[constituency.districtCode];
      booths = generateMockBooths(
        constituencyCode,
        district?.name || 'Unknown',
        constituency.pollingBooths || 50
      );
    }

    setPollingBooths(booths);
  }, []); // No dependencies - uses only setters and static data

  // Navigate to specific level (memoized)
  const handleLevelClick = useCallback((level: 'state' | 'district' | 'constituency' | 'booth') => {
    if (level === 'state') {
      // Reset to state view
      setDrillDownLevel({ level: 'state' });
      setCurrentGeoJSON(tamilNaduStateGeoJSON);
      setMapCenter([tamilNaduState.center.lat, tamilNaduState.center.lng]);
      setMapZoom(initialZoom);
      setPollingBooths([]);
    } else if (level === 'district' && drillDownLevel.selectedStateCode) {
      // Back to district view
      drillDownToDistricts();
      setPollingBooths([]);
    } else if (level === 'constituency' && drillDownLevel.selectedDistrictCode) {
      // Back to constituency view
      drillDownToConstituencies(drillDownLevel.selectedDistrictCode);
      setPollingBooths([]);
    }
  }, [drillDownLevel, initialZoom, drillDownToDistricts, drillDownToConstituencies]); // Depends on drill-down level and functions

  // Generate mock district GeoJSON (simplified)
  const generateMockDistrictGeoJSON = () => {
    const features = Object.values(allDistricts)
      .filter(d => d.stateCode === 'TN')
      .slice(0, 10) // Show first 10 districts as example
      .map(district => ({
        type: 'Feature',
        properties: {
          name: district.name,
          code: district.code
        },
        geometry: {
          type: 'Polygon',
          coordinates: [generatePolygonAroundPoint(district.center.lat, district.center.lng)]
        }
      }));

    return {
      type: 'FeatureCollection',
      features
    };
  };

  // Generate mock constituency GeoJSON
  const generateMockConstituencyGeoJSON = (districtCode: string) => {
    const district = allDistricts[districtCode];
    if (!district) return null;

    const constituencies = Object.values(assemblyConstituencies)
      .filter(c => c.districtCode === districtCode)
      .slice(0, 6); // Show first 6 constituencies

    const features = constituencies.map(constituency => ({
      type: 'Feature',
      properties: {
        name: constituency.name,
        code: constituency.code
      },
      geometry: {
        type: 'Polygon',
        coordinates: [generatePolygonAroundPoint(constituency.center.lat, constituency.center.lng, 0.05)]
      }
    }));

    return {
      type: 'FeatureCollection',
      features
    };
  };

  // Helper to generate a simple polygon around a point
  const generatePolygonAroundPoint = (lat: number, lng: number, size: number = 0.2) => {
    const points: [number, number][] = [];
    const sides = 6;

    for (let i = 0; i <= sides; i++) {
      const angle = (i / sides) * 2 * Math.PI;
      const x = lng + size * Math.cos(angle);
      const y = lat + size * Math.sin(angle);
      points.push([x, y]);
    }

    return points;
  };

  // Get current feature names for breadcrumb
  const getFeatureNames = () => {
    let districtName = '';
    let constituencyName = '';

    if (drillDownLevel.selectedDistrictCode) {
      const district = allDistricts[drillDownLevel.selectedDistrictCode];
      districtName = district?.name || '';
    }

    if (drillDownLevel.selectedConstituencyCode) {
      const constituency = assemblyConstituencies[drillDownLevel.selectedConstituencyCode];
      constituencyName = constituency?.name || '';
    }

    return { districtName, constituencyName };
  };

  const { districtName, constituencyName } = getFeatureNames();

  return (
    <div className={`relative ${className}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <h2 className="text-2xl font-bold text-gray-900">
          Tamil Nadu & Pondicherry Electoral Map
        </h2>
        <p className="text-gray-600 mt-1">
          Interactive sentiment analysis map - Click regions to drill down
        </p>
      </motion.div>

      {/* Drill-down controls */}
      <DrillDownControls
        drillDownLevel={drillDownLevel}
        stateName="Tamil Nadu"
        districtName={districtName}
        constituencyName={constituencyName}
        onLevelClick={handleLevelClick}
        className="mb-4"
      />

      {/* Map container */}
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={drillDownLevel.level}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {drillDownLevel.level !== 'booth' ? (
              <LeafletChoropleth
                geoJsonData={currentGeoJSON}
                center={mapCenter}
                zoom={mapZoom}
                onFeatureClick={handleFeatureClick}
                getSentiment={getSentiment}
                height={height}
              />
            ) : (
              <LeafletChoropleth
                geoJsonData={null}
                center={mapCenter}
                zoom={mapZoom}
                height={height}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Polling booth markers (only shown at booth level) */}
        {drillDownLevel.level === 'booth' && (
          <PollingBoothMarkers
            booths={pollingBooths}
            mapInstance={mapInstanceRef.current}
            onBoothClick={(booth) => console.log('Booth clicked:', booth)}
          />
        )}

        {/* Sentiment legend */}
        <SentimentLegend position="bottom-right" />
      </div>

      {/* Feature popup */}
      <ConstituencyPopup
        isOpen={popupOpen}
        onClose={() => setPopupOpen(false)}
        title={selectedFeature?.name || ''}
        subtitle={selectedFeature?.type === 'district' ? 'District' : 'Assembly Constituency'}
        sentiment={selectedFeature?.data?.sentiment}
        totalVoters={selectedFeature?.data?.totalVoters}
        pollingBooths={selectedFeature?.data?.pollingBooths}
        additionalInfo={
          selectedFeature?.type === 'constituency'
            ? {
                Type: selectedFeature.data.type,
                'Parliamentary Constituency': selectedFeature.data.parliamentaryConstituency
              }
            : undefined
        }
        onDrillDown={handleDrillDown}
        canDrillDown={
          selectedFeature?.type === 'district' ||
          (selectedFeature?.type === 'constituency' && drillDownLevel.level !== 'booth')
        }
      />

      {/* Stats summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="text-sm text-blue-600 font-medium mb-1">Total Districts</div>
          <div className="text-2xl font-bold text-blue-900">
            {(tamilNaduDistrictsGeoJSON as any).features?.length || 32}
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <div className="text-sm text-purple-600 font-medium mb-1">Assembly Constituencies</div>
          <div className="text-2xl font-bold text-purple-900">
            {(tamilNaduConstituenciesGeoJSON as any).features?.length || 234}
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="text-sm text-green-600 font-medium mb-1">Total Voters</div>
          <div className="text-2xl font-bold text-green-900">6.28 Cr</div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
          <div className="text-sm text-orange-600 font-medium mb-1">Overall Sentiment</div>
          <div className="text-2xl font-bold text-orange-900">
            {tamilNaduState.sentiment?.positive}% Positive
          </div>
        </div>
      </motion.div>
    </div>
  );
});
