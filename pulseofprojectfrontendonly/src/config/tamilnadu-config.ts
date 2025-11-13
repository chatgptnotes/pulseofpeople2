/**
 * Tamil Nadu & Puducherry Configuration
 * TVK (Tamilaga Vettri Kazhagam) Election Campaign
 */

// Tamil Nadu Districts (38)
export const TN_DISTRICTS = [
  'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore',
  'Dharmapuri', 'Dindigul', 'Erode', 'Kallakurichi', 'Kanchipuram',
  'Kanyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai',
  'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai',
  'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi',
  'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli',
  'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur',
  'Vellore', 'Viluppuram', 'Virudhunagar'
];

// Puducherry Districts (4)
export const PUDUCHERRY_DISTRICTS = [
  'Puducherry', 'Karaikal', 'Mahe', 'Yanam'
];

// All Districts
export const ALL_DISTRICTS = [...TN_DISTRICTS, ...PUDUCHERRY_DISTRICTS];

// Major Cities
export const MAJOR_CITIES = [
  'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem',
  'Tirunelveli', 'Tiruppur', 'Erode', 'Vellore', 'Thoothukudi',
  'Thanjavur', 'Dindigul', 'Puducherry'
];

// Assembly Constituencies
export const TOTAL_CONSTITUENCIES = {
  TAMIL_NADU: 234,
  PUDUCHERRY: 30,
  TOTAL: 264
};

// Major Political Parties in Tamil Nadu
export const TN_POLITICAL_PARTIES = {
  TVK: {
    name: 'Tamilaga Vettri Kazhagam',
    shortName: 'TVK',
    leader: 'Vijay',
    color: '#FF6B35',
    description: 'Tamil Nadu Victory Front'
  },
  DMK: {
    name: 'Dravida Munnetra Kazhagam',
    shortName: 'DMK',
    leader: 'M.K. Stalin',
    color: '#FF0000',
    description: 'Dravidian Progressive Party'
  },
  AIADMK: {
    name: 'All India Anna Dravida Munnetra Kazhagam',
    shortName: 'AIADMK',
    leader: 'Edappadi K. Palaniswami',
    color: '#006400',
    description: 'All India Anna DMK'
  },
  BJP: {
    name: 'Bharatiya Janata Party',
    shortName: 'BJP',
    leader: 'K. Annamalai',
    color: '#FF9933',
    description: 'Indian People\'s Party'
  },
  PMK: {
    name: 'Pattali Makkal Katchi',
    shortName: 'PMK',
    leader: 'Anbumani Ramadoss',
    color: '#FFFF00',
    description: 'Vanniyar Caste Party'
  },
  DMDK: {
    name: 'Desiya Murpokku Dravida Kazhagam',
    shortName: 'DMDK',
    leader: 'Vijayakanth',
    color: '#FFD700',
    description: 'National Progressive DMK'
  },
  NTK: {
    name: 'Naam Tamilar Katchi',
    shortName: 'NTK',
    leader: 'Seeman',
    color: '#8B0000',
    description: 'We Tamils Party'
  }
};

// Tamil Nadu Specific Issues
export const TN_ELECTION_ISSUES = {
  WATER: {
    name: 'Water Scarcity',
    nameInTamil: 'நீர் பற்றாக்குறை',
    priority: 'critical',
    description: 'Drinking water shortage, Cauvery river dispute, groundwater depletion'
  },
  JOBS: {
    name: 'Employment',
    nameInTamil: 'வேலைவாய்ப்பு',
    priority: 'critical',
    description: 'Youth unemployment, IT jobs, manufacturing sector growth'
  },
  AGRICULTURE: {
    name: 'Agriculture',
    nameInTamil: 'வேளாண்மை',
    priority: 'high',
    description: 'Farmer welfare, crop prices, irrigation, farm loan waiver'
  },
  EDUCATION: {
    name: 'Education',
    nameInTamil: 'கல்வி',
    priority: 'high',
    description: 'Quality education, NEET exam issue, school infrastructure'
  },
  CASTE_RESERVATION: {
    name: 'Caste Reservation',
    nameInTamil: 'சாதி ஒதுக்கீடு',
    priority: 'high',
    description: 'OBC/MBC/SC/ST reservations, social justice policies'
  },
  HEALTH: {
    name: 'Healthcare',
    nameInTamil: 'சுகாதாரம்',
    priority: 'medium',
    description: 'Government hospitals, medical education, healthcare access'
  },
  PROHIBITION: {
    name: 'Prohibition',
    nameInTamil: 'மதுவிலக்கு',
    priority: 'medium',
    description: 'Total alcohol prohibition demand'
  },
  LANGUAGE: {
    name: 'Tamil Language',
    nameInTamil: 'தமிழ் மொழி',
    priority: 'medium',
    description: 'Tamil language protection, Hindi imposition opposition'
  },
  CORRUPTION: {
    name: 'Corruption',
    nameInTamil: 'ஊழல்',
    priority: 'medium',
    description: 'Political corruption, transparency in governance'
  },
  INFRASTRUCTURE: {
    name: 'Infrastructure',
    nameInTamil: 'அடிப்படை வசதிகள்',
    priority: 'medium',
    description: 'Roads, public transport, electricity, internet'
  }
};

// Caste Demographics (Approximate)
export const TN_CASTE_DEMOGRAPHICS = {
  OBC: { percentage: 54, name: 'Other Backward Classes', tamil: 'பிற்படுத்தப்பட்ட வகுப்பினர்' },
  MBC: { percentage: 20, name: 'Most Backward Classes', tamil: 'மிகவும் பிற்படுத்தப்பட்டோர்' },
  SC: { percentage: 20, name: 'Scheduled Castes', tamil: 'தாழ்த்தப்பட்ட வகுப்பினர்' },
  ST: { percentage: 1, name: 'Scheduled Tribes', tamil: 'பழங்குடியினர்' },
  FC: { percentage: 5, name: 'Forward Castes', tamil: 'முன்னோர் வகுப்பினர்' }
};

// Major Castes in Tamil Nadu
export const TN_MAJOR_CASTES = [
  { name: 'Vanniyar', category: 'MBC', region: 'Northern TN', strength: 'High' },
  { name: 'Thevar', category: 'OBC', region: 'Southern TN', strength: 'High' },
  { name: 'Gounder', category: 'OBC', region: 'Western TN', strength: 'High' },
  { name: 'Nadar', category: 'OBC', region: 'Southern TN', strength: 'Medium' },
  { name: 'Mudaliar', category: 'OBC', region: 'Central TN', strength: 'Medium' },
  { name: 'Dalit Communities', category: 'SC', region: 'All TN', strength: 'High' },
  { name: 'Muslim', category: 'Religion', region: 'All TN', strength: 'Medium' },
  { name: 'Christian', category: 'Religion', region: 'Southern TN', strength: 'Medium' }
];

// Tamil News Channels
export const TN_NEWS_CHANNELS = [
  { name: 'Sun News', language: 'Tamil', reach: 'High', alignment: 'DMK-leaning' },
  { name: 'Puthiya Thalaimurai', language: 'Tamil', reach: 'High', alignment: 'Neutral' },
  { name: 'News7 Tamil', language: 'Tamil', reach: 'High', alignment: 'Neutral' },
  { name: 'Polimer News', language: 'Tamil', reach: 'High', alignment: 'AIADMK-leaning' },
  { name: 'Thanthi TV', language: 'Tamil', reach: 'High', alignment: 'Neutral' },
  { name: 'Zee Tamil News', language: 'Tamil', reach: 'Medium', alignment: 'BJP-leaning' },
  { name: 'News18 Tamil Nadu', language: 'Tamil', reach: 'Medium', alignment: 'Neutral' },
  { name: 'Captain News', language: 'Tamil', reach: 'Medium', alignment: 'DMDK-leaning' }
];

// Tamil Social Media Influencers
export const TN_INFLUENCERS = [
  { name: 'Maridhas', platform: 'YouTube', followers: '2M+', alignment: 'BJP' },
  { name: 'Savukku Shankar', platform: 'YouTube', followers: '1M+', alignment: 'Anti-DMK' },
  { name: 'Rangaraj Pandey', platform: 'YouTube', followers: '500K+', alignment: 'Neutral' },
  { name: 'Sattai Dude', platform: 'YouTube', followers: '1M+', alignment: 'Youth voice' },
  { name: 'Senthil Vasan', platform: 'Twitter', followers: '500K+', alignment: 'Pro-DMK' }
];

// 2021 Election Results Summary
export const TN_2021_ELECTION_RESULTS = {
  DMK: { seats: 133, voteShare: 37.7 },
  AIADMK: { seats: 66, voteShare: 33.3 },
  BJP: { seats: 4, voteShare: 2.6 },
  PMK: { seats: 5, voteShare: 5.4 },
  Congress: { seats: 18, voteShare: 3.1 },
  Others: { seats: 8, voteShare: 17.9 }
};

// TVK Campaign Focus Areas
export const TVK_CAMPAIGN_FOCUS = {
  TARGET_SEATS: 234, // All TN constituencies
  PRIORITY_DISTRICTS: [
    'Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Tiruchirappalli'
  ],
  KEY_MESSAGES: [
    'Youth empowerment and employment',
    'Social justice for all castes',
    'Tamil culture and language protection',
    'Corruption-free governance',
    'Agriculture and farmer welfare'
  ],
  TARGET_DEMOGRAPHICS: [
    'Youth (18-35 years)',
    'First-time voters',
    'OBC/MBC communities',
    'Urban middle class',
    'Farmers'
  ]
};

export default {
  TN_DISTRICTS,
  PUDUCHERRY_DISTRICTS,
  ALL_DISTRICTS,
  MAJOR_CITIES,
  TOTAL_CONSTITUENCIES,
  TN_POLITICAL_PARTIES,
  TN_ELECTION_ISSUES,
  TN_CASTE_DEMOGRAPHICS,
  TN_MAJOR_CASTES,
  TN_NEWS_CHANNELS,
  TN_INFLUENCERS,
  TN_2021_ELECTION_RESULTS,
  TVK_CAMPAIGN_FOCUS
};
