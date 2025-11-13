/**
 * Organization Service
 * Domain-specific operations for organization management
 */

import { SupabaseService } from './crud';
import {
  Organization,
  OrganizationInsert,
  OrganizationUpdate,
  OrganizationType,
  SubscriptionStatus,
} from '../../types/database';

class OrganizationService extends SupabaseService<
  Organization,
  OrganizationInsert,
  OrganizationUpdate
> {
  constructor() {
    super('organizations');
  }

  /**
   * Get organization by slug
   */
  async getBySlug(slug: string): Promise<Organization | null> {
    return this.getOne({ slug });
  }

  /**
   * Get organizations by type
   */
  async getByType(type: OrganizationType): Promise<Organization[]> {
    const { data } = await this.getAll({
      filters: { type },
    });
    return data;
  }

  /**
   * Get active organizations
   */
  async getActiveOrganizations(): Promise<Organization[]> {
    const { data } = await this.getAll({
      filters: { is_active: true },
    });
    return data;
  }

  /**
   * Get organizations by subscription status
   */
  async getBySubscriptionStatus(
    status: SubscriptionStatus
  ): Promise<Organization[]> {
    const { data } = await this.getAll({
      filters: { subscription_status: status },
    });
    return data;
  }

  /**
   * Create a new organization
   */
  async createOrganization(orgData: OrganizationInsert): Promise<Organization> {
    // Auto-generate slug from name if not provided
    if (!orgData.slug && orgData.name) {
      orgData.slug = this.generateSlug(orgData.name);
    }

    return this.create(orgData);
  }

  /**
   * Update organization settings
   */
  async updateSettings(
    organizationId: string,
    settings: Record<string, any>
  ): Promise<Organization> {
    const org = await this.getById(organizationId);
    if (!org) throw new Error('Organization not found');

    const updatedSettings = {
      ...(typeof org.settings === 'object' ? org.settings : {}),
      ...settings,
    };

    return this.update(organizationId, {
      settings: updatedSettings as any,
    });
  }

  /**
   * Activate organization
   */
  async activate(organizationId: string): Promise<Organization> {
    return this.update(organizationId, { is_active: true });
  }

  /**
   * Deactivate organization
   */
  async deactivate(organizationId: string): Promise<Organization> {
    return this.update(organizationId, { is_active: false });
  }

  /**
   * Update subscription status
   */
  async updateSubscription(
    organizationId: string,
    status: SubscriptionStatus,
    startDate?: string,
    endDate?: string
  ): Promise<Organization> {
    const updates: OrganizationUpdate = {
      subscription_status: status,
    };

    if (startDate) updates.subscription_start_date = startDate;
    if (endDate) updates.subscription_end_date = endDate;

    return this.update(organizationId, updates);
  }

  /**
   * Check if organization subscription is active
   */
  async isSubscriptionActive(organizationId: string): Promise<boolean> {
    const org = await this.getById(organizationId);
    if (!org) return false;

    if (org.subscription_status !== 'active') return false;

    // Check if subscription has expired
    if (org.subscription_end_date) {
      const endDate = new Date(org.subscription_end_date);
      if (endDate < new Date()) return false;
    }

    return true;
  }

  /**
   * Get organizations with expiring subscriptions (within days)
   */
  async getExpiringSubscriptions(withinDays: number = 7): Promise<Organization[]> {
    const { data } = await this.getAll({
      filters: {
        subscription_status: 'active',
        subscription_end_date: {
          operator: 'lte',
          value: new Date(Date.now() + withinDays * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
        },
      },
    });

    return data;
  }

  /**
   * Generate a URL-safe slug from organization name
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Get organization statistics
   */
  async getStats(organizationId: string): Promise<{
    totalUsers: number;
    activeUsers: number;
    subscriptionStatus: SubscriptionStatus;
    daysUntilExpiry: number | null;
  }> {
    const org = await this.getById(organizationId);
    if (!org)
      throw new Error('Organization not found');

    // Import userService to get user counts
    const { userService } = await import('./users.service');
    const userStats = await userService.getUserStats(organizationId);

    let daysUntilExpiry: number | null = null;
    if (org.subscription_end_date) {
      const endDate = new Date(org.subscription_end_date);
      const today = new Date();
      daysUntilExpiry = Math.ceil(
        (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
    }

    return {
      totalUsers: userStats.total,
      activeUsers: userStats.active,
      subscriptionStatus: org.subscription_status,
      daysUntilExpiry,
    };
  }
}

export const organizationService = new OrganizationService();
