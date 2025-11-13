/**
 * Campaigns Service - Django API Integration
 * Manages political campaign data
 */

import { apiCall } from '../contexts/AuthContext';

export interface Campaign {
  id: number;
  organization: number;
  constituency?: number;
  constituency_name?: string;
  name: string;
  description?: string;
  status: 'planning' | 'active' | 'paused' | 'completed' | 'cancelled';
  start_date: string;
  end_date: string;
  manager?: number;
  manager_username?: string;
  target_voters: number;
  reached_voters: number;
  budget?: number;
  spent: number;
  metadata?: any;
  activity_count?: number;
  completion_percentage?: number;
  created_at: string;
  updated_at: string;
}

export interface CampaignActivity {
  id: number;
  campaign: number;
  campaign_name?: string;
  polling_booth?: number;
  polling_booth_name?: string;
  title: string;
  description?: string;
  activity_type: 'rally' | 'door_to_door' | 'phone_call' | 'social_media' | 'meeting' | 'event' | 'other';
  scheduled_at: string;
  completed_at?: string;
  assigned_to?: number;
  assigned_to_username?: string;
  completed: boolean;
  voters_reached: number;
  feedback?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface CampaignFilters {
  status?: string;
  constituency?: number;
  manager?: number;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export const campaignsService = {
  /**
   * Get all campaigns with optional filters
   */
  async getAll(filters?: CampaignFilters) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiCall(`/campaigns/?${params}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch campaigns: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Get a single campaign by ID
   */
  async getById(id: number | string) {
    const response = await apiCall(`/campaigns/${id}/`);
    if (!response.ok) {
      throw new Error(`Failed to fetch campaign: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Create a new campaign
   */
  async create(data: Partial<Campaign>) {
    const response = await apiCall(`/campaigns/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create campaign');
    }
    return response.json();
  },

  /**
   * Update an existing campaign
   */
  async update(id: number | string, data: Partial<Campaign>) {
    const response = await apiCall(`/campaigns/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update campaign');
    }
    return response.json();
  },

  /**
   * Delete a campaign
   */
  async delete(id: number | string) {
    const response = await apiCall(`/campaigns/${id}/`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete campaign');
    }
    return response.ok;
  },

  /**
   * Get campaign activities
   */
  async getActivities(campaignId: number | string) {
    const response = await apiCall(`/campaigns/${campaignId}/activities/`);
    if (!response.ok) {
      throw new Error('Failed to fetch campaign activities');
    }
    return response.json();
  },

  /**
   * Get active campaigns
   */
  async getActive() {
    const response = await apiCall(`/campaigns/active/`);
    if (!response.ok) {
      throw new Error('Failed to fetch active campaigns');
    }
    return response.json();
  },

  /**
   * Get campaigns by status
   */
  async getByStatus(status: string) {
    return this.getAll({ status });
  },
};

export const campaignActivitiesService = {
  /**
   * Get all campaign activities
   */
  async getAll(filters?: any) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiCall(`/campaign-activities/?${params}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch campaign activities: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Get a single campaign activity by ID
   */
  async getById(id: number | string) {
    const response = await apiCall(`/campaign-activities/${id}/`);
    if (!response.ok) {
      throw new Error(`Failed to fetch campaign activity: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Create a new campaign activity
   */
  async create(data: Partial<CampaignActivity>) {
    const response = await apiCall(`/campaign-activities/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create campaign activity');
    }
    return response.json();
  },

  /**
   * Update an existing campaign activity
   */
  async update(id: number | string, data: Partial<CampaignActivity>) {
    const response = await apiCall(`/campaign-activities/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update campaign activity');
    }
    return response.json();
  },

  /**
   * Delete a campaign activity
   */
  async delete(id: number | string) {
    const response = await apiCall(`/campaign-activities/${id}/`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete campaign activity');
    }
    return response.ok;
  },

  /**
   * Mark activity as completed
   */
  async markCompleted(id: number | string, feedback?: string, votersReached?: number) {
    return this.update(id, {
      completed: true,
      completed_at: new Date().toISOString(),
      feedback,
      voters_reached: votersReached || 0,
    });
  },
};

export default campaignsService;
