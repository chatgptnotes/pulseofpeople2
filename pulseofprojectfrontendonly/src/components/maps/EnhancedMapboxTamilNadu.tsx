/**
 * Enhanced Mapbox Interactive Map for Tamil Nadu - Multi-Layer Visualization
 *
 * Features:
 * - Base sentiment layer (overall TVK sentiment by constituency)
 * - Issue-specific overlays (Jobs, Healthcare, Infrastructure, etc.)
 * - Alert markers for critical issues
 * - Layer toggle controls
 * - Rich hover tooltips with 5-second summaries
 * - Heatmap visualization for high-priority issues
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import tamilNaduGeoJSON from '../../assets/maps/tamilnadu-constituencies.json';
import { Layers, TrendingUp, AlertTriangle, Briefcase, Heart, Building, Users, Sprout } from 'lucide-react';
import { defaultConstituencySentiment, getConstituencySentiment } from '../../data/defaultConstituencySentiment';
import { getIssueScore, getConstituencyIssueScores } from '../../data/constituencyIssueData';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiYmttdXJhbGkiLCJhIjoiY21ocDhoNXhiMGhodDJrcW94OGptdDg0MiJ9.dq6OU3jiKKntjhIDD9sxWQ';

interface EnhancedMapboxTamilNaduProps {
  height?: string;
  onConstituencyClick?: (constituency: any) => void;
  sentimentData?: { [constituency: string]: number }; // Constituency name -> sentiment score
  issueData?: { [constituency: string]: { [issue: string]: number } }; // Issue-wise scores
  alertsData?: Array<{ lat: number; lng: number; title: string; severity: string; description: string }>;
}

type MapLayer = 'sentiment' | 'jobs' | 'healthcare' | 'infrastructure' | 'education' | 'agriculture' | 'alerts';

export const EnhancedMapboxTamilNadu: React.FC<EnhancedMapboxTamilNaduProps> = React.memo(({
  height = '700px',
  onConstituencyClick,
  sentimentData = {},
  issueData = {},
  alertsData = []
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedConstituency, setSelectedConstituency] = useState<any>(null);
  const [activeLayer, setActiveLayer] = useState<MapLayer>('sentiment');
  const [showLayerControl, setShowLayerControl] = useState(false);
  const alertMarkers = useRef<mapboxgl.Marker[]>([]);

  const onConstituencyClickRef = useRef(onConstituencyClick);

  useEffect(() => {
    onConstituencyClickRef.current = onConstituencyClick;
  }, [onConstituencyClick]);

  // Ensure map always starts with 'sentiment' layer on mount/refresh
  useEffect(() => {
    setActiveLayer('sentiment');
  }, []);

  // Color scheme for sentiment (8-step scale) - Professional colors with darker greens
  const getSentimentColor = useCallback((score: number): string => {
    if (score >= 80) return '#2E7D32'; // Darker green (forest green)
    if (score >= 70) return '#388E3C'; // Medium-dark green
    if (score >= 60) return '#66BB6A'; // Balanced green
    if (score >= 50) return '#FDD835'; // Bright yellow
    if (score >= 40) return '#FF6D00'; // Vibrant orange
    if (score >= 30) return '#FF3D00'; // Bright red-orange
    if (score >= 20) return '#DD2C00'; // Bright red
    return '#B71C1C'; // Deep red
  }, []);

  // Get color based on active layer and data
  const getLayerColor = useCallback((constituencyName: string): string => {
    if (activeLayer === 'sentiment') {
      // Use provided sentimentData first, then fall back to default data
      const score = sentimentData[constituencyName] || getConstituencySentiment(constituencyName);
      return getSentimentColor(score);
    } else if (activeLayer === 'alerts') {
      return '#9E9E9E'; // Gray for alerts layer (markers handle visualization)
    } else {
      // Issue-specific layers (jobs, healthcare, infrastructure, education, agriculture)
      // Try provided issueData first, then fall back to default issue data
      const issueKey = activeLayer as 'jobs' | 'healthcare' | 'infrastructure' | 'education' | 'agriculture';
      const issueScore = issueData[constituencyName]?.[activeLayer] || getIssueScore(constituencyName, issueKey);
      return getSentimentColor(issueScore);
    }
  }, [activeLayer, sentimentData, issueData, getSentimentColor]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11', // Light style for better data visualization
      center: [78.6569, 11.1271],
      zoom: 6.5,
      attributionControl: true
    });

    console.log('[Map] Map initialized');

    map.current.on('load', () => {
      if (!map.current) return;

      // Customize the base map land color to light green (like natural maps)
      // The 'land' layer is part of the Mapbox light-v11 style
      try {
        if (map.current.getLayer('land')) {
          map.current.setPaintProperty('land', 'background-color', '#C8E6C9');
        }
        // Also update water color to differentiate
        if (map.current.getLayer('water')) {
          map.current.setPaintProperty('water', 'fill-color', '#B3E5FC');
        }
      } catch (e) {
        console.log('[Map] Could not update base layer colors:', e);
      }

      // Add constituency boundaries as a source
      map.current.addSource('constituencies', {
        type: 'geojson',
        data: tamilNaduGeoJSON as any,
        generateId: true
      });

      // Add constituency fill layer
      // Start with a neutral color that will be updated by sentiment data
      map.current.addLayer({
        id: 'constituency-fills',
        type: 'fill',
        source: 'constituencies',
        paint: {
          'fill-color': '#9E9E9E', // Neutral gray, will be updated immediately
          'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'clicked'], false],
            0.9,
            ['boolean', ['feature-state', 'hover'], false],
            0.8,
            0.6
          ]
        }
      });

      // Add constituency outline layer
      map.current.addLayer({
        id: 'constituency-borders',
        type: 'line',
        source: 'constituencies',
        paint: {
          'line-color': '#333',
          'line-width': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            2,
            1
          ]
        }
      });

      // Add minimal constituency labels - Google Maps style
      map.current.addLayer({
        id: 'constituency-name-labels',
        type: 'symbol',
        source: 'constituencies',
        layout: {
          'text-field': ['get', 'AC_NAME'], // Show constituency name
          'text-font': ['DIN Offc Pro Regular', 'Arial Unicode MS Regular'],
          'text-size': 12, // Readable size
          'text-anchor': 'center',
          'text-max-width': 10,
          'text-allow-overlap': false,
          'text-optional': true,
          'text-padding': 2,
        },
        paint: {
          'text-color': '#424242', // Subtle gray
          'text-halo-color': '#ffffff',
          'text-halo-width': 1.5,
          'text-halo-blur': 0.5,
          'text-opacity': 0.85 // Slightly more visible
        },
        minzoom: 7.5 // Only show when zoomed in a bit
      });

      // Add sentiment score labels - Very minimal, only on zoom
      map.current.addLayer({
        id: 'sentiment-labels',
        type: 'symbol',
        source: 'constituencies',
        layout: {
          'text-field': '', // Will be updated dynamically with scores
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Regular'],
          'text-size': 11,
          'text-anchor': 'center',
        },
        paint: {
          'text-color': '#666666',
          'text-halo-color': '#fff',
          'text-halo-width': 1.5,
          'text-opacity': 0.75
        },
        minzoom: 9 // Only show scores when zoomed in more
      });

      // Create popups - separate instances for hover and click
      const hoverPopup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        className: 'hover-popup',
        maxWidth: '200px',
        offset: 10
      });

      const clickPopup = new mapboxgl.Popup({
        closeButton: false, // No close button
        closeOnClick: true, // Auto-close on any click
        className: 'click-popup',
        maxWidth: '240px',
        offset: 15
      });

      let hoveredStateId: string | number | null = null;
      let clickedStateId: string | number | null = null;

      // Helper function to create hover popup HTML - Compact version with score and issues
      const createHoverPopupHTML = (constituencyName: string, properties: any, score: number) => {
        const scoreColor = score >= 70 ? '#2E7D32' : score >= 50 ? '#EF6C00' : '#C62828';
        const scoreBg = score >= 70 ? '#E8F5E9' : score >= 50 ? '#FFF3E0' : '#FFEBEE';
        const status = score >= 70 ? 'Doing Well ✓' : score >= 50 ? 'Monitor' : 'Urgent Action!';

        // Get issue data for this constituency
        const issues = getConstituencyIssueScores(constituencyName);
        const topProblems: string[] = [];

        if (issues.jobs < 60) topProblems.push('Jobs');
        if (issues.healthcare < 60) topProblems.push('Healthcare');
        if (issues.infrastructure < 60) topProblems.push('Infrastructure');
        if (issues.education < 60) topProblems.push('Education');
        if (issues.agriculture < 60) topProblems.push('Agriculture');

        const problemsText = topProblems.length > 0
          ? topProblems.slice(0, 3).join(', ')
          : 'No major issues';

        return `
          <div style="font-family: system-ui, -apple-system, sans-serif; padding: 6px 8px; min-width: 180px;">
            <div style="font-size: 13px; font-weight: 600; color: #1a1a1a; margin-bottom: 3px;">
              ${constituencyName}
            </div>
            <div style="font-size: 10px; color: #666; margin-bottom: 5px;">
              ${properties?.DIST_NAME || 'N/A'}
            </div>
            <div style="background: ${scoreBg}; padding: 4px 6px; border-radius: 4px; margin-bottom: 5px;">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <span style="font-size: 14px; font-weight: 700; color: ${scoreColor};">${Math.round(score)}%</span>
                <span style="font-size: 10px; font-weight: 600; color: ${scoreColor};">${status}</span>
              </div>
            </div>
            <div style="font-size: 9px; color: #757575; margin-top: 4px;">
              <strong style="color: #424242;">Key Issues:</strong> ${problemsText}
            </div>
          </div>
        `;
      };

      // Helper function to create click popup HTML - Detailed campaign info
      const createClickPopupHTML = (constituencyName: string, properties: any, score: number) => {
        const scoreColor = score >= 70 ? '#2E7D32' : score >= 50 ? '#EF6C00' : '#C62828';
        const scoreBg = score >= 70 ? '#E8F5E9' : score >= 50 ? '#FFF3E0' : '#FFEBEE';

        // Get issue data for detailed breakdown
        const issues = getConstituencyIssueScores(constituencyName);

        // Identify all problems (score < 60)
        const problems: Array<{name: string, score: number}> = [];
        if (issues.jobs < 60) problems.push({name: 'Jobs & Employment', score: issues.jobs});
        if (issues.healthcare < 60) problems.push({name: 'Healthcare Access', score: issues.healthcare});
        if (issues.infrastructure < 60) problems.push({name: 'Infrastructure', score: issues.infrastructure});
        if (issues.education < 60) problems.push({name: 'Education Quality', score: issues.education});
        if (issues.agriculture < 60) problems.push({name: 'Agriculture Support', score: issues.agriculture});

        // Sort by severity (lowest score first)
        problems.sort((a, b) => a.score - b.score);

        // Campaign action recommendations
        let actionRecommendation = '';
        if (score < 50) {
          actionRecommendation = '🔴 URGENT: Immediate intervention needed. Schedule rallies, address key issues publicly.';
        } else if (score < 70) {
          actionRecommendation = '🟡 MONITOR: Increase engagement. Organize town halls, listen to grievances.';
        } else {
          actionRecommendation = '🟢 MAINTAIN: Keep momentum. Continue positive work, expand successful programs.';
        }

        const problemsHTML = problems.length > 0
          ? problems.map(p => `
              <div style="display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px solid #eee;">
                <span style="font-size: 10px; color: #424242;">${p.name}</span>
                <span style="font-size: 10px; font-weight: 600; color: #C62828;">${p.score}%</span>
              </div>
            `).join('')
          : '<div style="font-size: 10px; color: #388E3C; font-style: italic;">No critical issues identified</div>';

        return `
          <div style="font-family: system-ui, -apple-system, sans-serif;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 7px 10px; color: white;">
              <h3 style="margin: 0; font-size: 13px; font-weight: 700; line-height: 1.2;">${constituencyName}</h3>
              <div style="font-size: 9px; opacity: 0.9; margin-top: 2px;">${properties?.DIST_NAME || 'N/A'}</div>
            </div>
            <div style="padding: 10px; background: white;">
              <div style="background: ${scoreBg}; padding: 6px; border-radius: 4px; margin-bottom: 7px; text-align: center;">
                <div style="font-size: 22px; font-weight: 800; color: ${scoreColor}; line-height: 1;">
                  ${Math.round(score)}%
                </div>
                <div style="font-size: 9px; color: #666; margin-top: 2px;">Overall Sentiment</div>
              </div>

              <div style="margin-bottom: 6px;">
                <div style="font-size: 10px; font-weight: 600; color: #424242; margin-bottom: 2px;">
                  🎯 ${score < 50 ? 'URGENT' : score < 70 ? 'MONITOR' : 'MAINTAIN'}
                </div>
              </div>

              <div style="margin-bottom: 6px;">
                <div style="font-size: 10px; font-weight: 600; color: #424242; margin-bottom: 2px;">
                  ⚠️ Issues:
                </div>
                <div style="font-size: 9px; color: #666;">
                  ${problems.length > 0 ? problems.slice(0, 2).map(p => p.name).join(', ') : 'None'}
                </div>
              </div>

              <div style="padding-top: 5px; border-top: 1px solid #e0e0e0;">
                <div style="font-size: 10px; font-weight: 600; color: #424242; margin-bottom: 3px;">
                  📊 Scores:
                </div>
                <div style="font-size: 9px; line-height: 1.5;">
                  Jobs: <strong style="color: ${issues.jobs >= 60 ? '#388E3C' : '#C62828'};">${issues.jobs}%</strong> •
                  Health: <strong style="color: ${issues.healthcare >= 60 ? '#388E3C' : '#C62828'};">${issues.healthcare}%</strong><br/>
                  Infra: <strong style="color: ${issues.infrastructure >= 60 ? '#388E3C' : '#C62828'};">${issues.infrastructure}%</strong> •
                  Edu: <strong style="color: ${issues.education >= 60 ? '#388E3C' : '#C62828'};">${issues.education}%</strong><br/>
                  Agri: <strong style="color: ${issues.agriculture >= 60 ? '#388E3C' : '#C62828'};">${issues.agriculture}%</strong>
                </div>
              </div>
            </div>
          </div>
        `;
      };

      // Hover events - lightweight tooltip
      map.current.on('mousemove', 'constituency-fills', (e) => {
        if (!map.current || !e.features || e.features.length === 0) return;

        // Close click popup when hovering starts
        if (clickPopup.isOpen()) {
          clickPopup.remove();
          if (clickedStateId !== null) {
            map.current.setFeatureState(
              { source: 'constituencies', id: clickedStateId },
              { clicked: false }
            );
            clickedStateId = null;
          }
        }

        const feature = e.features[0];
        const featureId = feature.id;
        const properties = feature.properties;
        const constituencyName = properties?.AC_NAME;

        map.current.getCanvas().style.cursor = 'pointer';

        // Update hover state
        if (hoveredStateId !== null && hoveredStateId !== featureId) {
          map.current.setFeatureState(
            { source: 'constituencies', id: hoveredStateId },
            { hover: false }
          );
        }

        if (featureId !== undefined) {
          hoveredStateId = featureId as string | number;
          map.current.setFeatureState(
            { source: 'constituencies', id: featureId },
            { hover: true }
          );
        }

        // Show hover popup with sentiment score
        const score = getConstituencySentiment(constituencyName);
        const popupHTML = createHoverPopupHTML(constituencyName, properties, score);
        hoverPopup.setLngLat(e.lngLat).setHTML(popupHTML).addTo(map.current);
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

        // Always remove hover popup
        hoverPopup.remove();
      });

      // Click event - detailed popup
      map.current.on('click', 'constituency-fills', (e) => {
        if (!map.current || !e.features || e.features.length === 0) return;

        const feature = e.features[0];
        const featureId = feature.id;
        const properties = feature.properties;
        const constituencyName = properties?.AC_NAME;

        // Clear previous click state
        if (clickedStateId !== null && clickedStateId !== featureId) {
          map.current.setFeatureState(
            { source: 'constituencies', id: clickedStateId },
            { clicked: false }
          );
        }

        // Set new click state
        if (featureId !== undefined) {
          clickedStateId = featureId as string | number;
          map.current.setFeatureState(
            { source: 'constituencies', id: featureId },
            { clicked: true }
          );
        }

        // Remove hover popup
        hoverPopup.remove();

        // Get sentiment score - use provided data or fall back to default
        const score = sentimentData[constituencyName] || getConstituencySentiment(constituencyName);

        // Create and show detailed popup
        const popupHTML = createClickPopupHTML(constituencyName, properties, score);
        clickPopup.setLngLat(e.lngLat).setHTML(popupHTML).addTo(map.current);

        // Zoom into the clicked constituency
        const geometry = feature.geometry;
        if (geometry && geometry.type === 'Polygon') {
          // Calculate bounds of the constituency
          const coordinates = geometry.coordinates[0];
          const bounds = coordinates.reduce((bounds: any, coord: any) => {
            return bounds.extend(coord);
          }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

          // Fly to the constituency with smooth animation
          map.current.fitBounds(bounds, {
            padding: 100, // Add padding around the constituency
            maxZoom: 10,  // Don't zoom in too much
            duration: 1000, // 1 second smooth animation
          });
        }

        // Callback
        if (onConstituencyClickRef.current) {
          onConstituencyClickRef.current(feature);
        }

        // Handle popup close
        clickPopup.once('close', () => {
          if (!map.current || featureId === undefined) return;
          map.current.setFeatureState(
            { source: 'constituencies', id: featureId },
            { clicked: false }
          );
          clickedStateId = null;
        });
      });

      // Add controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

      // Add custom reset button to return to Tamil Nadu view
      class ResetControl {
        onAdd(map: mapboxgl.Map) {
          const div = document.createElement('div');
          div.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
          div.innerHTML = `
            <button type="button" title="Reset to Tamil Nadu view" style="
              width: 29px;
              height: 29px;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              background: white;
              border: none;
              font-size: 16px;
            ">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                <path d="M3 3v5h5"/>
              </svg>
            </button>
          `;
          div.querySelector('button')?.addEventListener('click', () => {
            map.flyTo({
              center: [78.6569, 11.1271],
              zoom: 6.5,
              duration: 1000,
            });
          });
          return div;
        }
        onRemove() {}
      }

      map.current.addControl(new ResetControl() as any, 'top-right');
      map.current.addControl(
        new mapboxgl.ScaleControl({ maxWidth: 100, unit: 'metric' }),
        'bottom-left'
      );

      // Double-click on map (not on a constituency) to zoom back out to full view
      map.current.on('dblclick', (e) => {
        if (!map.current) return;

        // Check if clicked on a feature
        const features = map.current.queryRenderedFeatures(e.point, {
          layers: ['constituency-fills']
        });

        // If not clicking on a constituency, zoom back to Tamil Nadu view
        if (features.length === 0) {
          map.current.flyTo({
            center: [78.6569, 11.1271],
            zoom: 6.5,
            duration: 1500,
          });
        }
      });

      // IMPORTANT: Force initial color update after map fully loads
      // This ensures sentiment colors are applied immediately on page load/refresh
      setTimeout(() => {
        if (!map.current) return;

        console.log('[Map] Forcing initial color update with default sentiment data');

        const features = (tamilNaduGeoJSON as any).features;
        const colorExpression: any = ['match', ['get', 'AC_NAME']];
        const labelExpression: any = ['match', ['get', 'AC_NAME']];
        const processedNames = new Set<string>();

        features.forEach((feature: any) => {
          const constituencyName = feature.properties.AC_NAME;

          if (processedNames.has(constituencyName)) return;
          processedNames.add(constituencyName);

          // Use default sentiment data immediately
          const score = getConstituencySentiment(constituencyName);
          const color = getSentimentColor(score);

          colorExpression.push(constituencyName, color);
          labelExpression.push(constituencyName, `${score}%`);
        });

        colorExpression.push('#A8D5A8');
        labelExpression.push('');

        map.current.setPaintProperty('constituency-fills', 'fill-color', colorExpression);
        map.current.setLayoutProperty('sentiment-labels', 'text-field', labelExpression);

        console.log('[Map] Initial colors applied successfully');
      }, 500); // Wait 500ms for map to fully load
    });

    // Cleanup
    return () => {
      alertMarkers.current.forEach(marker => marker.remove());
      alertMarkers.current = [];
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  // Update colors and labels when layer or data changes
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) {
      console.log('[Map] Map not ready yet');
      return;
    }

    console.log('[Map] Updating colors with sentiment data count:', Object.keys(sentimentData).length);

    const features = (tamilNaduGeoJSON as any).features;

    // Build color expression for Mapbox
    const colorExpression: any = ['match', ['get', 'AC_NAME']];
    const labelExpression: any = ['match', ['get', 'AC_NAME']];

    // Track processed names to avoid duplicates
    const processedNames = new Set<string>();

    features.forEach((feature: any) => {
      const constituencyName = feature.properties.AC_NAME;

      // Skip if we've already processed this name (handles duplicates)
      if (processedNames.has(constituencyName)) {
        console.log('[Map] Skipping duplicate:', constituencyName);
        return;
      }
      processedNames.add(constituencyName);

      const color = getLayerColor(constituencyName);
      colorExpression.push(constituencyName, color);

      // Add sentiment score as label
      if (activeLayer === 'sentiment') {
        const score = sentimentData[constituencyName] || getConstituencySentiment(constituencyName);
        labelExpression.push(constituencyName, `${score}%`);
      } else if (activeLayer === 'alerts') {
        labelExpression.push(constituencyName, '');
      } else {
        // Issue-specific layers
        const issueKey = activeLayer as 'jobs' | 'healthcare' | 'infrastructure' | 'education' | 'agriculture';
        const issueScore = issueData[constituencyName]?.[activeLayer] || getIssueScore(constituencyName, issueKey);
        labelExpression.push(constituencyName, `${issueScore}%`);
      }
    });

    // Default color for unmatched constituencies - light green like natural maps
    colorExpression.push('#A8D5A8'); // Light natural green for areas without data
    labelExpression.push(''); // Empty label for unmatched

    console.log('[Map] Updating colors. Sample:', colorExpression.slice(0, 10));
    console.log('[Map] Sentiment data keys:', Object.keys(sentimentData).slice(0, 5));

    map.current.setPaintProperty('constituency-fills', 'fill-color', colorExpression);
    map.current.setLayoutProperty('sentiment-labels', 'text-field', labelExpression);

  }, [activeLayer, getLayerColor, sentimentData, issueData]);

  // Handle alert markers
  useEffect(() => {
    if (!map.current || activeLayer !== 'alerts') {
      // Remove existing markers
      alertMarkers.current.forEach(marker => marker.remove());
      alertMarkers.current = [];
      return;
    }

    // Add alert markers
    alertsData.forEach(alert => {
      const el = document.createElement('div');
      el.className = 'alert-marker';
      el.style.width = '30px';
      el.style.height = '30px';
      el.style.borderRadius = '50%';
      el.style.background = alert.severity === 'critical' ? '#F44336' : alert.severity === 'high' ? '#FF9800' : '#FFC107';
      el.style.border = '3px solid white';
      el.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
      el.style.cursor = 'pointer';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.fontWeight = 'bold';
      el.style.color = 'white';
      el.style.fontSize = '16px';
      el.textContent = '!';

      const marker = new mapboxgl.Marker(el)
        .setLngLat([alert.lng, alert.lat])
        .setPopup(new mapboxgl.Popup().setHTML(`
          <div style="padding: 10px;">
            <h4 style="margin: 0 0 8px 0; color: ${alert.severity === 'critical' ? '#F44336' : '#FF9800'};">${alert.title}</h4>
            <p style="margin: 0; font-size: 12px; color: #666;">${alert.description}</p>
            <div style="margin-top: 8px; font-size: 10px; font-weight: bold; color: ${alert.severity === 'critical' ? '#F44336' : '#FF9800'}; text-transform: uppercase;">
              ${alert.severity} Priority
            </div>
          </div>
        `))
        .addTo(map.current!);

      alertMarkers.current.push(marker);
    });

    return () => {
      alertMarkers.current.forEach(marker => marker.remove());
      alertMarkers.current = [];
    };
  }, [activeLayer, alertsData]);

  const layerOptions: Array<{ id: MapLayer; label: string; icon: React.ReactNode; color: string }> = [
    { id: 'sentiment', label: 'Overall Sentiment', icon: <TrendingUp className="w-4 h-4" />, color: '#4CAF50' },
    { id: 'jobs', label: 'Jobs & Employment', icon: <Briefcase className="w-4 h-4" />, color: '#2196F3' },
    { id: 'healthcare', label: 'Healthcare', icon: <Heart className="w-4 h-4" />, color: '#F44336' },
    { id: 'infrastructure', label: 'Infrastructure', icon: <Building className="w-4 h-4" />, color: '#9C27B0' },
    { id: 'education', label: 'Education', icon: <Users className="w-4 h-4" />, color: '#FF9800' },
    { id: 'agriculture', label: 'Agriculture', icon: <Sprout className="w-4 h-4" />, color: '#4CAF50' },
    { id: 'alerts', label: 'Crisis Alerts', icon: <AlertTriangle className="w-4 h-4" />, color: '#F44336' },
  ];

  return (
    <div className="relative">
      <div
        ref={mapContainer}
        style={{ height }}
        className="w-full rounded-lg border-2 border-gray-300 shadow-lg"
      />

      {/* Layer Control */}
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={() => setShowLayerControl(!showLayerControl)}
          className="bg-white rounded-lg shadow-lg p-3 hover:bg-gray-50 transition-colors flex items-center space-x-2"
        >
          <Layers className="w-5 h-5 text-gray-700" />
          <span className="text-sm font-medium text-gray-700">Layers</span>
        </button>

        {showLayerControl && (
          <div className="mt-2 bg-white rounded-lg shadow-xl p-3 space-y-2 max-w-xs">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Map Layers</p>
            {layerOptions.map(option => (
              <button
                key={option.id}
                onClick={() => {
                  setActiveLayer(option.id);
                  setShowLayerControl(false);
                }}
                className={`w-full flex items-center space-x-3 p-2 rounded-lg transition-colors ${
                  activeLayer === option.id
                    ? 'bg-indigo-50 border-2 border-indigo-500'
                    : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                }`}
              >
                <div style={{ color: option.color }}>{option.icon}</div>
                <span className={`text-sm font-medium ${
                  activeLayer === option.id ? 'text-indigo-900' : 'text-gray-700'
                }`}>
                  {option.label}
                </span>
                {activeLayer === option.id && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-indigo-600"></div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Constituency Panel */}
      {selectedConstituency && (
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-xl p-4 max-w-sm z-10">
          <button
            onClick={() => setSelectedConstituency(null)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl font-bold"
          >
            ×
          </button>
          <h3 className="text-lg font-bold text-gray-900 mb-3">
            {selectedConstituency.AC_NAME}
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>District:</strong> {selectedConstituency.DIST_NAME}</p>
            <p><strong>AC Number:</strong> {selectedConstituency.AC_NO}</p>
            <p><strong>Parliamentary:</strong> {selectedConstituency.PC_NAME}</p>
          </div>
        </div>
      )}

      {/* Attribution */}
      <div className="mt-2 text-xs text-gray-500 text-center">
        Constituency data from DataMeet
      </div>

      {/* Popup Styles */}
      <style>{`
        .mapboxgl-popup-content {
          padding: 0;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }

        .hover-popup .mapboxgl-popup-content {
          padding: 12px;
          min-width: 250px;
        }

        .click-popup .mapboxgl-popup-content {
          padding: 0;
          min-width: 180px;
          max-width: 200px;
        }

        .mapboxgl-popup-close-button {
          font-size: 24px;
          padding: 8px 12px;
          color: #666;
          border-radius: 0 12px 0 0;
        }

        .mapboxgl-popup-close-button:hover {
          background: rgba(0,0,0,0.05);
          color: #000;
        }

        .mapboxgl-popup-tip {
          border-top-color: white !important;
          border-bottom-color: white !important;
        }
      `}</style>
    </div>
  );
});

EnhancedMapboxTamilNadu.displayName = 'EnhancedMapboxTamilNadu';
