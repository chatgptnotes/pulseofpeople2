/**
 * Constituencies Service - Django API Integration
 * Manages electoral constituency data
 */

import { apiCall } from '../contexts/AuthContext';

export interface Constituency {
  id: number;
  organization?: number;
  name: string;
  code: string;
  type: 'parliamentary' | 'assembly' | 'municipal' | 'other';
  state: string;
  district: string;
  boundaries?: any;
  population?: number;
  voter_count: number;
  total_booths: number;
  area_sq_km?: number;
  reserved_category: 'general' | 'sc' | 'st' | 'obc';
  last_election_year?: number;
  current_representative?: string;
  current_party?: string;
  metadata?: any;
  booth_count?: number;
  created_at: string;
  updated_at: string;
}

export interface ConstituencyFilters {
  type?: string;
  state?: string;
  district?: string;
  reserved_category?: string;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export const constituenciesService = {
  /**
   * Get all constituencies with optional filters
   */
  async getAll(filters?: ConstituencyFilters) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiCall(`/constituencies/?${params}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch constituencies: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Get a single constituency by ID
   */
  async getById(id: number | string) {
    const response = await apiCall(`/constituencies/${id}/`);
    if (!response.ok) {
      throw new Error(`Failed to fetch constituency: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Create a new constituency
   */
  async create(data: Partial<Constituency>) {
    const response = await apiCall(`/constituencies/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create constituency');
    }
    return response.json();
  },

  /**
   * Update an existing constituency
   */
  async update(id: number | string, data: Partial<Constituency>) {
    const response = await apiCall(`/constituencies/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update constituency');
    }
    return response.json();
  },

  /**
   * Delete a constituency
   */
  async delete(id: number | string) {
    const response = await apiCall(`/constituencies/${id}/`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete constituency');
    }
    return response.ok;
  },

  /**
   * Get constituency statistics
   */
  async getStatistics() {
    const response = await apiCall(`/constituencies/statistics/`);
    if (!response.ok) {
      throw new Error('Failed to fetch statistics');
    }
    return response.json();
  },

  /**
   * Get polling booths for a constituency
   */
  async getPollingBooths(id: number | string) {
    const response = await apiCall(`/constituencies/${id}/polling_booths/`);
    if (!response.ok) {
      throw new Error('Failed to fetch polling booths');
    }
    return response.json();
  },

  /**
   * Get constituencies by state
   */
  async getByState(state: string) {
    return this.getAll({ state });
  },

  /**
   * Get constituencies by type
   */
  async getByType(type: string) {
    return this.getAll({ type });
  },
};

export default constituenciesService;
