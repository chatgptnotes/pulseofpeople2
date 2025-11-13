/**
 * Geographic Types for Tamil Nadu and Pondicherry
 * Supports 4-level drill-down: State → District → Constituency → Polling Booth
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GeoJSONFeature {
  type: 'Feature';
  properties: {
    name: string;
    code?: string;
    [key: string]: any;
  };
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

export interface PollingBooth {
  id: string;
  name: string;
  boothNumber: string;
  constituencyCode: string;
  location: Coordinates;
  totalVoters: number;
  address: string;
  sentiment?: SentimentScore;
}

/**
 * Reservation Categories for Tamil Nadu Assembly Constituencies
 * Historical and current reservation types
 */
export enum ReservationType {
  UNRESERVED = 'Unreserved',
  SCHEDULED_CASTE = 'Scheduled Castes',
  SCHEDULED_TRIBE = 'Scheduled Tribes',
  WOMEN = 'Women',
  MUSLIMS = 'Muslims',
  CHRISTIANS = 'Christians',
  LANDHOLDERS = 'Landholders',
  COMMERCE_INDUSTRY = 'Commerce and Industry',
  LABOUR_TRADE_UNIONS = 'Labour and Trade Unions',
  EUROPEANS = 'Europeans',
  ANGLO_INDIANS = 'Anglo-Indians',
  UNIVERSITY = 'University',
}

/**
 * Elected Member Information
 */
export interface ElectedMember {
  name: string;
  party: string;
  alliance?: string;
  electionYear: number;
  termStart: string; // ISO date
  termEnd?: string; // ISO date
  votesReceived?: number;
  votePercentage?: number;
}

export interface AssemblyConstituency {
  code: string; // e.g., TN001, TN002
  constituencyNumber: number; // 1-234 for Tamil Nadu
  name: string;
  districtCode: string;
  reservationType: ReservationType;
  center: Coordinates;
  totalVoters: number;
  pollingBooths: number;
  sentiment?: SentimentScore;
  parliamentaryConstituency?: string;

  // Current elected member
  currentMember?: ElectedMember;

  // Historical data
  electionHistory?: ElectedMember[];

  // Metadata
  areaKm2?: number;
  formationYear?: number;
  lastReserved?: number; // Year when reservation was applied
  remarks?: string;
}

export interface District {
  code: string;
  name: string;
  stateCode: string;
  center: Coordinates;
  constituencies: string[]; // Array of constituency codes
  totalVoters: number;
  area: number; // in sq km
  sentiment?: SentimentScore;
}

export interface State {
  code: string;
  name: string;
  districts: string[]; // Array of district codes
  totalConstituencies: number;
  totalVoters: number;
  center: Coordinates;
  sentiment?: SentimentScore;
}

export interface SentimentScore {
  positive: number; // 0-100
  neutral: number; // 0-100
  negative: number; // 0-100
  overall: 'positive' | 'neutral' | 'negative';
  confidence: number; // 0-1
  lastUpdated: string;
}

export interface MapDrillDownLevel {
  level: 'state' | 'district' | 'constituency' | 'booth';
  selectedStateCode?: string;
  selectedDistrictCode?: string;
  selectedConstituencyCode?: string;
  bounds?: [[number, number], [number, number]]; // [SW, NE] corners
}

export interface MapViewState {
  center: Coordinates;
  zoom: number;
  drillDown: MapDrillDownLevel;
}

export interface ChloroplethData {
  featureId: string;
  value: number; // 0-100 sentiment score
  color: string;
  label: string;
}

// Tamil Nadu specific enums
export enum TNDistrict {
  ARIYALUR = 'TN01',
  CHENGALPATTU = 'TN02',
  CHENNAI = 'TN03',
  COIMBATORE = 'TN04',
  CUDDALORE = 'TN05',
  DHARMAPURI = 'TN06',
  DINDIGUL = 'TN07',
  ERODE = 'TN08',
  KALLAKURICHI = 'TN09',
  KANCHIPURAM = 'TN10',
  KANYAKUMARI = 'TN11',
  KARUR = 'TN12',
  KRISHNAGIRI = 'TN13',
  MADURAI = 'TN14',
  MAYILADUTHURAI = 'TN15',
  NAGAPATTINAM = 'TN16',
  NAMAKKAL = 'TN17',
  NILGIRIS = 'TN18',
  PERAMBALUR = 'TN19',
  PUDUKKOTTAI = 'TN20',
  RAMANATHAPURAM = 'TN21',
  RANIPET = 'TN22',
  SALEM = 'TN23',
  SIVAGANGAI = 'TN24',
  TENKASI = 'TN25',
  THANJAVUR = 'TN26',
  THENI = 'TN27',
  THOOTHUKUDI = 'TN28',
  TIRUCHIRAPPALLI = 'TN29',
  TIRUNELVELI = 'TN30',
  TIRUPATHUR = 'TN31',
  TIRUPPUR = 'TN32',
  TIRUVALLUR = 'TN33',
  TIRUVANNAMALAI = 'TN34',
  TIRUVARUR = 'TN35',
  VELLORE = 'TN36',
  VILUPPURAM = 'TN37',
  VIRUDHUNAGAR = 'TN38',
}

export enum PondicherryDistrict {
  PUDUCHERRY = 'PY01',
  KARAIKAL = 'PY02',
  MAHE = 'PY03',
  YANAM = 'PY04',
}
