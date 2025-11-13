/**
 * Polling Booths Service - Django API Integration
 * Manages polling booth data
 */

import { apiCall } from '../contexts/AuthContext';

export interface PollingBooth {
  id: number;
  constituency: number;
  constituency_name?: string;
  organization?: number;
  name: string;
  code: string;
  booth_number: string;
  location?: string;
  address?: string;
  total_voters: number;
  status: 'active' | 'inactive' | 'needs_attention';
  supervisor_id?: number;
  last_updated_by?: number;
  metadata?: any;
  voter_count_actual?: number;
  created_at: string;
  updated_at: string;
}

export interface PollingBoothFilters {
  constituency?: number;
  status?: string;
  organization?: number;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export const pollingBoothsService = {
  /**
   * Get all polling booths with optional filters
   */
  async getAll(filters?: PollingBoothFilters) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiCall(`/polling-booths/?${params}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch polling booths: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Get a single polling booth by ID
   */
  async getById(id: number | string) {
    const response = await apiCall(`/polling-booths/${id}/`);
    if (!response.ok) {
      throw new Error(`Failed to fetch polling booth: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Create a new polling booth
   */
  async create(data: Partial<PollingBooth>) {
    const response = await apiCall(`/polling-booths/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create polling booth');
    }
    return response.json();
  },

  /**
   * Update an existing polling booth
   */
  async update(id: number | string, data: Partial<PollingBooth>) {
    const response = await apiCall(`/polling-booths/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update polling booth');
    }
    return response.json();
  },

  /**
   * Delete a polling booth
   */
  async delete(id: number | string) {
    const response = await apiCall(`/polling-booths/${id}/`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete polling booth');
    }
    return response.ok;
  },

  /**
   * Get polling booths by constituency
   */
  async getByConstituency(constituencyId: number | string) {
    const response = await apiCall(`/polling-booths/by_constituency/?constituency_id=${constituencyId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch polling booths by constituency');
    }
    return response.json();
  },

  /**
   * Get polling booths by status
   */
  async getByStatus(status: string) {
    return this.getAll({ status });
  },
};

export default pollingBoothsService;
