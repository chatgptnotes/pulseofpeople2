/**
 * Central export for all Django API services
 * Import services from this file for consistency
 */

export { constituenciesService } from './constituencies.service';
export type { Constituency, ConstituencyFilters } from './constituencies.service';

export { pollingBoothsService } from './pollingBooths.service';
export type { PollingBooth, PollingBoothFilters } from './pollingBooths.service';

export { votersService } from './voters.service';
export type { Voter, VoterFilters } from './voters.service';

export { campaignsService, campaignActivitiesService } from './campaigns.service';
export type { Campaign, CampaignActivity, CampaignFilters } from './campaigns.service';

export { dashboardService } from './dashboard.service';
export type { DashboardStats, SentimentTrend, HeatmapData } from './dashboard.service';

export { issuesService } from './issues.service';
export type { Issue, IssueFilters } from './issues.service';

// Export API helper from AuthContext
export { apiCall, API_BASE_URL } from '../contexts/AuthContext';
