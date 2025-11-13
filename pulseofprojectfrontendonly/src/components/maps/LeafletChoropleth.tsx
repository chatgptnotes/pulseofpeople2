/**
 * LeafletChoropleth Component
 * Interactive map with sentiment-based coloring for Tamil Nadu regions
 */

import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { SentimentScore } from '../../types/geography';

// Fix for default marker icon in production
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LeafletChoroplethProps {
  geoJsonData: any;
  center: [number, number];
  zoom: number;
  onFeatureClick?: (featureId: string, properties: any) => void;
  onFeatureHover?: (featureId: string | null, properties: any) => void;
  getSentiment?: (featureId: string) => SentimentScore | undefined;
  height?: string;
  className?: string;
}

export const LeafletChoropleth: React.FC<LeafletChoroplethProps> = React.memo(({
  geoJsonData,
  center,
  zoom,
  onFeatureClick,
  onFeatureHover,
  getSentiment,
  height = '600px',
  className = ''
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);

  // Use refs to store callbacks to avoid layer re-creation
  const onFeatureClickRef = useRef(onFeatureClick);
  const onFeatureHoverRef = useRef(onFeatureHover);
  const getSentimentRef = useRef(getSentiment);

  // Update refs when callbacks change (without re-creating layers)
  useEffect(() => {
    onFeatureClickRef.current = onFeatureClick;
  }, [onFeatureClick]);

  useEffect(() => {
    onFeatureHoverRef.current = onFeatureHover;
  }, [onFeatureHover]);

  useEffect(() => {
    getSentimentRef.current = getSentiment;
  }, [getSentiment]);

  // Get color based on sentiment
  const getSentimentColor = (sentiment: SentimentScore | undefined): string => {
    if (!sentiment) return '#9ca3af'; // gray-400

    const { overall, positive } = sentiment;

    if (overall === 'positive') {
      // Green gradient based on intensity
      if (positive >= 70) return '#15803d'; // green-700
      if (positive >= 60) return '#16a34a'; // green-600
      return '#22c55e'; // green-500
    }

    if (overall === 'negative') {
      // Red gradient based on intensity
      if (sentiment.negative >= 40) return '#991b1b'; // red-800
      if (sentiment.negative >= 30) return '#dc2626'; // red-600
      return '#ef4444'; // red-500
    }

    // Neutral - yellow
    return '#eab308'; // yellow-500
  };

  // Style function for GeoJSON features (memoized to prevent layer re-creation)
  const style = useCallback((feature: any) => {
    // Support both DataMeet format (DISTRICT, AC_NAME) and custom format (code, name)
    const featureId = feature.properties.code ||
                      feature.properties.DISTRICT ||
                      feature.properties.AC_NAME ||
                      feature.properties.name;
    const sentiment = getSentimentRef.current ? getSentimentRef.current(featureId) : undefined;

    return {
      fillColor: getSentimentColor(sentiment),
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '',
      fillOpacity: 0.7
    };
  }, []); // Empty deps - use refs for dynamic values

  // Highlight feature on hover (memoized)
  const highlightFeature = useCallback((e: L.LeafletMouseEvent) => {
    const layer = e.target;

    layer.setStyle({
      weight: 4,
      color: '#1e40af', // blue-800
      dashArray: '',
      fillOpacity: 0.85
    });

    layer.bringToFront();

    if (onFeatureHoverRef.current) {
      const featureId = layer.feature.properties.code ||
                        layer.feature.properties.DISTRICT ||
                        layer.feature.properties.AC_NAME ||
                        layer.feature.properties.name;
      onFeatureHoverRef.current(featureId, layer.feature.properties);
    }
  }, []);

  // Reset highlight (memoized)
  const resetHighlight = useCallback((e: L.LeafletMouseEvent) => {
    if (geoJsonLayerRef.current) {
      geoJsonLayerRef.current.resetStyle(e.target);
    }

    if (onFeatureHoverRef.current) {
      onFeatureHoverRef.current(null, null);
    }
  }, []);

  // Handle feature click (memoized)
  const clickFeature = useCallback((e: L.LeafletMouseEvent) => {
    const layer = e.target;
    const featureId = layer.feature.properties.code ||
                      layer.feature.properties.DISTRICT ||
                      layer.feature.properties.AC_NAME ||
                      layer.feature.properties.name;

    if (onFeatureClickRef.current) {
      onFeatureClickRef.current(featureId, layer.feature.properties);
    }

    // Zoom to feature
    if (mapRef.current) {
      mapRef.current.fitBounds(layer.getBounds(), {
        padding: [50, 50],
        maxZoom: 10
      });
    }
  }, []);

  // Attach event handlers to each feature (memoized)
  const onEachFeature = useCallback((feature: any, layer: L.Layer) => {
    layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
      click: clickFeature
    });

    // Add tooltip
    if (layer instanceof L.Path) {
      const featureId = feature.properties.code ||
                        feature.properties.DISTRICT ||
                        feature.properties.AC_NAME ||
                        feature.properties.name;
      const featureName = feature.properties.name ||
                          feature.properties.DISTRICT ||
                          feature.properties.AC_NAME;

      const sentiment = getSentimentRef.current ? getSentimentRef.current(featureId) : undefined;

      const tooltipContent = `
        <div class="font-semibold">${featureName}</div>
        ${sentiment ? `
          <div class="text-sm mt-1">
            <div class="text-green-600">✓ ${sentiment.positive}%</div>
            <div class="text-yellow-600">― ${sentiment.neutral}%</div>
            <div class="text-red-600">✗ ${sentiment.negative}%</div>
          </div>
        ` : ''}
      `;

      layer.bindTooltip(tooltipContent, {
        permanent: false,
        sticky: true,
        className: 'bg-white shadow-lg rounded-lg p-2 border border-gray-200'
      });
    }
  }, [highlightFeature, resetHighlight, clickFeature]);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Create map
    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      attributionControl: true
    }).setView(center, zoom);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18
    }).addTo(map);

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update map view when center/zoom changes
  useEffect(() => {
    if (mapRef.current && mapRef.current.getContainer()) {
      try {
        mapRef.current.flyTo(center, zoom, {
          animate: true,
          duration: 1.2,
          easeLinearity: 0.15
        });
      } catch (error) {
        // Fallback to setView if flyTo fails
        console.warn('flyTo failed, using setView:', error);
        mapRef.current.setView(center, zoom);
      }
    }
  }, [center, zoom]);

  // Update GeoJSON layer when data changes
  useEffect(() => {
    if (!mapRef.current || !geoJsonData) return;

    // Remove existing layer
    if (geoJsonLayerRef.current) {
      mapRef.current.removeLayer(geoJsonLayerRef.current);
    }

    // Add new layer
    const geoJsonLayer = L.geoJSON(geoJsonData, {
      style,
      onEachFeature
    }).addTo(mapRef.current);

    geoJsonLayerRef.current = geoJsonLayer;

    // Fit bounds to data
    const bounds = geoJsonLayer.getBounds();
    if (bounds.isValid()) {
      mapRef.current.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [geoJsonData, style, onEachFeature]); // Now these are stable memoized functions

  return (
    <div
      ref={mapContainerRef}
      className={`w-full rounded-lg shadow-lg ${className}`}
      style={{ height }}
    />
  );
});
