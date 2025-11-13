# Tamil Nadu Map Implementation - Quick Reference Guide

## At a Glance

### Two Map Systems Running in Parallel

```
╔════════════════════════════════════════════════════════════════╗
║                  MAPBOX GL JS (v3.16.0)                       ║
║              Simple Interactive Base Map                       ║
║                                                                ║
│  Features: 234 Constituencies  │  Interactions: Hover/Click   │
│  Layers: Fill + Border + Labels│  Style: Streets v12          │
│  Token: Environment Variable   │  Center: [78.66, 11.13]      │
╚════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════╗
║                  LEAFLET.JS (v1.9.4)                          ║
║         Advanced Drill-Down Map with Sentiment                ║
║                                                                ║
│  Levels: State→District→Constituency→Booth                    │
│  Tiles: OpenStreetMap            │  Color: Sentiment-based    │
│  Popups: Detailed Info           │  Zoom: 7.5→12             │
╚════════════════════════════════════════════════════════════════╝
```

---

## Component Hierarchy

```
TamilNaduMapDashboard (Page)
│
├─ MapboxTamilNadu
│  ├─ Source: tamilnadu-constituencies.json
│  ├─ Layer: constituency-fills (color-coded)
│  ├─ Layer: constituency-borders (white lines)
│  └─ Layer: constituency-labels (AC_NAME)
│
└─ TamilNaduMap (Leaflet Drill-Down)
   ├─ LeafletChoropleth
   │  ├─ Layer: GeoJSON (sentiment-colored)
   │  └─ Tiles: OpenStreetMap
   ├─ DrillDownControls (Breadcrumb Nav)
   ├─ ConstituencyPopup (Detail Dialog)
   ├─ PollingBoothMarkers (Booth Markers)
   └─ SentimentLegend (Color Scale)

Additional Components:
├─ EnhancedWardHeatmap (Table-based heatmap)
├─ SentimentHeatmap (Simple grid heatmap)
└─ BoothsMap (Polling Booth Focused)
```

---

## Data Structure Summary

### Geographic Hierarchy
```
TN State
├── District (38 total)
│   ├── Code: TN01-TN38
│   ├── Sentiment: {positive, neutral, negative, overall, confidence}
│   └── Constituencies (234 total)
│       ├── Code: TN001-TN234
│       ├── Type: 'General', 'SC', 'ST'
│       ├── Sentiment: {positive, neutral, negative, overall, confidence}
│       └── Polling Booths (thousands)
│           └── Location: {lat, lng}
│
PY State (Puducherry)
├── District (4 total)
└── Constituencies (30 total)
```

### Database Tables
```
sentiment_data
├── sentiment (0-1)
├── polarity ('positive'|'negative'|'neutral')
├── issue_id (FK)
├── district_id (FK)
├── constituency_id (FK)
├── ward (TEXT)
└── timestamp

districts / constituencies / wards
├── name
├── code
├── state_id
├── sentiment
├── center coordinates
└── voter information
```

---

## Color Mapping (Sentiment → Color)

```
VALUE         LEAFLET               MAPBOX            CSS CLASS
                                                      
Very Positive  #15803d (Green-700)   #22c55e (Green)   bg-green-700
Positive       #16a34a (Green-600)   #4CAF50 (Green)   bg-green-600
Slightly +     #22c55e (Green-500)   #2196F3 (Blue)*   bg-green-500
Neutral        #eab308 (Yellow)      #eab308 (Yellow)  bg-yellow-500
Slightly -     #ef4444 (Red-500)     #ef4444 (Red)     bg-red-500
Negative       #dc2626 (Red-600)     #991b1b (Red)     bg-red-600
Very Negative  #991b1b (Red-800)     N/A               bg-red-800
No Data        #9ca3af (Gray-400)    #9ca3af (Gray)    bg-gray-400

*Mapbox uses blue for hover state instead of color progression
```

---

## API Functions (dashboardService.ts)

```
getLocationSentiment()
  Input:  (none)
  Output: LocationSentiment[] {district, sentiment, ward_count}
  Query:  sentiment_data grouped by district (7 days)
  Return: Array sorted by sentiment descending

getIssueSentiment()
  Input:  (none)
  Output: IssueSentiment[] {issue, sentiment, volume, trend, polarity}
  Query:  sentiment_data grouped by issue (7 days)
  Return: Array sorted by volume descending

getDashboardMetrics()
  Input:  (none)
  Output: DashboardMetrics {overallSentiment, alerts, trends, etc.}
  Query:  sentiment_data (last 24h and 7d for trends)
  Return: Single metrics object

getDashboardData(dateRange: 'today'|'week'|'month'|'quarter'|'all')
  Input:  Date range filter
  Output: Comprehensive export object
  Query:  All dashboard functions combined
  Return: Full dashboard data snapshot
```

---

## Interaction Map

```
MAPBOX INTERACTIONS:
┌─────────────────────────────────┐
│ Hover over constituency fill    │ → Popup appears with details
│                                 │ → Fill color changes to blue
│                                 │ → Opacity increases
├─────────────────────────────────┤
│ Click on constituency fill      │ → FlyTo animation (1000ms)
│                                 │ → Zoom to level 10
│                                 │ → Sidebar panel shows
│                                 │ → setFeatureState(hover: true)
├─────────────────────────────────┤
│ Zoom controls                   │ → Show labels at zoom >= 8
│ Fullscreen button               │ → Native fullscreen API
│ Scale indicator                 │ → Metric scale at bottom
└─────────────────────────────────┘

LEAFLET INTERACTIONS:
┌─────────────────────────────────┐
│ Hover over region               │ → Border thickness: 4px
│                                 │ → Color: #1e40af (blue-800)
│                                 │ → Opacity: 0.85
│                                 │ → Tooltip with percentages
├─────────────────────────────────┤
│ Click on region                 │ → fitBounds with 50px padding
│                                 │ → Popup dialog appears
│                                 │ → Can drill-down further
├─────────────────────────────────┤
│ Click breadcrumb control        │ → Navigate to level
│                                 │ → Load corresponding GeoJSON
│                                 │ → Zoom to bounds
└─────────────────────────────────┘
```

---

## GeoJSON Files

| File | Size | Features | Used By |
|------|------|----------|---------|
| tamilnadu-state.json | 1.2 KB | 1 | State level view |
| tamilnadu-districts-full.json | 2.1 MB | 32 | District drill-down |
| tamilnadu-constituencies-full.json | 2.2 MB | 234 | Constituency drill-down |
| tamilnadu-constituencies.json | 63+ KB | 234 | MapboxTamilNadu |

Properties in GeoJSON:
- AC_NO: "1"
- AC_NAME: "Aambur"
- PC_NAME: "Chengalpattu"
- DIST_NAME: "Chengalpattu"
- ST_CODE: "TN"

---

## Known Capabilities

### Implemented
- ✅ Interactive constituency boundaries (Mapbox)
- ✅ 4-level drill-down navigation (Leaflet)
- ✅ Sentiment-based color choropleth
- ✅ Hover and click interactions
- ✅ Fullscreen and zoom controls
- ✅ OpenStreetMap basemap
- ✅ GeoJSON styling and events
- ✅ Constituency and district lookups
- ✅ Ward-level heatmap (table-based)
- ✅ Data export (CSV, Excel, PDF, JSON)

### Not Yet Implemented
- Continuous heatmap (Mapbox heatmap layer)
- Temporal animation / timeline playback
- Ward-level geographic visualization
- Live sentiment data binding from database
- Constituency-level database queries
- Clustering (at high zoom out)
- Custom marker icons (scaled)
- Vector tiles optimization
- 3D extrusion
- Heat density visualization

---

## File Locations Summary

```
Core Components:
/src/components/maps/
  ├── MapboxTamilNadu.tsx       (Main Mapbox map)
  ├── TamilNaduMap.tsx           (Leaflet drill-down)
  ├── LeafletChoropleth.tsx      (Choropleth renderer)
  ├── DrillDownControls.tsx      (Breadcrumb nav)
  ├── ConstituencyPopup.tsx      (Detail dialog)
  ├── SentimentLegend.tsx        (Color scale)
  └── PollingBoothMarkers.tsx    (Booth markers)

Data:
/src/data/
  ├── tamilnadu-data.ts         (264 constituencies + 38 districts)
  ├── polling-booths-sample.ts  (Sample booth data)
  └── geo/
      ├── tamilnadu-state.json
      ├── tamilnadu-districts-full.json
      ├── tamilnadu-constituencies-full.json
      └── tamilnadu-constituencies.json

Services:
/src/services/
  └── dashboardService.ts       (Data queries & aggregations)

Types:
/src/types/
  └── geography.ts              (Geographic type definitions)

Pages:
/src/pages/
  ├── TamilNaduMapDashboard.tsx (Main page)
  ├── RegionalMap.tsx            (Regional view)
  └── BoothsMap.tsx              (Booth view)
```

---

## Quick Navigation

**To modify map colors:**
- Mapbox colors: MapboxTamilNadu.tsx (lines 63-75)
- Leaflet colors: LeafletChoropleth.tsx (lines 63-84)

**To change data source:**
- Static data: tamilnadu-data.ts
- Database data: dashboardService.ts

**To add new drill-down level:**
- Create new GeoJSON file
- Add handler to TamilNaduMap.tsx (drillDownTo* functions)
- Update DrillDownControls.tsx breadcrumbs

**To implement sentiment coloring:**
- Enrich GeoJSON with sentiment in component
- Pass getSentiment() callback to LeafletChoropleth
- Update style function to use dynamic colors

---

**Last Updated:** 2025-11-13
**Dashboard:** Pulse of People v1.0
**Region:** Tamil Nadu (234 constituencies, 38 districts)

