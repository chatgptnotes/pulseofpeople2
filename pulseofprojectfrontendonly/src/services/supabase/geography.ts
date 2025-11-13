/**
 * Geography & Territory Services
 * Central export for all Phase 2 geography-related services
 */

export { constituenciesService, ConstituenciesService } from './constituencies.service';
export { pollingBoothsService, PollingBoothsService } from './polling-booths.service';
export { votersService, VotersService } from './voters.service';

// Re-export related types
export type {
  Constituency,
  ConstituencyInsert,
  ConstituencyUpdate,
  ConstituencyFilters,
  ConstituencyWithStats,
  Ward,
  WardInsert,
  WardUpdate,
  PollingBooth,
  PollingBoothInsert,
  PollingBoothUpdate,
  PollingBoothFilters,
  PollingBoothWithConstituency,
  Voter,
  VoterInsert,
  VoterUpdate,
  VoterFilters,
  VoterWithBooth,
  ConstituencyType,
  VoterGender,
  VoterSentiment,
  VoterCategory,
  BoothType,
  SwingPotential,
} from '../../types/database';
