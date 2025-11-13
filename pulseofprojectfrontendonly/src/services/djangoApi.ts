/**
 * Django Backend API Service
 * Handles all API calls to the Django backend for political platform features
 *
 * This service connects to Django for:
 * - Master data (States, Districts, Constituencies, Issues, Voter Segments)
 * - Citizen feedback submission and management
 * - Field worker reports
 * - Analytics and sentiment data
 */

import { supabase } from '../lib/supabase';

const DJANGO_API_URL = import.meta.env.VITE_DJANGO_API_URL || 'http://127.0.0.1:8000/api';

// Helper function to get Supabase JWT token
const getAuthToken = async (): Promise<string | null> => {
  try {
    console.log('[DjangoAPI] 🔑 Fetching Supabase session token...');
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('[DjangoAPI] ❌ Error fetching session:', error.message);
      return null;
    }

    if (!session) {
      console.log('[DjangoAPI] ⚠️ No active session found');
      return null;
    }

    console.log('[DjangoAPI] ✅ Supabase token retrieved successfully');
    console.log('[DjangoAPI] 📊 Token details:', {
      user: session.user.email,
      expires_at: new Date(session.expires_at! * 1000).toLocaleString(),
    });

    return session.access_token;
  } catch (error: any) {
    console.error('[DjangoAPI] ❌ Unexpected error getting token:', error.message);
    return null;
  }
};

// Helper function to build headers with Supabase JWT token
const buildHeaders = async (includeAuth = false): Promise<HeadersInit> => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = await getAuthToken();
    if (token) {
      console.log('[DjangoAPI] 🔐 Adding Supabase JWT to Authorization header');
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn('[DjangoAPI] ⚠️ No token available for authenticated request');
    }
  }

  return headers;
};

// =====================================================
// AUTHENTICATION APIs
// =====================================================

export const djangoApi = {
  /**
   * Register new user
   * POST /api/auth/signup/
   */
  async register(data: {
    email: string;
    password: string;
    name: string;
    role?: string;
  }) {
    const response = await fetch(`${DJANGO_API_URL}/auth/signup/`, {
      method: 'POST',
      headers: await buildHeaders(true), // Include Supabase auth token for creating users
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.email?.[0] || error.password?.[0] || error.detail || 'Registration failed');
    }

    return response.json();
  },

  /**
   * Login with email/username and password
   * POST /api/auth/login/
   * Returns: { access, refresh } tokens
   */
  async login(emailOrUsername: string, password: string) {
    // Determine if input is email or username
    const isEmail = emailOrUsername.includes('@');
    const payload = isEmail
      ? { email: emailOrUsername, password }
      : { username: emailOrUsername, password };

    const response = await fetch(`${DJANGO_API_URL}/auth/login/`, {
      method: 'POST',
      headers: await buildHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Invalid email or password');
    }

    return response.json();
  },

  /**
   * Get current user profile
   * GET /api/auth/profile/
   */
  async getUserProfile() {
    const response = await fetch(`${DJANGO_API_URL}/auth/profile/`, {
      headers: await buildHeaders(true),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }

    return response.json();
  },

  /**
   * Refresh access token
   * POST /api/auth/refresh/
   */
  async refreshToken(refreshToken: string) {
    const response = await fetch(`${DJANGO_API_URL}/auth/refresh/`, {
      method: 'POST',
      headers: await buildHeaders(),
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    return response.json();
  },

  /**
   * Logout (blacklist refresh token)
   * POST /api/auth/logout/
   */
  async logout(refreshToken: string) {
    const response = await fetch(`${DJANGO_API_URL}/auth/logout/`, {
      method: 'POST',
      headers: await buildHeaders(true),
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      console.error('Logout failed, but continuing...');
    }

    return response.ok;
  },

  /**
   * Get list of users (role-based filtering)
   * GET /api/auth/users/
   */
  async getUsers() {
    const response = await fetch(`${DJANGO_API_URL}/auth/users/`, {
      headers: await buildHeaders(true),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    const data = await response.json();
    // Return results from paginated response
    return data.results || data;
  },

  // =====================================================
  // MASTER DATA APIs (Public - No Auth Required)
  // =====================================================

  /**
   * Get all states
   */
  async getStates() {
    const response = await fetch(`${DJANGO_API_URL}/states/`, {
      headers: await buildHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch states');
    return response.json();
  },

  /**
   * Get districts (optionally filter by state)
   */
  async getDistricts(stateCode?: string) {
    const url = stateCode
      ? `${DJANGO_API_URL}/districts/?state=${stateCode}`
      : `${DJANGO_API_URL}/districts/`;

    const response = await fetch(url, {
      headers: await buildHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch districts');
    return response.json();
  },

  /**
   * Get constituencies (optionally filter by state/type)
   */
  async getConstituencies(stateCode?: string, type?: string) {
    let url = `${DJANGO_API_URL}/constituencies/`;
    const params = new URLSearchParams();
    if (stateCode) params.append('state', stateCode);
    if (type) params.append('type', type);
    if (params.toString()) url += `?${params.toString()}`;

    const response = await fetch(url, {
      headers: await buildHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch constituencies');
    return response.json();
  },

  /**
   * Get polling booths (optionally filter by constituency/district/state)
   */
  async getPollingBooths(constituencyName?: string, districtName?: string, stateCode?: string) {
    let url = `${DJANGO_API_URL}/polling-booths/`;
    const params = new URLSearchParams();
    if (constituencyName) params.append('constituency', constituencyName);
    if (districtName) params.append('district', districtName);
    if (stateCode) params.append('state', stateCode);
    if (params.toString()) url += `?${params.toString()}`;

    const response = await fetch(url, {
      headers: await buildHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch polling booths');
    return response.json();
  },

  /**
   * Get all issue categories (TVK's 9 priorities)
   */
  async getIssueCategories() {
    const response = await fetch(`${DJANGO_API_URL}/issue-categories/`, {
      headers: await buildHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch issue categories');
    return response.json();
  },

  /**
   * Get all issues (alias for getIssueCategories)
   */
  async getIssues() {
    return this.getIssueCategories();
  },

  /**
   * Get all voter segments
   */
  async getVoterSegments() {
    const response = await fetch(`${DJANGO_API_URL}/voter-segments/`, {
      headers: await buildHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch voter segments');
    return response.json();
  },

  /**
   * Get all political parties
   */
  async getPoliticalParties() {
    const response = await fetch(`${DJANGO_API_URL}/political-parties/`, {
      headers: await buildHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch political parties');
    return response.json();
  },

  // =====================================================
  // FEEDBACK APIs (Mixed Auth)
  // =====================================================

  /**
   * Submit citizen feedback (PUBLIC - No Auth Required)
   */
  async submitFeedback(feedbackData: {
    citizen_name: string;
    citizen_age?: number;
    citizen_phone: string;
    citizen_email?: string;
    state: number;
    district: number;
    constituency?: number;
    ward?: string;
    booth_number?: string;
    detailed_location?: string;
    issue_category: number;
    message_text: string;
    expectations?: string;
    voter_segment?: number;
    audio_file_url?: string;
    video_file_url?: string;
    image_urls?: string[];
  }) {
    const response = await fetch(`${DJANGO_API_URL}/feedback/`, {
      method: 'POST',
      headers: await buildHeaders(false), // No auth required for submission
      body: JSON.stringify(feedbackData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to submit feedback');
    }
    return response.json();
  },

  /**
   * Get feedback list (AUTH REQUIRED, role-based filtering)
   */
  async getFeedbackList(filters?: {
    status?: string;
    search?: string;
    ordering?: string;
  }) {
    let url = `${DJANGO_API_URL}/feedback/`;
    if (filters) {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      if (filters.ordering) params.append('ordering', filters.ordering);
      if (params.toString()) url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
      headers: await buildHeaders(true), // Auth required
    });
    if (!response.ok) throw new Error('Failed to fetch feedback');
    return response.json();
  },

  /**
   * Get feedback details by ID (AUTH REQUIRED)
   */
  async getFeedbackDetail(id: number) {
    const response = await fetch(`${DJANGO_API_URL}/feedback/${id}/`, {
      headers: await buildHeaders(true),
    });
    if (!response.ok) throw new Error('Failed to fetch feedback details');
    return response.json();
  },

  /**
   * Mark feedback as reviewed (AUTH REQUIRED)
   */
  async markFeedbackReviewed(id: number) {
    const response = await fetch(`${DJANGO_API_URL}/feedback/${id}/mark_reviewed/`, {
      method: 'POST',
      headers: await buildHeaders(true),
    });
    if (!response.ok) throw new Error('Failed to mark feedback as reviewed');
    return response.json();
  },

  /**
   * Escalate feedback (AUTH REQUIRED)
   */
  async escalateFeedback(id: number) {
    const response = await fetch(`${DJANGO_API_URL}/feedback/${id}/escalate/`, {
      method: 'POST',
      headers: await buildHeaders(true),
    });
    if (!response.ok) throw new Error('Failed to escalate feedback');
    return response.json();
  },

  /**
   * Get feedback statistics (AUTH REQUIRED)
   */
  async getFeedbackStats() {
    const response = await fetch(`${DJANGO_API_URL}/feedback/stats/`, {
      headers: await buildHeaders(true),
    });
    if (!response.ok) throw new Error('Failed to fetch feedback stats');
    return response.json();
  },

  // =====================================================
  // FIELD REPORTS APIs (AUTH REQUIRED)
  // =====================================================

  /**
   * Submit field report (AUTH REQUIRED)
   */
  async submitFieldReport(reportData: {
    state: number;
    district: number;
    constituency: number;
    ward?: string;
    booth_number?: string;
    report_type: string;
    title: string;
    positive_reactions?: string[];
    negative_reactions?: string[];
    key_issues?: number[];
    voter_segments_met?: number[];
    crowd_size?: number;
    quotes?: string[];
    notes?: string;
  }) {
    const response = await fetch(`${DJANGO_API_URL}/field-reports/`, {
      method: 'POST',
      headers: await buildHeaders(true),
      body: JSON.stringify(reportData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to submit field report');
    }
    return response.json();
  },

  /**
   * Get field reports list (AUTH REQUIRED)
   */
  async getFieldReports(myReportsOnly = false) {
    const url = myReportsOnly
      ? `${DJANGO_API_URL}/field-reports/my_reports/`
      : `${DJANGO_API_URL}/field-reports/`;

    const response = await fetch(url, {
      headers: await buildHeaders(true),
    });
    if (!response.ok) throw new Error('Failed to fetch field reports');
    return response.json();
  },

  /**
   * Verify field report (AUTH REQUIRED - Admin only)
   */
  async verifyFieldReport(id: number, verificationNotes?: string) {
    const response = await fetch(`${DJANGO_API_URL}/field-reports/${id}/verify/`, {
      method: 'POST',
      headers: await buildHeaders(true),
      body: JSON.stringify({ verification_notes: verificationNotes }),
    });
    if (!response.ok) throw new Error('Failed to verify field report');
    return response.json();
  },

  // =====================================================
  // ANALYTICS APIs (AUTH REQUIRED)
  // =====================================================

  /**
   * Get dashboard overview analytics
   */
  async getAnalyticsOverview() {
    const response = await fetch(`${DJANGO_API_URL}/analytics/overview/`, {
      headers: await buildHeaders(true),
    });
    if (!response.ok) throw new Error('Failed to fetch analytics overview');
    return response.json();
  },

  /**
   * Get constituency-level analytics
   */
  async getConstituencyAnalytics(constituencyCode: string) {
    const response = await fetch(`${DJANGO_API_URL}/analytics/constituency/${constituencyCode}/`, {
      headers: await buildHeaders(true),
    });
    if (!response.ok) throw new Error('Failed to fetch constituency analytics');
    return response.json();
  },

  /**
   * Get district-level analytics
   */
  async getDistrictAnalytics(districtId: number) {
    const response = await fetch(`${DJANGO_API_URL}/analytics/district/${districtId}/`, {
      headers: await buildHeaders(true),
    });
    if (!response.ok) throw new Error('Failed to fetch district analytics');
    return response.json();
  },

  /**
   * Get state-level analytics
   */
  async getStateAnalytics(stateCode: string) {
    const response = await fetch(`${DJANGO_API_URL}/analytics/state/${stateCode}/`, {
      headers: await buildHeaders(true),
    });
    if (!response.ok) throw new Error('Failed to fetch state analytics');
    return response.json();
  },

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await getAuthToken();
    return !!token;
  },

  /**
   * Health check
   */
  async healthCheck() {
    const response = await fetch(`${DJANGO_API_URL}/health/`);
    if (!response.ok) throw new Error('Health check failed');
    return response.json();
  },

  // =====================================================
  // BULK USER UPLOAD APIs
  // =====================================================

  /**
   * Upload CSV file for bulk user creation
   * POST /api/users/bulk-upload/
   */
  async uploadBulkUsers(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const token = await getAuthToken();
    const response = await fetch(`${DJANGO_API_URL}/users/bulk-upload/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload file');
    }

    return response.json();
  },

  /**
   * Get status of bulk upload job
   * GET /api/users/bulk-upload/{jobId}/status/
   */
  async getBulkUploadStatus(jobId: string) {
    const response = await fetch(`${DJANGO_API_URL}/users/bulk-upload/${jobId}/status/`, {
      headers: await buildHeaders(true),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch upload status');
    }

    return response.json();
  },

  /**
   * Download error report CSV
   * GET /api/users/bulk-upload/{jobId}/errors/
   */
  async downloadBulkErrors(jobId: string) {
    const token = await getAuthToken();
    const response = await fetch(`${DJANGO_API_URL}/users/bulk-upload/${jobId}/errors/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to download error report');
    }

    // Return blob for CSV download
    const blob = await response.blob();
    return blob;
  },

  /**
   * Cancel bulk upload job
   * DELETE /api/users/bulk-upload/{jobId}/
   */
  async cancelBulkUpload(jobId: string) {
    const response = await fetch(`${DJANGO_API_URL}/users/bulk-upload/${jobId}/`, {
      method: 'DELETE',
      headers: await buildHeaders(true),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to cancel upload');
    }

    return response.json();
  },

  /**
   * Download CSV template for bulk upload
   * GET /api/users/bulk-upload/template/
   */
  async downloadUserTemplate() {
    const token = await getAuthToken();
    const response = await fetch(`${DJANGO_API_URL}/users/bulk-upload/template/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to download template');
    }

    // Return blob for CSV download
    const blob = await response.blob();
    return blob;
  },

  /**
   * Get list of bulk upload jobs
   * GET /api/users/bulk-upload/jobs/
   */
  async getBulkUploadJobs() {
    const response = await fetch(`${DJANGO_API_URL}/users/bulk-upload/jobs/`, {
      headers: await buildHeaders(true),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch bulk upload jobs');
    }

    return response.json();
  },
};

export default djangoApi;
