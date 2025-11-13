/**
 * TVK (Tamilaga Vettri Kazhagam) Branding Configuration
 *
 * This file contains all branding-related constants for TVK.
 * Update these values to customize the platform appearance and behavior.
 */

export const TVK_CONFIG = {
  // Organization Details
  organization: {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Tamilaga Vettri Kazhagam',
    shortName: 'TVK',
    slug: 'tvk',
    founder: 'Vijay',
    establishedYear: 2023,
    headquarters: 'Chennai, Tamil Nadu',
    state: 'Tamil Nadu',
  },

  // Branding
  branding: {
    primaryColor: '#FFD700', // Gold
    secondaryColor: '#FF0000', // Red
    accentColor: '#1976D2', // Blue
    logoPath: '/TVKAsset1_1024x1024.webp',
    partySymbol: 'Rising Sun',
    tagline: 'வெற்றிக் கொடி பறக்குது',
  },

  // Contact Information
  contact: {
    name: 'Vijay',
    email: 'contact@tvk.org.in',
    phone: '+91-44-XXXXXXXX',
    website: 'https://www.tvk.org.in',
  },

  // Social Media
  socialMedia: {
    twitter: '@TVKOfficial',
    twitterUrl: 'https://twitter.com/TVKOfficial',
    facebook: 'TVKOfficial',
    facebookUrl: 'https://facebook.com/TVKOfficial',
    instagram: '@tvk_official',
    instagramUrl: 'https://instagram.com/tvk_official',
    youtube: 'TVK Official',
    youtubeUrl: 'https://youtube.com/@TVKOfficial',
  },

  // Political Information
  political: {
    ideology: 'Social Democracy',
    alliance: 'Independent',
    focusAreas: [
      'Youth Empowerment',
      'Social Justice',
      'Economic Development',
      'Education Reform',
      'Healthcare Access',
      'Women Empowerment',
      'Agricultural Welfare',
      'Environmental Protection',
    ],
  },

  // Platform Features
  features: {
    voterManagement: true,
    sentimentTracking: true,
    boothAnalysis: true,
    constituencyMapping: true,
    surveyManagement: true,
    campaignPlanning: true,
    volunteerManagement: true,
    donationTracking: false, // Enable when ready
  },

  // App Metadata
  app: {
    name: 'Pulse of People - TVK',
    shortName: 'POP TVK',
    description: 'Political sentiment analysis and voter management platform for Tamilaga Vettri Kazhagam',
    version: '2.0.0',
    buildDate: '2025-11-09',
  },
} as const;

// Type-safe accessors
export const getOrganizationId = () => TVK_CONFIG.organization.id;
export const getOrganizationName = () => TVK_CONFIG.organization.name;
export const getOrganizationShortName = () => TVK_CONFIG.organization.shortName;
export const getPrimaryColor = () => TVK_CONFIG.branding.primaryColor;
export const getLogoPath = () => TVK_CONFIG.branding.logoPath;
export const getPartySymbol = () => TVK_CONFIG.branding.partySymbol;

// Default export
export default TVK_CONFIG;
