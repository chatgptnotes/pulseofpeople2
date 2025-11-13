# Tamil Nadu Sentiment Analysis Dashboard - Map Implementation Deep Dive

## Executive Summary

This document provides a comprehensive exploration of the current map implementation in the Pulse of People Tamil Nadu sentiment analysis dashboard. The system uses **Mapbox GL JS** and **Leaflet** to visualize electoral sentiment data across Tamil Nadu's 234 assembly constituencies and 38 districts.

---

## 1. CURRENT MAP COMPONENTS

### 1.1 MapboxTamilNadu Component
**File:** `/src/components/maps/MapboxTamilNadu.tsx`

**Purpose:** Interactive Mapbox-based map displaying all 234 Tamil Nadu constituencies with clickable boundaries

**Key Features:**
- Displays constituency boundaries from GeoJSON
- Interactive color-coded fill layer (sentiment-based)
- Hover effects showing constituency details
- Click-to-zoom functionality
- Constituency labels (shown at zoom level 8+)
- Navigation, fullscreen, and scale controls

**Data Layers:**
1. **constituency-fills** - Color-coded regions (green default: #4CAF50, blue on hover: #2196F3)
2. **constituency-borders** - White borders between constituencies (line-width: 1px)
3. **constituency-labels** - Text labels showing AC_NAME property

**Interaction Features:**
- **Hover:** Changes fill color to blue, increases opacity, shows popup with constituency info
- **Click:** Zooms to constituency (flyTo with 1000ms animation), displays sidebar panel
- **Popup Content:** AC_NAME, DIST_NAME, AC_NO, PC_NAME

**Data Flow:**
```
tamilnadu-constituencies.json → Mapbox Source → Fill/Line/Label Layers → Interactive Events
```

**GeoJSON Properties Used:**
- AC_NAME: Assembly Constituency Name
- DIST_NAME: District Name
- AC_NO: Constituency Number
- PC_NAME: Parliamentary Constituency
- ST_CODE: State Code

**Mapbox Token:** Uses environment variable for API access

---

### 1.2 TamilNaduMap Component (Leaflet-based)
**File:** `/src/components/maps/TamilNaduMap.tsx`

**Purpose:** Advanced 4-level drill-down map system using Leaflet

**Drill-Down Architecture:**
```
State (TN) → Districts (32) → Constituencies (234) → Polling Booths (thousands)
```

**Supported Drill-Down Levels:**
1. **State Level:** Tamil Nadu boundary at zoom 7.5
2. **District Level:** 32 district boundaries at zoom 8
3. **Constituency Level:** 234 assembly constituency boundaries at zoom 10
4. **Booth Level:** Individual polling booth markers at zoom 12

**Key Components:**
- **LeafletChoropleth** - Renders GeoJSON with sentiment-based coloring
- **DrillDownControls** - Breadcrumb navigation showing current level
- **ConstituencyPopup** - Detailed information dialog
- **PollingBoothMarkers** - Marker layer for booth-level view
- **SentimentLegend** - Color scale legend

---

### 1.3 LeafletChoropleth Component
**File:** `/src/components/maps/LeafletChoropleth.tsx`

**Purpose:** Core choropleth (color-coded region) mapping component

**Libraries Used:**
- Leaflet 1.9.4
- OpenStreetMap tiles as basemap

**Styling System:**
```
Feature Properties → getSentiment(featureId) → SentimentScore → Color Calculation
```

**Color Mapping Logic:**
```
Positive Sentiment:
  - >= 70%: #15803d (green-700)
  - >= 60%: #16a34a (green-600)
  - < 60%: #22c55e (green-500)

Negative Sentiment:
  - >= 40%: #991b1b (red-800)
  - >= 30%: #dc2626 (red-600)
  - < 30%: #ef4444 (red-500)

Neutral Sentiment: #eab308 (yellow-500)
No Data: #9ca3af (gray-400)
```

**Interaction Features:**
- **Hover:** Weight increases to 4px, opacity to 0.85, blue color (#1e40af)
- **Click:** Fits map bounds to feature with 50px padding
- **Tooltips:** Hover tooltips showing percentage breakdown (positive, neutral, negative)

**Feature Property Compatibility:**
- Supports DataMeet format: `DISTRICT`, `AC_NAME`
- Supports custom format: `code`, `name`

---

### 1.4 EnhancedWardHeatmap Component
**File:** `/src/components/maps/EnhancedWardHeatmap.tsx`

**Purpose:** Ward-level sentiment heatmap (table-based visualization)

**Data Structure:**
```typescript
HeatmapData {
  ward: string
  issue: string
  sentiment: number (0-1)
  dataSource: 'survey' | 'social_media' | 'field_worker' | 'feedback' | 'manual'
  timestamp: Date
  sampleSize: number
  confidence: number (0-1)
}
```

**Features:**
- Grid-based heatmap with wards as rows, issues as columns
- Color intensity based on sentiment score
- Sample size and confidence metadata
- Three-tab interface: Heatmap View, Data Collection, Analytics
- Data export functionality (JSON)

---

## 2. DATABASE SCHEMA FOR GEOGRAPHIC DATA

### 2.1 Tables Structure

**sentiment_data Table:**
```sql
CREATE TABLE sentiment_data (
    id UUID PRIMARY KEY,
    issue_id UUID REFERENCES issues(id),
    sentiment NUMERIC(3,2),
    polarity VARCHAR(20), -- 'positive', 'negative', 'neutral'
    district_id UUID REFERENCES districts(id),
    constituency_id UUID REFERENCES constituencies(id),
    ward VARCHAR(100),
    timestamp TIMESTAMPTZ,
    
    -- Indexes for query performance
    INDEX idx_sentiment_data_issue (issue_id, timestamp DESC)
    INDEX idx_sentiment_data_constituency (constituency_id, timestamp DESC)
    INDEX idx_sentiment_data_district (district_id, timestamp DESC)
    INDEX idx_sentiment_data_ward (ward)
    INDEX idx_sentiment_data_timestamp (timestamp DESC)
)
```

**districts Table:**
```sql
CREATE TABLE districts (
    id UUID PRIMARY KEY,
    name VARCHAR(100),
    state_id UUID REFERENCES states(id),
    code VARCHAR(10),
    center_lat NUMERIC,
    center_lng NUMERIC,
    total_wards INTEGER,
    created_at TIMESTAMPTZ
)
```

**constituencies Table:**
```sql
CREATE TABLE constituencies (
    id UUID PRIMARY KEY,
    name VARCHAR(200),
    state_id UUID REFERENCES states(id),
    district_id UUID REFERENCES districts(id),
    code VARCHAR(10), -- e.g., TN001-TN234
    constituency_type VARCHAR(50), -- 'General', 'SC', 'ST'
    total_voters INTEGER,
    polling_booths INTEGER,
    total_wards INTEGER,
    created_at TIMESTAMPTZ,
    
    INDEX idx_constituencies_district (district_id)
    INDEX idx_constituencies_code (code)
)
```

**wards Table:**
```sql
CREATE TABLE wards (
    id UUID PRIMARY KEY,
    name VARCHAR(200),
    district_id UUID REFERENCES districts(id),
    constituency_id UUID REFERENCES constituencies(id),
    code VARCHAR(50),
    created_at TIMESTAMPTZ
)
```

---

### 2.2 Issue Categories

**Issue Categories in Database:**
From dashboardService, TVK's 9 priority issues are tracked:

1. **Jobs & Employment** (Highest volume, lower sentiment)
2. **Education** (Medium volume, positive sentiment)
3. **Healthcare** (Medium volume, positive sentiment)
4. **Infrastructure** (Medium volume, mixed sentiment)
5. **Agriculture** (Medium volume, stable sentiment)
6. **Social Justice** (Lower volume, positive sentiment)
7. **Women Empowerment** (Lower volume, positive sentiment)
8. **Environment** (Lower volume, stable sentiment)
9. **Law & Order** (Lowest volume, negative sentiment)

---

### 2.3 Sentiment Data Fields

**Available fields for visualization:**
```
sentiment_data {
    sentiment: number (0-1)      -- Overall sentiment score
    sentiment: number (%)         -- Percentage score
    polarity: string              -- 'positive', 'negative', 'neutral'
    issue_id: UUID                -- Links to issue category
    district_id: UUID             -- Geographic location (district level)
    constituency_id: UUID         -- Geographic location (constituency level)
    ward: string                  -- Geographic location (ward level)
    timestamp: date               -- Time of measurement
    source: string                -- Data source (social_media, survey, field_reports, etc.)
}
```

---

## 3. CURRENT DATA FLOW

### 3.1 Dashboard Service API Functions

**File:** `/src/services/dashboardService.ts`

**Location-Based Data Functions:**

#### 1. `getLocationSentiment()`
```typescript
Query: SELECT district, state, sentiment, ward FROM sentiment_data
        WHERE timestamp >= 7 days ago AND district IS NOT NULL
        
Output: LocationSentiment[] {
    id: string                   // "LOC-{district-name}"
    title: string               // District name
    value: number               // Sentiment percentage (0-100)
    sentiment: number           // Decimal (0-1)
    ward_count?: number         // Number of wards
    district?: string           // District name
}

Aggregation: Groups by district, calculates average sentiment
Fallback: Demo data for 5 major districts (Chennai, Coimbatore, Madurai, Salem, Tiruchirappalli)
```

#### 2. `getIssueSentiment()`
```typescript
Query: SELECT issue, sentiment, polarity FROM sentiment_data
        WHERE timestamp >= 7 days ago
        
Output: IssueSentiment[] {
    issue: string               // Issue category name
    sentiment: number           // Average (0-1)
    volume: number              // Number of mentions
    trend: 'up' | 'down' | 'stable'
    polarity: {
        positive: number        // %
        negative: number        // %
        neutral: number         // %
    }
}

Sorting: By volume (descending)
```

#### 3. `getDashboardMetrics()`
```typescript
Returns: DashboardMetrics {
    overallSentiment: number         // 0-100
    activeConversations: number      // Last 24h mentions
    criticalAlerts: number           // High/Critical severity
    topIssue: string                 // Most mentioned issue
    constituenciesCovered: number    // 264 (TN + Puducherry)
    sentimentTrend: 'improving' | 'declining' | 'stable'
}
```

### 3.2 Geographic Data Hierarchy

**Frontend Data Structure:**
```
src/data/tamilnadu-data.ts (585 lines)
├── States (2)
│   ├── Tamil Nadu (34 districts, 234 constituencies)
│   └── Puducherry (4 districts, 30 constituencies)
├── Districts (38 total)
│   └── Each with: code, name, constituencies[], sentiment, totalVoters
├── Assembly Constituencies (264 total)
│   └── Each with: code, name, districtCode, sentiment, voters, booths
└── Sentiment Helpers
    ├── getSentimentColor()
    ├── getDistrictByName()
    └── getConstituencyByName()
```

### 3.3 Data Lookup Strategy

**Multi-level matching for GeoJSON compatibility:**

```javascript
// Feature identification order:
1. feature.properties.code (custom format: TN001, TN002)
2. feature.properties.DISTRICT (DataMeet format)
3. feature.properties.AC_NAME (DataMeet format)
4. feature.properties.name (generic fallback)

// Then lookup sentiment:
const sentiment = getSentiment(featureId)
```

---

## 4. MAP LIBRARIES AND DEPENDENCIES

### 4.1 Installed Map Libraries

**From package.json:**

| Library | Version | Purpose |
|---------|---------|---------|
| **mapbox-gl** | ^3.16.0 | Interactive vector maps with GL rendering |
| **leaflet** | ^1.9.4 | Open-source mapping library |
| **react-leaflet** | ^4.2.1 | React wrapper for Leaflet |

### 4.2 Mapbox GL JS Capabilities Used

**Version:** 3.16.0 (latest)

**Features Implemented:**
- ✅ Raster tile basemap (mapbox://styles/mapbox/streets-v12)
- ✅ GeoJSON source with 234 features
- ✅ Fill layer with sentiment-based color
- ✅ Line layer for boundaries
- ✅ Symbol layer for text labels
- ✅ Feature state for hover effects
- ✅ Popups (HTML tooltips)
- ✅ Controls (navigation, fullscreen, scale)
- ✅ FlyTo animation (1000ms, easing)

**Features NOT Yet Implemented:**
- ❌ Heatmap layers (for continuous data like ward sentiment)
- ❌ 3D building extrusion
- ❌ Clustering
- ❌ Custom layer blending
- ❌ Image layers for reference maps
- ❌ Vector tiles source

### 4.3 Leaflet Capabilities Used

**Version:** 1.9.4

**Features Implemented:**
- ✅ GeoJSON layer with style function
- ✅ Choropleth coloring
- ✅ Popup/tooltip binding
- ✅ Click/hover events
- ✅ FitBounds animation
- ✅ OpenStreetMap tiles
- ✅ Feature state management

**Features NOT Yet Implemented:**
- ❌ Clustering plugins
- ❌ Heat map layer (heatmap.js integration)
- ❌ Markercluster
- ❌ Custom icon rendering at scale

### 4.4 GeoJSON Data Assets

**Location:** `/src/data/geo/`

| File | Size | Features | Source |
|------|------|----------|--------|
| `tamilnadu-state.json` | 1.2 KB | 1 (state boundary) | DataMeet |
| `tamilnadu-districts-full.json` | 2.1 MB | 32 districts | DataMeet |
| `tamilnadu-constituencies-full.json` | 2.2 MB | 234 constituencies | DataMeet |
| `tamilnadu-constituencies.json` | 63+ KB | 234 constituencies (simplified) | DataMeet/Custom |

**Property Structure (from DataMeet):**
```json
{
    "AC_NO": "1",
    "AC_NAME": "Aambur",
    "PC_NAME": "Chengalpattu",
    "DIST_NAME": "Chengalpattu",
    "ST_CODE": "TN"
}
```

---

## 5. CURRENT IMPLEMENTATION SUMMARY

### 5.1 Component Architecture

```
TamilNaduMapDashboard (Page)
├── MapboxTamilNadu (Main Interactive Map)
│   ├── Source: tamilnadu-constituencies.json
│   ├── Layers: fills, borders, labels
│   └── Controls: Navigation, Fullscreen, Scale
│
└── TamilNaduMap (Advanced Drill-Down)
    ├── LeafletChoropleth (Map Renderer)
    │   ├── Basemap: OpenStreetMap
    │   ├── Layer: GeoJSON with style function
    │   └── Controls: Zoom, Pan
    ├── DrillDownControls (Breadcrumb Nav)
    ├── ConstituencyPopup (Detail Dialog)
    ├── PollingBoothMarkers (Booth Layer)
    └── SentimentLegend (Color Scale)
```

### 5.2 Data Integration Points

```
dashboardService.ts
├── getLocationSentiment()      → LocationSentiment[] (District-level)
├── getIssueSentiment()         → IssueSentiment[] (Issue-level)
├── getDashboardMetrics()       → DashboardMetrics (Overall stats)
└── getDashboardData()          → Comprehensive export

tamilnadu-data.ts
├── Districts (38)              → Sentiment scores
├── Constituencies (264)        → Sentiment scores
└── Helper functions            → Lookups & color mapping

GeoJSON Files
├── State boundaries            → State-level view
├── District boundaries         → District-level view
└── Constituency boundaries     → Constituency-level view
```

### 5.3 Sentiment Visualization

**Current Approach:** Static color mapping based on sentiment property

**Color Scale:**
```
Negative ← Neutral → Positive
  Red     Yellow    Green
```

**Limitations:**
- No continuous heatmap (currently chunk-based choropleth)
- No temporal animation (snapshot only)
- Ward-level limited to heatmap table (not geographic map)

---

## 6. KEY FILES AND LOCATIONS

### Map Components
- `/src/components/maps/MapboxTamilNadu.tsx` - Mapbox main map
- `/src/components/maps/TamilNaduMap.tsx` - Leaflet drill-down map
- `/src/components/maps/LeafletChoropleth.tsx` - Choropleth layer
- `/src/components/maps/DrillDownControls.tsx` - Breadcrumb navigation
- `/src/components/maps/ConstituencyPopup.tsx` - Detail dialog
- `/src/components/maps/SentimentLegend.tsx` - Color legend
- `/src/components/maps/PollingBoothMarkers.tsx` - Booth markers

### Data Files
- `/src/data/tamilnadu-data.ts` - 38 districts, 264 constituencies
- `/src/data/polling-booths-sample.ts` - Sample booth locations
- `/src/data/geo/tamilnadu-*.json` - GeoJSON boundaries

### Services
- `/src/services/dashboardService.ts` - Data queries and aggregations
- `/src/types/geography.ts` - Geographic type definitions

### Pages
- `/src/pages/TamilNaduMapDashboard.tsx` - Main dashboard page
- `/src/pages/RegionalMap.tsx` - Regional view page
- `/src/pages/BoothsMap.tsx` - Polling booth map

---

## 7. EXISTING HEATMAP IMPLEMENTATIONS

### 7.1 SentimentHeatmap (Simple Grid)
**File:** `/src/components/SentimentHeatmap.tsx`
- Simple table-based heatmap (wards × issues)
- No geographic visualization
- Color scale: Red (0.0) → Yellow → Green (1.0)

### 7.2 EnhancedWardHeatmap (Advanced Grid)
**File:** `/src/components/EnhancedWardHeatmap.tsx`
- Advanced ward heatmap with data provenance
- Includes sample size and confidence scores
- Three views: Heatmap, Data Collection, Analytics
- Data export capability

---

## 8. INTEGRATION POINTS FOR ENHANCEMENT

### 8.1 Sentiment-Based Coloring Integration

**Current Flow:**
```
MapboxTamilNadu:
  tamilnadu-constituencies.json
  → Fill color: Static (green/blue)
  → No sentiment integration

TamilNaduMap:
  GeoJSON + getSentiment()
  → Dynamic color from sentiment property
  → Pulled from static tamilnadu-data.ts
```

**To Enable Database-Driven Sentiment:**
```
1. Modify dashboardService.getLocationSentiment()
   → Return SentimentScore for each constituency

2. Update TamilNaduMap to fetch constituency-level sentiment
   → Query by constituency_id

3. EnrichGeoJSON in component
   → Add sentiment property before rendering
```

### 8.2 Ward-Level Mapping Integration

**Current Limitation:**
- Ward sentiment only shown in EnhancedWardHeatmap table
- Not integrated into geographic map

**To Add Geographic Ward Layer:**
```
1. Create ward-level GeoJSON (from polygon data)
   
2. Add WardChoropleth layer to TamilNaduMap
   → Triggered at constituency drill-down level
   
3. Fetch ward sentiment from database
   → Query: SELECT * FROM sentiment_data WHERE ward = ?
   
4. Render as choropleth with sentiment colors
```

### 8.3 Temporal Animation Support

**Current Limitation:**
- Maps show snapshot sentiment only
- No timeline playback

**To Add Timeline:**
```
1. Add date range picker to component

2. Fetch sentiment data with timestamps:
   → Query: SELECT * FROM sentiment_data 
             WHERE timestamp BETWEEN ? AND ?

3. Implement animation framework:
   → Leaflet: Update layer colors frame-by-frame
   → Mapbox: Use setFeatureState() to update colors

4. Play/pause/scrub controls
```

---

## APPENDIX: CODE SNIPPETS

### A. MapboxTamilNadu Map Initialization
```typescript
mapboxgl.accessToken = MAPBOX_TOKEN;
const map = new mapboxgl.Map({
  container: mapContainer.current,
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [78.6569, 11.1271], // TN center
  zoom: 6.5,
});

// Add GeoJSON source
map.addSource('constituencies', {
  type: 'geojson',
  data: tamilNaduGeoJSON
});

// Add fill layer with sentiment coloring
map.addLayer({
  id: 'constituency-fills',
  type: 'fill',
  source: 'constituencies',
  paint: {
    'fill-color': ['case',
      ['boolean', ['feature-state', 'hover'], false],
      '#2196F3', // Blue on hover
      '#4CAF50'  // Green default
    ],
    'fill-opacity': 0.4
  }
});
```

### B. LeafletChoropleth Sentiment Color Logic
```typescript
const getSentimentColor = (sentiment: SentimentScore | undefined): string => {
  if (!sentiment) return '#9ca3af'; // gray-400
  
  const { overall, positive } = sentiment;
  
  if (overall === 'positive') {
    if (positive >= 70) return '#15803d'; // green-700
    if (positive >= 60) return '#16a34a'; // green-600
    return '#22c55e'; // green-500
  }
  
  if (overall === 'negative') {
    if (sentiment.negative >= 40) return '#991b1b'; // red-800
    if (sentiment.negative >= 30) return '#dc2626'; // red-600
    return '#ef4444'; // red-500
  }
  
  return '#eab308'; // yellow-500 (neutral)
};
```

### C. Sentiment Lookup with Fallback
```typescript
const getSentiment = useCallback((featureId: string): SentimentScore | undefined => {
  // Try direct lookup by code
  const districtByCode = allDistricts[featureId];
  if (districtByCode?.sentiment) return districtByCode.sentiment;
  
  const constituencyByCode = assemblyConstituencies[featureId];
  if (constituencyByCode?.sentiment) return constituencyByCode.sentiment;
  
  // Try lookup by name (DataMeet compatibility)
  const districtByName = getDistrictByName(featureId);
  if (districtByName?.sentiment) return districtByName.sentiment;
  
  const constituencyByName = getConstituencyByName(featureId);
  if (constituencyByName?.sentiment) return constituencyByName.sentiment;
  
  // Fallback to state
  if (featureId === 'TN') return tamilNaduState.sentiment;
  if (featureId === 'PY') return pondicherryState.sentiment;
  
  return undefined;
}, []);
```

---

**Document Generated:** 2025-11-13
**Dashboard Version:** 1.0.0
**Target Region:** Tamil Nadu (38 districts, 234 constituencies)

