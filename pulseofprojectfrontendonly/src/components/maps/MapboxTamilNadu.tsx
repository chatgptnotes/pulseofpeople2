/**
 * Ready-to-Use Mapbox Interactive Map for Tamil Nadu
 * Displays all 234 constituencies with clickable boundaries
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import tamilNaduGeoJSON from '../../assets/maps/tamilnadu-constituencies.json';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiYmttdXJhbGkiLCJhIjoiY21ocDhoNXhiMGhodDJrcW94OGptdDg0MiJ9.dq6OU3jiKKntjhIDD9sxWQ';

interface MapboxTamilNaduProps {
  height?: string;
  onConstituencyClick?: (constituency: any) => void;
}

export const MapboxTamilNadu: React.FC<MapboxTamilNaduProps> = React.memo(({
  height = '700px',
  onConstituencyClick
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedConstituency, setSelectedConstituency] = useState<any>(null);

  // Use ref to store callback to avoid map re-initialization
  const onConstituencyClickRef = useRef(onConstituencyClick);

  // Update ref when callback changes (without re-initializing map)
  useEffect(() => {
    onConstituencyClickRef.current = onConstituencyClick;
  }, [onConstituencyClick]);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize Mapbox
    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12', // Clean street map style
      center: [78.6569, 11.1271], // Tamil Nadu center coordinates
      zoom: 6.5,
      attributionControl: true
    });

    map.current.on('load', () => {
      if (!map.current) return;

      // Add constituency boundaries as a source
      map.current.addSource('constituencies', {
        type: 'geojson',
        data: tamilNaduGeoJSON as any
      });

      // Add constituency fill layer (colored areas)
      map.current.addLayer({
        id: 'constituency-fills',
        type: 'fill',
        source: 'constituencies',
        paint: {
          'fill-color': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            '#2196F3', // Blue on hover
            '#4CAF50'  // Green default
          ],
          'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            0.7,
            0.4
          ]
        }
      });

      // Add constituency outline layer (borders)
      map.current.addLayer({
        id: 'constituency-borders',
        type: 'line',
        source: 'constituencies',
        paint: {
          'line-color': '#333',
          'line-width': 1
        }
      });

      // Add constituency labels
      map.current.addLayer({
        id: 'constituency-labels',
        type: 'symbol',
        source: 'constituencies',
        layout: {
          'text-field': ['get', 'AC_NAME'],
          'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
          'text-size': 10,
          'text-anchor': 'center'
        },
        paint: {
          'text-color': '#000',
          'text-halo-color': '#fff',
          'text-halo-width': 2
        },
        minzoom: 8 // Only show labels when zoomed in
      });

      // Create popup
      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
      });

      let hoveredStateId: string | number | null = null;

      // Mouse enter event
      map.current.on('mouseenter', 'constituency-fills', (e) => {
        if (!map.current || !e.features || e.features.length === 0) return;

        map.current.getCanvas().style.cursor = 'pointer';

        if (hoveredStateId !== null) {
          map.current.setFeatureState(
            { source: 'constituencies', id: hoveredStateId },
            { hover: false }
          );
        }

        hoveredStateId = e.features[0].id as string | number;

        if (hoveredStateId !== undefined) {
          map.current.setFeatureState(
            { source: 'constituencies', id: hoveredStateId },
            { hover: true }
          );
        }

        const properties = e.features[0].properties;
        const coordinates = e.lngLat;

        // Show popup on hover
        const html = `
          <div style="padding: 8px; min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold; color: #333;">
              ${properties?.AC_NAME || 'Unknown'}
            </h3>
            <div style="font-size: 12px; color: #666;">
              <p style="margin: 4px 0;"><strong>District:</strong> ${properties?.DIST_NAME || 'N/A'}</p>
              <p style="margin: 4px 0;"><strong>AC No:</strong> ${properties?.AC_NO || 'N/A'}</p>
              <p style="margin: 4px 0;"><strong>Parliament:</strong> ${properties?.PC_NAME || 'N/A'}</p>
            </div>
            <div style="margin-top: 8px; font-size: 11px; color: #999;">
              Click for more details
            </div>
          </div>
        `;

        popup.setLngLat(coordinates).setHTML(html).addTo(map.current);
      });

      // Mouse leave event
      map.current.on('mouseleave', 'constituency-fills', () => {
        if (!map.current) return;

        map.current.getCanvas().style.cursor = '';

        if (hoveredStateId !== null) {
          map.current.setFeatureState(
            { source: 'constituencies', id: hoveredStateId },
            { hover: false }
          );
        }
        hoveredStateId = null;

        popup.remove();
      });

      // Click event
      map.current.on('click', 'constituency-fills', (e) => {
        if (!e.features || e.features.length === 0) return;

        const feature = e.features[0];
        setSelectedConstituency(feature.properties);

        // Use ref to call callback without triggering re-initialization
        if (onConstituencyClickRef.current) {
          onConstituencyClickRef.current(feature.properties);
        }

        // Zoom to clicked constituency
        if (map.current && feature.properties) {
          map.current.flyTo({
            center: e.lngLat,
            zoom: 10,
            duration: 1000
          });
        }
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add fullscreen control
      map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

      // Add scale control
      map.current.addControl(
        new mapboxgl.ScaleControl({ maxWidth: 100, unit: 'metric' }),
        'bottom-left'
      );
    });

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []); // Empty dependency array - map initializes only once

  return (
    <div className="relative">
      <div
        ref={mapContainer}
        style={{ height }}
        className="w-full rounded-lg border-2 border-gray-300 shadow-lg"
      />

      {selectedConstituency && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-sm z-10">
          <button
            onClick={() => setSelectedConstituency(null)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {selectedConstituency.AC_NAME}
          </h3>
          <div className="space-y-1 text-sm text-gray-600">
            <p><strong>District:</strong> {selectedConstituency.DIST_NAME}</p>
            <p><strong>AC Number:</strong> {selectedConstituency.AC_NO}</p>
            <p><strong>Parliamentary:</strong> {selectedConstituency.PC_NAME}</p>
            <p><strong>State Code:</strong> {selectedConstituency.ST_CODE}</p>
          </div>
        </div>
      )}

      <div className="mt-2 text-xs text-gray-500 text-center">
        Constituency data from DataMeet
      </div>
    </div>
  );
});
