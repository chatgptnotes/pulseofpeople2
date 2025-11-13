import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { LocationOn, FilterList, Layers, ZoomIn, ZoomOut, MyLocation } from '@mui/icons-material';

// Set Mapbox access token from environment variable
// IMPORTANT: VITE_MAPBOX_ACCESS_TOKEN must be set in .env file
if (!import.meta.env.VITE_MAPBOX_ACCESS_TOKEN) {
  console.error('VITE_MAPBOX_ACCESS_TOKEN not found in environment variables');
}
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';

interface Booth {
  id: string;
  booth_code: string;
  booth_name: string;
  ward_code: string;
  constituency_code: string;
  constituency_name: string;
  address: string;
  latitude: number;
  longitude: number;
  total_voters: number;
  male_voters: number;
  female_voters: number;
  transgender_voters: number;
  accessibility: string;
}

interface BoothsMapProps {
  booths?: Booth[];
  height?: string;
}

export default function BoothsMap({ booths: externalBooths, height = '600px' }: BoothsMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [loading, setLoading] = useState(true);
  const [booths, setBooths] = useState<Booth[]>([]);
  const [selectedConstituency, setSelectedConstituency] = useState<string>('');
  const [selectedAccessibility, setSelectedAccessibility] = useState<string>('');
  const [showClusters, setShowClusters] = useState(true);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // Load booths if not provided
  useEffect(() => {
    if (externalBooths) {
      setBooths(externalBooths.filter(b => b.latitude && b.longitude));
      setLoading(false);
    } else {
      loadBooths();
    }
  }, [externalBooths]);

  const loadBooths = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/booths?has_gps=true');
      // const data = await response.json();

      // Mock data with GPS coordinates
      const mockBooths: Booth[] = Array.from({ length: 500 }, (_, i) => ({
        id: `booth-${i + 1}`,
        booth_code: `B${String(i + 1).padStart(5, '0')}`,
        booth_name: `Polling Booth ${i + 1}`,
        ward_code: `W${String((i % 30) + 1).padStart(4, '0')}`,
        constituency_code: `AC${String((i % 10) + 1).padStart(3, '0')}`,
        constituency_name: `Constituency ${(i % 10) + 1}`,
        address: `${i + 1} Main Street, Tamil Nadu`,
        latitude: 11.0168 + (Math.random() - 0.5) * 2,
        longitude: 76.9558 + (Math.random() - 0.5) * 2,
        total_voters: Math.floor(Math.random() * 2000) + 500,
        male_voters: Math.floor(Math.random() * 1000) + 250,
        female_voters: Math.floor(Math.random() * 1000) + 250,
        transgender_voters: Math.floor(Math.random() * 5),
        accessibility: ['Accessible', 'Partially Accessible', 'Not Accessible'][i % 3],
      }));

      setBooths(mockBooths);
      setLoading(false);
    } catch (error) {
      console.error('Error loading booths:', error);
      setLoading(false);
    }
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [78.6569, 11.1271], // Tamil Nadu center
      zoom: 7,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add fullscreen control
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Add markers to map
  useEffect(() => {
    if (!map.current || booths.length === 0 || loading) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Filter booths
    let filteredBooths = booths;
    if (selectedConstituency) {
      filteredBooths = filteredBooths.filter(b => b.constituency_code === selectedConstituency);
    }
    if (selectedAccessibility) {
      filteredBooths = filteredBooths.filter(b => b.accessibility === selectedAccessibility);
    }

    if (showClusters) {
      // Add clustered markers using GeoJSON
      const geojson: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: filteredBooths.map(booth => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [booth.longitude, booth.latitude],
          },
          properties: {
            id: booth.id,
            booth_code: booth.booth_code,
            booth_name: booth.booth_name,
            constituency_name: booth.constituency_name,
            address: booth.address,
            total_voters: booth.total_voters,
            male_voters: booth.male_voters,
            female_voters: booth.female_voters,
            accessibility: booth.accessibility,
          },
        })),
      };

      // Remove existing source and layers
      if (map.current.getSource('booths')) {
        if (map.current.getLayer('clusters')) map.current.removeLayer('clusters');
        if (map.current.getLayer('cluster-count')) map.current.removeLayer('cluster-count');
        if (map.current.getLayer('unclustered-point')) map.current.removeLayer('unclustered-point');
        map.current.removeSource('booths');
      }

      // Add source
      map.current.addSource('booths', {
        type: 'geojson',
        data: geojson,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      // Add cluster layer
      map.current.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'booths',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#FCD34D',
            10,
            '#F59E0B',
            30,
            '#D97706'
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            15,
            10,
            20,
            30,
            25
          ],
        },
      });

      // Add cluster count layer
      map.current.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'booths',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12,
        },
        paint: {
          'text-color': '#ffffff',
        },
      });

      // Add unclustered point layer
      map.current.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'booths',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#DC2626',
          'circle-radius': 8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
        },
      });

      // Click handler for clusters
      map.current.on('click', 'clusters', (e) => {
        if (!map.current) return;
        const features = map.current.queryRenderedFeatures(e.point, {
          layers: ['clusters'],
        });
        const clusterId = features[0].properties?.cluster_id;
        const source = map.current.getSource('booths') as mapboxgl.GeoJSONSource;

        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err || !map.current) return;

          map.current.easeTo({
            center: (features[0].geometry as GeoJSON.Point).coordinates as [number, number],
            zoom: zoom,
          });
        });
      });

      // Click handler for unclustered points
      map.current.on('click', 'unclustered-point', (e) => {
        if (!e.features || !e.features[0].properties) return;

        const properties = e.features[0].properties;
        const coordinates = (e.features[0].geometry as GeoJSON.Point).coordinates.slice() as [number, number];

        const popupContent = `
          <div class="p-4 min-w-[300px]">
            <h3 class="font-bold text-lg text-gray-900 mb-2">${properties.booth_name}</h3>
            <p class="text-sm text-gray-600 mb-3">${properties.address}</p>

            <div class="space-y-2">
              <div class="flex items-center justify-between py-1 border-b border-gray-200">
                <span class="text-sm text-gray-600">Booth Code</span>
                <span class="text-sm font-semibold text-gray-900">${properties.booth_code}</span>
              </div>
              <div class="flex items-center justify-between py-1 border-b border-gray-200">
                <span class="text-sm text-gray-600">Constituency</span>
                <span class="text-sm font-semibold text-gray-900">${properties.constituency_name}</span>
              </div>
              <div class="flex items-center justify-between py-1 border-b border-gray-200">
                <span class="text-sm text-gray-600">Total Voters</span>
                <span class="text-sm font-semibold text-gray-900">${properties.total_voters.toLocaleString()}</span>
              </div>
              <div class="flex items-center justify-between py-1 border-b border-gray-200">
                <span class="text-sm text-gray-600">Male Voters</span>
                <span class="text-sm font-semibold text-gray-900">${properties.male_voters.toLocaleString()}</span>
              </div>
              <div class="flex items-center justify-between py-1 border-b border-gray-200">
                <span class="text-sm text-gray-600">Female Voters</span>
                <span class="text-sm font-semibold text-gray-900">${properties.female_voters.toLocaleString()}</span>
              </div>
              <div class="flex items-center justify-between py-1">
                <span class="text-sm text-gray-600">Accessibility</span>
                <span class="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                  properties.accessibility === 'Accessible'
                    ? 'bg-green-100 text-green-700'
                    : properties.accessibility === 'Partially Accessible'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }">${properties.accessibility}</span>
              </div>
            </div>
          </div>
        `;

        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(popupContent)
          .addTo(map.current!);
      });

      // Change cursor on hover
      map.current.on('mouseenter', 'clusters', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });
      map.current.on('mouseleave', 'clusters', () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });
      map.current.on('mouseenter', 'unclustered-point', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });
      map.current.on('mouseleave', 'unclustered-point', () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });

    } else {
      // Add individual markers without clustering
      filteredBooths.forEach(booth => {
        if (!map.current) return;

        const el = document.createElement('div');
        el.className = 'marker';
        el.style.width = '24px';
        el.style.height = '24px';
        el.style.backgroundImage = 'url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMkM4LjEzIDIgNSA1LjEzIDUgOUM1IDEzLjE3IDEyIDIyIDEyIDIyQzEyIDIyIDE5IDEzLjE3IDE5IDlDMTkgNS4xMyAxNS44NyAyIDEyIDJaTTEyIDExLjVDMTAuNjIgMTEuNSA5LjUgMTAuMzggOS41IDlDOS41IDcuNjIgMTAuNjIgNi41IDEyIDYuNUMxMy4zOCA2LjUgMTQuNSA3LjYyIDE0LjUgOUMxNC41IDEwLjM4IDEzLjM4IDExLjUgMTIgMTEuNVoiIGZpbGw9IiNEQzI2MjYiLz48L3N2Zz4=)';
        el.style.backgroundSize = 'cover';
        el.style.cursor = 'pointer';

        const popupContent = `
          <div class="p-4 min-w-[300px]">
            <h3 class="font-bold text-lg text-gray-900 mb-2">${booth.booth_name}</h3>
            <p class="text-sm text-gray-600 mb-3">${booth.address}</p>

            <div class="space-y-2">
              <div class="flex items-center justify-between py-1 border-b border-gray-200">
                <span class="text-sm text-gray-600">Booth Code</span>
                <span class="text-sm font-semibold text-gray-900">${booth.booth_code}</span>
              </div>
              <div class="flex items-center justify-between py-1 border-b border-gray-200">
                <span class="text-sm text-gray-600">Total Voters</span>
                <span class="text-sm font-semibold text-gray-900">${booth.total_voters.toLocaleString()}</span>
              </div>
              <div class="flex items-center justify-between py-1">
                <span class="text-sm text-gray-600">Accessibility</span>
                <span class="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                  booth.accessibility === 'Accessible'
                    ? 'bg-green-100 text-green-700'
                    : booth.accessibility === 'Partially Accessible'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }">${booth.accessibility}</span>
              </div>
            </div>
          </div>
        `;

        const marker = new mapboxgl.Marker(el)
          .setLngLat([booth.longitude, booth.latitude])
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(popupContent))
          .addTo(map.current);

        markersRef.current.push(marker);
      });
    }

    // Fit bounds to show all markers
    if (filteredBooths.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      filteredBooths.forEach(booth => {
        bounds.extend([booth.longitude, booth.latitude]);
      });
      map.current.fitBounds(bounds, { padding: 50 });
    }
  }, [booths, selectedConstituency, selectedAccessibility, showClusters, loading]);

  const handleRecenter = () => {
    if (!map.current) return;
    map.current.flyTo({
      center: [78.6569, 11.1271],
      zoom: 7,
    });
  };

  const constituencies = Array.from(new Set(booths.map(b => b.constituency_code))).sort();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Filters */}
      <div className="bg-white rounded-t-lg shadow-sm border border-gray-200 border-b-0 p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <FilterList className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>

          <select
            value={selectedConstituency}
            onChange={(e) => setSelectedConstituency(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          >
            <option value="">All Constituencies</option>
            {constituencies.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={selectedAccessibility}
            onChange={(e) => setSelectedAccessibility(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          >
            <option value="">All Accessibility</option>
            <option value="Accessible">Accessible</option>
            <option value="Partially Accessible">Partially Accessible</option>
            <option value="Not Accessible">Not Accessible</option>
          </select>

          <button
            onClick={() => setShowClusters(!showClusters)}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
              showClusters
                ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                : 'bg-gray-100 text-gray-700 border border-gray-300'
            }`}
          >
            <Layers className="w-4 h-4" />
            {showClusters ? 'Clustering On' : 'Clustering Off'}
          </button>

          <button
            onClick={handleRecenter}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 border border-gray-300"
          >
            <MyLocation className="w-4 h-4" />
            Recenter
          </button>

          <div className="ml-auto flex items-center gap-2 text-sm text-gray-600">
            <LocationOn className="w-5 h-5 text-yellow-600" />
            <span className="font-medium">
              {booths.filter(b => {
                let show = true;
                if (selectedConstituency) show = show && b.constituency_code === selectedConstituency;
                if (selectedAccessibility) show = show && b.accessibility === selectedAccessibility;
                return show;
              }).length}
            </span>
            booths displayed
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div
        ref={mapContainer}
        className="w-full rounded-b-lg border border-gray-200 shadow-sm"
        style={{ height }}
      />

      {/* Legend */}
      <div className="absolute bottom-6 left-6 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Legend</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-600 border-2 border-white"></div>
            <span className="text-xs text-gray-700">Polling Booth</span>
          </div>
          {showClusters && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
                <span className="text-xs text-gray-700">Cluster (1-9)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-yellow-600"></div>
                <span className="text-xs text-gray-700">Cluster (10-29)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-yellow-700"></div>
                <span className="text-xs text-gray-700">Cluster (30+)</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
