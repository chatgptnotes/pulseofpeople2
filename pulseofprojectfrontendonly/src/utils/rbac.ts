/**
 * RBAC (Role-Based Access Control) Utilities
 * Supabase integration for permission management
 */

import { SupabaseClient } from '@supabase/supabase-js';
import type { UserPermissions, UserRole, PermissionName } from './permissions';
import { DEFAULT_ROLE_PERMISSIONS } from './permissions';

// =====================================================
// TYPES
// =====================================================

export interface Organization {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  subscription_tier: 'trial' | 'basic' | 'standard' | 'premium' | 'enterprise';
  subscription_status: 'active' | 'suspended' | 'cancelled' | 'expired';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  settings?: Record<string, any>;
  features?: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  is_super_admin: boolean;
  organization_id?: string;
  tenant_id?: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface UserOrganization {
  id: string;
  user_id: string;
  organization_id: string;
  role_id?: string;
  is_primary: boolean;
  joined_at: string;
}

// =====================================================
// FETCH USER PERMISSIONS
// =====================================================

/**
 * Load user's complete permission set from database
 */
export async function loadUserPermissions(
  supabase: SupabaseClient,
  userId: string
): Promise<UserPermissions | null> {
  try {
    // Fetch user data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      console.error('Error fetching user:', userError);
      return null;
    }

    // If super admin, grant all permissions
    if (user.is_super_admin) {
      return {
        userId: user.id,
        role: user.role as UserRole,
        isSuperAdmin: true,
        organizationId: user.organization_id,
        permissions: DEFAULT_ROLE_PERMISSIONS.super_admin,
      };
    }

    // Fetch role-based permissions
    const basePermissions = DEFAULT_ROLE_PERMISSIONS[user.role as UserRole] || [];

    // Fetch custom user permissions (grants and revokes)
    const { data: customPermissions } = await supabase
      .from('user_permissions')
      .select('permission_id, granted, permissions(name)')
      .eq('user_id', userId)
      .or('expires_at.is.null,expires_at.gt.now()');

    const granted: PermissionName[] = [];
    const revoked: PermissionName[] = [];

    if (customPermissions) {
      customPermissions.forEach((cp: any) => {
        const permName = cp.permissions?.name;
        if (permName) {
          if (cp.granted) {
            granted.push(permName);
          } else {
            revoked.push(permName);
          }
        }
      });
    }

    // Combine base permissions with custom permissions
    const allPermissions = [
      ...basePermissions,
      ...granted,
    ].filter((p) => !revoked.includes(p));

    return {
      userId: user.id,
      role: user.role as UserRole,
      isSuperAdmin: false,
      organizationId: user.organization_id,
      permissions: [...new Set(allPermissions)] as PermissionName[], // Remove duplicates
      customPermissions: {
        granted,
        revoked,
      },
    };
  } catch (error) {
    console.error('Error loading user permissions:', error);
    return null;
  }
}

// =====================================================
// ORGANIZATION MANAGEMENT
// =====================================================

/**
 * Fetch user's organization
 */
export async function getUserOrganization(
  supabase: SupabaseClient,
  userId: string
): Promise<Organization | null> {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', userId)
      .single();

    if (!user?.organization_id) return null;

    const { data: org, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', user.organization_id)
      .single();

    if (error) {
      console.error('Error fetching organization:', error);
      return null;
    }

    return org;
  } catch (error) {
    console.error('Error getting user organization:', error);
    return null;
  }
}

/**
 * Fetch all organizations (Super Admin only)
 */
export async function getAllOrganizations(
  supabase: SupabaseClient
): Promise<Organization[]> {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching organizations:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error getting all organizations:', error);
    return [];
  }
}

/**
 * Create new organization
 */
export async function createOrganization(
  supabase: SupabaseClient,
  orgData: Partial<Organization>
): Promise<{ data: Organization | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .insert([orgData])
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error('Error creating organization:', error);
    return { data: null, error };
  }
}

// =====================================================
// USER MANAGEMENT
// =====================================================

/**
 * Fetch users in an organization
 */
export async function getOrganizationUsers(
  supabase: SupabaseClient,
  organizationId: string
): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching organization users:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error getting organization users:', error);
    return [];
  }
}

/**
 * Invite user to organization
 */
export async function inviteUserToOrganization(
  supabase: SupabaseClient,
  data: {
    email: string;
    name: string;
    role: UserRole;
    organization_id: string;
  }
): Promise<{ success: boolean; error?: any; user?: User }> {
  try {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', data.email)
      .single();

    if (existingUser) {
      // User exists, add to organization
      const { error: updateError } = await supabase
        .from('users')
        .update({ organization_id: data.organization_id })
        .eq('id', existingUser.id);

      if (updateError) {
        return { success: false, error: updateError };
      }

      return { success: true, user: existingUser };
    }

    // Create new user
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([{
        email: data.email,
        name: data.name,
        role: data.role,
        organization_id: data.organization_id,
        status: 'active',
      }])
      .select()
      .single();

    if (createError) {
      return { success: false, error: createError };
    }

    // TODO: Send invitation email

    return { success: true, user: newUser };
  } catch (error) {
    console.error('Error inviting user:', error);
    return { success: false, error };
  }
}

/**
 * Update user role
 */
export async function updateUserRole(
  supabase: SupabaseClient,
  userId: string,
  newRole: UserRole,
  changedBy: string
): Promise<{ success: boolean; error?: any }> {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        role: newRole,
        last_role_change: new Date().toISOString(),
        role_changed_by: changedBy,
      })
      .eq('id', userId);

    if (error) {
      return { success: false, error };
    }

    // Log audit trail
    await supabase.from('rbac_audit_log').insert([{
      action: 'role_assigned',
      actor_id: changedBy,
      target_user_id: userId,
      new_value: { role: newRole },
    }]);

    return { success: true };
  } catch (error) {
    console.error('Error updating user role:', error);
    return { success: false, error };
  }
}

/**
 * Remove user from organization
 */
export async function removeUserFromOrganization(
  supabase: SupabaseClient,
  userId: string,
  removedBy: string
): Promise<{ success: boolean; error?: any }> {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        status: 'inactive',
        organization_id: null,
      })
      .eq('id', userId);

    if (error) {
      return { success: false, error };
    }

    // Log audit trail
    await supabase.from('rbac_audit_log').insert([{
      action: 'user_removed',
      actor_id: removedBy,
      target_user_id: userId,
    }]);

    return { success: true };
  } catch (error) {
    console.error('Error removing user:', error);
    return { success: false, error };
  }
}

// =====================================================
// PERMISSION GRANTS & REVOKES
// =====================================================

/**
 * Grant custom permission to user
 */
export async function grantPermissionToUser(
  supabase: SupabaseClient,
  userId: string,
  permissionName: PermissionName,
  grantedBy: string,
  expiresAt?: string
): Promise<{ success: boolean; error?: any }> {
  try {
    // Get permission ID
    const { data: permission } = await supabase
      .from('permissions')
      .select('id')
      .eq('name', permissionName)
      .single();

    if (!permission) {
      return { success: false, error: 'Permission not found' };
    }

    // Upsert user permission
    const { error } = await supabase
      .from('user_permissions')
      .upsert([{
        user_id: userId,
        permission_id: permission.id,
        granted: true,
        granted_by: grantedBy,
        expires_at: expiresAt,
      }], { onConflict: 'user_id,permission_id' });

    if (error) {
      return { success: false, error };
    }

    // Log audit trail
    await supabase.from('rbac_audit_log').insert([{
      action: 'permission_granted',
      actor_id: grantedBy,
      target_user_id: userId,
      new_value: { permission: permissionName, expires_at: expiresAt },
    }]);

    return { success: true };
  } catch (error) {
    console.error('Error granting permission:', error);
    return { success: false, error };
  }
}

/**
 * Revoke custom permission from user
 */
export async function revokePermissionFromUser(
  supabase: SupabaseClient,
  userId: string,
  permissionName: PermissionName,
  revokedBy: string
): Promise<{ success: boolean; error?: any }> {
  try {
    // Get permission ID
    const { data: permission } = await supabase
      .from('permissions')
      .select('id')
      .eq('name', permissionName)
      .single();

    if (!permission) {
      return { success: false, error: 'Permission not found' };
    }

    // Update user permission to revoked
    const { error } = await supabase
      .from('user_permissions')
      .upsert([{
        user_id: userId,
        permission_id: permission.id,
        granted: false,
        granted_by: revokedBy,
      }], { onConflict: 'user_id,permission_id' });

    if (error) {
      return { success: false, error };
    }

    // Log audit trail
    await supabase.from('rbac_audit_log').insert([{
      action: 'permission_revoked',
      actor_id: revokedBy,
      target_user_id: userId,
      old_value: { permission: permissionName },
    }]);

    return { success: true };
  } catch (error) {
    console.error('Error revoking permission:', error);
    return { success: false, error };
  }
}

// =====================================================
// AUDIT LOG
// =====================================================

export interface AuditLogEntry {
  id: string;
  action: string;
  actor_id: string;
  target_user_id?: string;
  target_organization_id?: string;
  old_value?: any;
  new_value?: any;
  metadata?: any;
  created_at: string;
}

/**
 * Fetch audit logs
 */
export async function getAuditLogs(
  supabase: SupabaseClient,
  filters?: {
    userId?: string;
    organizationId?: string;
    action?: string;
    limit?: number;
  }
): Promise<AuditLogEntry[]> {
  try {
    let query = supabase
      .from('rbac_audit_log')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.userId) {
      query = query.or(`actor_id.eq.${filters.userId},target_user_id.eq.${filters.userId}`);
    }

    if (filters?.organizationId) {
      query = query.eq('target_organization_id', filters.organizationId);
    }

    if (filters?.action) {
      query = query.eq('action', filters.action);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching audit logs:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error getting audit logs:', error);
    return [];
  }
}

// =====================================================
// STATISTICS & ANALYTICS
// =====================================================

/**
 * Get organization statistics
 */
export async function getOrganizationStats(
  supabase: SupabaseClient,
  organizationId: string
): Promise<{
  totalUsers: number;
  activeUsers: number;
  adminCount: number;
  userCount: number;
  volunteerCount: number;
}> {
  try {
    const { data: users } = await supabase
      .from('users')
      .select('role, status')
      .eq('organization_id', organizationId);

    if (!users) {
      return {
        totalUsers: 0,
        activeUsers: 0,
        adminCount: 0,
        userCount: 0,
        volunteerCount: 0,
      };
    }

    return {
      totalUsers: users.length,
      activeUsers: users.filter((u) => u.status === 'active').length,
      adminCount: users.filter((u) => u.role === 'admin').length,
      userCount: users.filter((u) => u.role === 'user').length,
      volunteerCount: users.filter((u) => u.role === 'volunteer').length,
    };
  } catch (error) {
    console.error('Error getting organization stats:', error);
    return {
      totalUsers: 0,
      activeUsers: 0,
      adminCount: 0,
      userCount: 0,
      volunteerCount: 0,
    };
  }
}
