/**
 * Issues Service - Django API Integration
 * Manages political issues and voter concerns
 */

import { apiCall } from '../contexts/AuthContext';

export interface Issue {
  id: number;
  organization: number;
  constituency?: number;
  constituency_name?: string;
  title: string;
  description: string;
  category: 'infrastructure' | 'education' | 'healthcare' | 'employment' | 'law_order' | 'agriculture' | 'environment' | 'corruption' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  reported_by?: number;
  reported_by_username?: string;
  assigned_to?: number;
  assigned_to_username?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  affected_voters: number;
  sentiment_impact: number;
  resolution?: string;
  resolved_at?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface IssueFilters {
  category?: string;
  priority?: string;
  status?: string;
  constituency?: number;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export const issuesService = {
  /**
   * Get all issues with optional filters
   */
  async getAll(filters?: IssueFilters) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiCall(`/issues/?${params}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch issues: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Get a single issue by ID
   */
  async getById(id: number | string) {
    const response = await apiCall(`/issues/${id}/`);
    if (!response.ok) {
      throw new Error(`Failed to fetch issue: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Create a new issue
   */
  async create(data: Partial<Issue>) {
    const response = await apiCall(`/issues/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create issue');
    }
    return response.json();
  },

  /**
   * Update an existing issue
   */
  async update(id: number | string, data: Partial<Issue>) {
    const response = await apiCall(`/issues/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update issue');
    }
    return response.json();
  },

  /**
   * Delete an issue
   */
  async delete(id: number | string) {
    const response = await apiCall(`/issues/${id}/`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete issue');
    }
    return response.ok;
  },

  /**
   * Get issues by priority
   */
  async getByPriority(priority: string) {
    return this.getAll({ priority });
  },

  /**
   * Get issues by status
   */
  async getByStatus(status: string) {
    return this.getAll({ status });
  },

  /**
   * Get issues by category
   */
  async getByCategory(category: string) {
    return this.getAll({ category });
  },

  /**
   * Get open issues
   */
  async getOpenIssues() {
    return this.getAll({ status: 'open' });
  },

  /**
   * Get critical issues
   */
  async getCriticalIssues() {
    return this.getAll({ priority: 'critical' });
  },

  /**
   * Resolve an issue
   */
  async resolve(id: number | string, resolution: string) {
    return this.update(id, {
      status: 'resolved',
      resolution,
      resolved_at: new Date().toISOString(),
    });
  },

  /**
   * Assign issue to user
   */
  async assignTo(id: number | string, userId: number) {
    return this.update(id, {
      assigned_to: userId,
      status: 'in_progress',
    });
  },
};

export default issuesService;
