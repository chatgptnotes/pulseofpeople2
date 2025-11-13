/**
 * Sample Polling Booth Data for Tamil Nadu
 * In production, this would be loaded from a database or API
 */

import { PollingBooth, SentimentScore } from '../types/geography';

// Helper to generate random sentiment
const generateSentiment = (): SentimentScore => {
  const positive = Math.floor(Math.random() * 40) + 40; // 40-80
  const negative = Math.floor(Math.random() * 20) + 5; // 5-25
  const neutral = 100 - positive - negative;

  return {
    positive,
    neutral,
    negative,
    overall: positive > 50 ? 'positive' : negative > 40 ? 'negative' : 'neutral',
    confidence: Math.random() * 0.3 + 0.7, // 0.7-1.0
    lastUpdated: new Date().toISOString()
  };
};

// Chennai - T. Nagar Constituency (TN015) - Sample Booths
export const tNagarPollingBooths: PollingBooth[] = [
  {
    id: 'TN015-001',
    name: 'Corporation Primary School, Rangarajapuram',
    boothNumber: '001',
    constituencyCode: 'TN015',
    location: { lat: 13.0389, lng: 80.2325 },
    totalVoters: 1234,
    address: 'Rangarajapuram Main Road, T. Nagar, Chennai - 600017',
    sentiment: generateSentiment()
  },
  {
    id: 'TN015-002',
    name: 'Govt. Girls Higher Secondary School, West Mambalam',
    boothNumber: '002',
    constituencyCode: 'TN015',
    location: { lat: 13.0342, lng: 80.2289 },
    totalVoters: 1456,
    address: 'Arya Gowda Road, West Mambalam, Chennai - 600033',
    sentiment: generateSentiment()
  },
  {
    id: 'TN015-003',
    name: 'Corporation Primary School, Pondy Bazaar',
    boothNumber: '003',
    constituencyCode: 'TN015',
    location: { lat: 13.0456, lng: 80.2398 },
    totalVoters: 1678,
    address: 'Pondy Bazaar, T. Nagar, Chennai - 600017',
    sentiment: generateSentiment()
  },
  {
    id: 'TN015-004',
    name: 'Jaigopal Garodia National School',
    boothNumber: '004',
    constituencyCode: 'TN015',
    location: { lat: 13.0412, lng: 80.2367 },
    totalVoters: 1523,
    address: 'East Mada Street, T. Nagar, Chennai - 600017',
    sentiment: generateSentiment()
  },
  {
    id: 'TN015-005',
    name: 'CIT Nagar Corporation School',
    boothNumber: '005',
    constituencyCode: 'TN015',
    location: { lat: 13.0389, lng: 80.2412 },
    totalVoters: 1389,
    address: '5th Main Road, CIT Nagar, Chennai - 600035',
    sentiment: generateSentiment()
  }
];

// Coimbatore South Constituency (TN044) - Sample Booths
export const coimbatoreSouthBooths: PollingBooth[] = [
  {
    id: 'TN044-001',
    name: 'Govt. Primary School, Ramnagar',
    boothNumber: '001',
    constituencyCode: 'TN044',
    location: { lat: 10.9912, lng: 76.9645 },
    totalVoters: 1123,
    address: 'Ramnagar, Coimbatore - 641009',
    sentiment: generateSentiment()
  },
  {
    id: 'TN044-002',
    name: 'Town Higher Secondary School, RS Puram',
    boothNumber: '002',
    constituencyCode: 'TN044',
    location: { lat: 11.0018, lng: 76.9612 },
    totalVoters: 1567,
    address: 'DB Road, RS Puram, Coimbatore - 641002',
    sentiment: generateSentiment()
  },
  {
    id: 'TN044-003',
    name: 'Corporation Primary School, Gandhipuram',
    boothNumber: '003',
    constituencyCode: 'TN044',
    location: { lat: 11.0156, lng: 76.9672 },
    totalVoters: 1789,
    address: 'Gandhipuram, Coimbatore - 641012',
    sentiment: generateSentiment()
  },
  {
    id: 'TN044-004',
    name: 'PSG College of Technology',
    boothNumber: '004',
    constituencyCode: 'TN044',
    location: { lat: 11.0221, lng: 77.0011 },
    totalVoters: 2123,
    address: 'Avinashi Road, Peelamedu, Coimbatore - 641004',
    sentiment: generateSentiment()
  }
];

// Madurai Central Constituency (TN096) - Sample Booths
export const maduraiCentralBooths: PollingBooth[] = [
  {
    id: 'TN096-001',
    name: 'Corporation Primary School, Anna Nagar',
    boothNumber: '001',
    constituencyCode: 'TN096',
    location: { lat: 9.9312, lng: 78.1234 },
    totalVoters: 1234,
    address: 'Anna Nagar, Madurai - 625020',
    sentiment: generateSentiment()
  },
  {
    id: 'TN096-002',
    name: 'Sourashtra Boys Higher Secondary School',
    boothNumber: '002',
    constituencyCode: 'TN096',
    location: { lat: 9.9189, lng: 78.1167 },
    totalVoters: 1456,
    address: 'Tallakulam, Madurai - 625002',
    sentiment: generateSentiment()
  },
  {
    id: 'TN096-003',
    name: 'St. Mary\'s School, Goripalayam',
    boothNumber: '003',
    constituencyCode: 'TN096',
    location: { lat: 9.9267, lng: 78.1289 },
    totalVoters: 1678,
    address: 'Goripalayam, Madurai - 625002',
    sentiment: generateSentiment()
  }
];

// Puducherry - Lawspet Constituency (PY009) - Sample Booths
export const lawspetBooths: PollingBooth[] = [
  {
    id: 'PY009-001',
    name: 'Govt. Primary School, Lawspet',
    boothNumber: '001',
    constituencyCode: 'PY009',
    location: { lat: 11.9523, lng: 79.8067 },
    totalVoters: 987,
    address: 'Lawspet Main Road, Puducherry - 605008',
    sentiment: generateSentiment()
  },
  {
    id: 'PY009-002',
    name: 'Bharathidasan Govt. College for Women',
    boothNumber: '002',
    constituencyCode: 'PY009',
    location: { lat: 11.9489, lng: 79.8023 },
    totalVoters: 1234,
    address: 'Lawspet, Puducherry - 605008',
    sentiment: generateSentiment()
  },
  {
    id: 'PY009-003',
    name: 'Petit Seminaire School',
    boothNumber: '003',
    constituencyCode: 'PY009',
    location: { lat: 11.9556, lng: 79.8089 },
    totalVoters: 876,
    address: 'Lawspet, Puducherry - 605008',
    sentiment: generateSentiment()
  }
];

// Combine all sample booths
export const samplePollingBooths: PollingBooth[] = [
  ...tNagarPollingBooths,
  ...coimbatoreSouthBooths,
  ...maduraiCentralBooths,
  ...lawspetBooths
];

// Helper function to get booths by constituency
export const getBoothsByConstituency = (constituencyCode: string): PollingBooth[] => {
  return samplePollingBooths.filter(booth => booth.constituencyCode === constituencyCode);
};

// Helper function to generate booths for any constituency (for demo purposes)
export const generateMockBooths = (
  constituencyCode: string,
  districtName: string,
  count: number = 50
): PollingBooth[] => {
  const booths: PollingBooth[] = [];

  // Get approximate center from constituency data
  const baseLat = 11.0 + Math.random() * 2;
  const baseLng = 78.0 + Math.random() * 2;

  for (let i = 1; i <= count; i++) {
    booths.push({
      id: `${constituencyCode}-${String(i).padStart(3, '0')}`,
      name: `Polling Station ${i}, ${districtName}`,
      boothNumber: String(i).padStart(3, '0'),
      constituencyCode,
      location: {
        lat: baseLat + (Math.random() - 0.5) * 0.1,
        lng: baseLng + (Math.random() - 0.5) * 0.1
      },
      totalVoters: Math.floor(Math.random() * 1000) + 500,
      address: `${districtName} District, Tamil Nadu`,
      sentiment: generateSentiment()
    });
  }

  return booths;
};
