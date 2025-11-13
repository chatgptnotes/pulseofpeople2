/**
 * Voters Service - Django API Integration
 * Manages voter data and sentiment tracking
 */

import { apiCall } from '../contexts/AuthContext';

export interface Voter {
  id: number;
  polling_booth: number;
  polling_booth_name?: string;
  constituency_name?: string;
  organization?: number;
  full_name: string;
  voter_id_number: string;
  epic_number?: string;
  phone?: string;
  address?: string;
  age?: number;
  gender: 'male' | 'female' | 'other' | 'undisclosed';
  caste_category?: string;
  religion?: string;
  occupation?: string;
  education?: string;
  family_size?: number;
  voter_category: 'core_supporter' | 'swing_voter' | 'opposition' | 'undecided' | 'first_time';
  sentiment: 'strongly_positive' | 'positive' | 'neutral' | 'negative' | 'strongly_negative' | 'undecided';
  sentiment_score: number;
  sentiment_last_updated?: string;
  influencer_score: number;
  first_time_voter: boolean;
  verified: boolean;
  verified_by?: number;
  verified_by_username?: string;
  verified_at?: string;
  consent_given: boolean;
  contacted_by_party: boolean;
  last_contact_date?: string;
  contact_method?: string;
  notes?: string;
  tags?: string[];
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface VoterFilters {
  polling_booth?: number;
  gender?: string;
  voter_category?: string;
  sentiment?: string;
  first_time_voter?: boolean;
  verified?: boolean;
  caste_category?: string;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export const votersService = {
  /**
   * Get all voters with optional filters
   */
  async getAll(filters?: VoterFilters) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiCall(`/voters/?${params}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch voters: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Get a single voter by ID
   */
  async getById(id: number | string) {
    const response = await apiCall(`/voters/${id}/`);
    if (!response.ok) {
      throw new Error(`Failed to fetch voter: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Create a new voter
   */
  async create(data: Partial<Voter>) {
    const response = await apiCall(`/voters/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create voter');
    }
    return response.json();
  },

  /**
   * Update an existing voter
   */
  async update(id: number | string, data: Partial<Voter>) {
    const response = await apiCall(`/voters/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update voter');
    }
    return response.json();
  },

  /**
   * Delete a voter
   */
  async delete(id: number | string) {
    const response = await apiCall(`/voters/${id}/`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete voter');
    }
    return response.ok;
  },

  /**
   * Search voters by name, ID, or phone
   */
  async search(query: string) {
    const response = await apiCall(`/voters/search/?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error('Failed to search voters');
    }
    return response.json();
  },

  /**
   * Update voter sentiment
   */
  async updateSentiment(id: number | string, sentiment: string, sentimentScore: number) {
    const response = await apiCall(`/voters/${id}/update_sentiment/`, {
      method: 'PATCH',
      body: JSON.stringify({
        sentiment,
        sentiment_score: sentimentScore,
      }),
    });
    if (!response.ok) {
      throw new Error('Failed to update sentiment');
    }
    return response.json();
  },

  /**
   * Bulk update voters
   */
  async bulkUpdate(voterIds: number[], data: Partial<Voter>) {
    const response = await apiCall(`/voters/bulk_update/`, {
      method: 'POST',
      body: JSON.stringify({
        voter_ids: voterIds,
        data,
      }),
    });
    if (!response.ok) {
      throw new Error('Failed to bulk update voters');
    }
    return response.json();
  },

  /**
   * Get voter statistics
   */
  async getStatistics() {
    const response = await apiCall(`/voters/statistics/`);
    if (!response.ok) {
      throw new Error('Failed to fetch statistics');
    }
    return response.json();
  },

  /**
   * Get voters by sentiment
   */
  async getBySentiment(sentiment: string) {
    const response = await apiCall(`/voters/by_sentiment/?sentiment=${sentiment}`);
    if (!response.ok) {
      throw new Error('Failed to fetch voters by sentiment');
    }
    return response.json();
  },

  /**
   * Get voters by polling booth
   */
  async getByPollingBooth(pollingBoothId: number) {
    return this.getAll({ polling_booth: pollingBoothId });
  },

  /**
   * Get first-time voters
   */
  async getFirstTimeVoters() {
    return this.getAll({ first_time_voter: true });
  },

  /**
   * Get unverified voters
   */
  async getUnverifiedVoters() {
    return this.getAll({ verified: false });
  },
};

export default votersService;
