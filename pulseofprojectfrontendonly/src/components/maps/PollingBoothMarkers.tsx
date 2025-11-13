/**
 * PollingBoothMarkers Component
 * Clustered markers for polling booth locations
 */

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { PollingBooth } from '../../types/geography';
import 'leaflet/dist/leaflet.css';

interface PollingBoothMarkersProps {
  booths: PollingBooth[];
  mapInstance: L.Map | null;
  onBoothClick?: (booth: PollingBooth) => void;
}

export const PollingBoothMarkers: React.FC<PollingBoothMarkersProps> = ({
  booths,
  mapInstance,
  onBoothClick
}) => {
  const markersRef = useRef<L.Marker[]>([]);
  const markerClusterGroupRef = useRef<L.LayerGroup | null>(null);

  // Create custom marker icon based on sentiment
  const createMarkerIcon = (booth: PollingBooth): L.DivIcon => {
    const sentiment = booth.sentiment;
    let color = '#9ca3af'; // gray

    if (sentiment) {
      if (sentiment.overall === 'positive') color = '#22c55e'; // green
      else if (sentiment.overall === 'negative') color = '#ef4444'; // red
      else color = '#eab308'; // yellow
    }

    const iconHtml = `
      <div class="relative">
        <div class="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center"
             style="background-color: ${color}">
          <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div class="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border border-gray-300 flex items-center justify-center">
          <div class="w-2 h-2 rounded-full" style="background-color: ${color}"></div>
        </div>
      </div>
    `;

    return L.divIcon({
      html: iconHtml,
      className: 'polling-booth-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });
  };

  // Create popup content for a booth
  const createPopupContent = (booth: PollingBooth): string => {
    const sentiment = booth.sentiment;

    return `
      <div class="p-2 min-w-[200px]">
        <div class="font-semibold text-gray-900 mb-1">${booth.name}</div>
        <div class="text-xs text-gray-600 mb-2">Booth #${booth.boothNumber}</div>

        <div class="space-y-1 text-xs mb-2">
          <div class="flex justify-between">
            <span class="text-gray-600">Total Voters:</span>
            <span class="font-medium text-gray-900">${booth.totalVoters.toLocaleString()}</span>
          </div>
        </div>

        ${sentiment ? `
          <div class="border-t border-gray-200 pt-2 mt-2">
            <div class="text-xs font-medium text-gray-700 mb-1">Sentiment</div>
            <div class="space-y-1">
              <div class="flex items-center justify-between text-xs">
                <span class="text-green-600">Positive</span>
                <span class="font-semibold">${sentiment.positive}%</span>
              </div>
              <div class="flex items-center justify-between text-xs">
                <span class="text-yellow-600">Neutral</span>
                <span class="font-semibold">${sentiment.neutral}%</span>
              </div>
              <div class="flex items-center justify-between text-xs">
                <span class="text-red-600">Negative</span>
                <span class="font-semibold">${sentiment.negative}%</span>
              </div>
            </div>
          </div>
        ` : ''}

        <div class="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200">
          ${booth.address}
        </div>
      </div>
    `;
  };

  useEffect(() => {
    if (!mapInstance || booths.length === 0) return;

    // Clear existing markers
    markersRef.current.forEach(marker => mapInstance.removeLayer(marker));
    markersRef.current = [];

    if (markerClusterGroupRef.current) {
      mapInstance.removeLayer(markerClusterGroupRef.current);
    }

    // Create layer group for markers
    const layerGroup = L.layerGroup();
    markerClusterGroupRef.current = layerGroup;

    // Add markers for each booth
    booths.forEach(booth => {
      const marker = L.marker(
        [booth.location.lat, booth.location.lng],
        { icon: createMarkerIcon(booth) }
      );

      // Bind popup
      marker.bindPopup(createPopupContent(booth), {
        maxWidth: 300,
        className: 'polling-booth-popup'
      });

      // Handle click
      marker.on('click', () => {
        if (onBoothClick) {
          onBoothClick(booth);
        }
      });

      layerGroup.addLayer(marker);
      markersRef.current.push(marker);
    });

    // Add layer group to map
    layerGroup.addTo(mapInstance);

    // Fit bounds to show all markers
    if (booths.length > 0) {
      const bounds = L.latLngBounds(
        booths.map(booth => [booth.location.lat, booth.location.lng])
      );
      mapInstance.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }

    // Cleanup
    return () => {
      markersRef.current.forEach(marker => {
        if (mapInstance.hasLayer(marker)) {
          mapInstance.removeLayer(marker);
        }
      });
      markersRef.current = [];

      if (markerClusterGroupRef.current && mapInstance.hasLayer(markerClusterGroupRef.current)) {
        mapInstance.removeLayer(markerClusterGroupRef.current);
      }
    };
  }, [booths, mapInstance, onBoothClick]);

  return null;
};
