/**
 * User Service
 * Domain-specific operations for user management
 */

import { SupabaseService } from './crud';
import {
  User,
  UserInsert,
  UserUpdate,
  UserWithOrganization,
  UserWithPermissions,
  UserFilters,
  UserRole,
  Permission,
} from '../../types/database';
import { supabase, callFunction } from './index';

class UserService extends SupabaseService<User, UserInsert, UserUpdate> {
  constructor() {
    super('users');
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role: UserRole | UserRole[]): Promise<User[]> {
    const { data } = await this.getAll({
      filters: { role },
    });
    return data;
  }

  /**
   * Get users by organization
   */
  async getUsersByOrganization(organizationId: string): Promise<User[]> {
    const { data } = await this.getAll({
      filters: { organization_id: organizationId },
    });
    return data;
  }

  /**
   * Get user with organization details
   */
  async getUserWithOrganization(userId: string): Promise<UserWithOrganization | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*, organization:organizations(*)')
      .eq('id', userId)
      .single();

    if (error || !data) return null;

    return data as unknown as UserWithOrganization;
  }

  /**
   * Get user with permissions
   */
  async getUserWithPermissions(userId: string): Promise<UserWithPermissions | null> {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        permissions:user_permissions(*)
      `)
      .eq('id', userId)
      .single();

    if (error || !data) return null;

    return data as unknown as UserWithPermissions;
  }

  /**
   * Search users across multiple fields
   */
  async searchUsers(query: string, organizationId?: string): Promise<User[]> {
    const filters: any = {};
    if (organizationId) {
      filters.organization_id = organizationId;
    }

    const { data } = await this.search(
      ['full_name', 'email', 'username'],
      query,
      { filters }
    );

    return data;
  }

  /**
   * Get users with advanced filtering
   */
  async getFilteredUsers(filters: UserFilters): Promise<User[]> {
    const queryFilters: any = {};

    if (filters.organization_id) {
      queryFilters.organization_id = filters.organization_id;
    }

    if (filters.role) {
      queryFilters.role = filters.role;
    }

    if (filters.is_active !== undefined) {
      queryFilters.is_active = filters.is_active;
    }

    if (filters.is_verified !== undefined) {
      queryFilters.is_verified = filters.is_verified;
    }

    if (filters.email) {
      queryFilters.email = filters.email;
    }

    if (filters.search) {
      return this.searchUsers(filters.search, filters.organization_id);
    }

    const { data } = await this.getAll({ filters: queryFilters });
    return data;
  }

  /**
   * Create a new user
   */
  async createUser(userData: UserInsert): Promise<User> {
    return this.create(userData);
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, updates: UserUpdate): Promise<User> {
    return this.update(userId, updates);
  }

  /**
   * Deactivate user
   */
  async deactivateUser(userId: string): Promise<User> {
    return this.update(userId, { is_active: false });
  }

  /**
   * Activate user
   */
  async activateUser(userId: string): Promise<User> {
    return this.update(userId, { is_active: true });
  }

  /**
   * Verify user email
   */
  async verifyEmail(userId: string): Promise<User> {
    return this.update(userId, {
      is_verified: true,
      email_verified_at: new Date().toISOString(),
    });
  }

  /**
   * Update user role
   */
  async updateRole(userId: string, newRole: UserRole): Promise<User> {
    return this.update(userId, { role: newRole });
  }

  /**
   * Record login attempt
   */
  async recordLogin(userId: string, success: boolean): Promise<void> {
    if (success) {
      await this.update(userId, {
        last_login: new Date().toISOString(),
        failed_login_attempts: 0,
        locked_until: null,
      });
    } else {
      const user = await this.getById(userId);
      if (!user) return;

      const failedAttempts = (user.failed_login_attempts || 0) + 1;
      const updates: UserUpdate = {
        failed_login_attempts: failedAttempts,
      };

      // Lock account after 5 failed attempts for 30 minutes
      if (failedAttempts >= 5) {
        const lockUntil = new Date();
        lockUntil.setMinutes(lockUntil.getMinutes() + 30);
        updates.locked_until = lockUntil.toISOString();
      }

      await this.update(userId, updates);
    }
  }

  /**
   * Check if user account is locked
   */
  async isAccountLocked(userId: string): Promise<boolean> {
    const user = await this.getById(userId);
    if (!user || !user.locked_until) return false;

    const lockUntil = new Date(user.locked_until);
    return lockUntil > new Date();
  }

  /**
   * Unlock user account
   */
  async unlockAccount(userId: string): Promise<User> {
    return this.update(userId, {
      locked_until: null,
      failed_login_attempts: 0,
    });
  }

  /**
   * Get user permissions
   */
  async getUserPermissions(userId: string): Promise<Permission[]> {
    const result = await callFunction<{ permission_key: string }[]>(
      'get_user_permissions',
      { p_user_id: userId }
    );

    return result.map((r) => r.permission_key as Permission);
  }

  /**
   * Check if user has specific permission
   */
  async hasPermission(userId: string, permission: Permission): Promise<boolean> {
    return callFunction<boolean>('has_permission', {
      p_user_id: userId,
      p_permission: permission,
    });
  }

  /**
   * Grant permission to user
   */
  async grantPermission(
    userId: string,
    permission: Permission,
    grantedBy: string
  ): Promise<void> {
    await supabase.from('user_permissions').insert({
      user_id: userId,
      permission_key: permission,
      granted_by: grantedBy,
    });
  }

  /**
   * Revoke permission from user
   */
  async revokePermission(userId: string, permission: Permission): Promise<void> {
    await supabase
      .from('user_permissions')
      .delete()
      .eq('user_id', userId)
      .eq('permission_key', permission);
  }

  /**
   * Get users stats by organization
   */
  async getUserStats(organizationId: string): Promise<{
    total: number;
    active: number;
    byRole: Record<UserRole, number>;
  }> {
    const users = await this.getUsersByOrganization(organizationId);

    const stats = {
      total: users.length,
      active: users.filter((u) => u.is_active).length,
      byRole: {} as Record<UserRole, number>,
    };

    // Count users by role
    const roles: UserRole[] = [
      'superadmin',
      'admin',
      'manager',
      'analyst',
      'user',
      'viewer',
      'volunteer',
    ];

    roles.forEach((role) => {
      stats.byRole[role] = users.filter((u) => u.role === role).length;
    });

    return stats;
  }
}

export const userService = new UserService();
