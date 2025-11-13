/**
 * Permission Management Utilities
 * Handles permission checking, role hierarchy, and RBAC logic
 */

// =====================================================
// TYPES & INTERFACES
// =====================================================

export type UserRole =
  | 'superadmin'
  | 'super_admin'
  | 'admin'
  | 'manager'
  | 'analyst'
  | 'user'
  | 'viewer'
  | 'ward-coordinator'
  | 'social-media'
  | 'survey-team'
  | 'truth-team'
  | 'volunteer';

export type PermissionName =
  // User management
  | 'view_users'
  | 'create_users'
  | 'edit_users'
  | 'delete_users'
  | 'manage_roles'
  // Data management
  | 'view_dashboard'
  | 'view_analytics'
  | 'view_reports'
  | 'export_data'
  | 'import_data'
  | 'create_surveys'
  | 'view_surveys'
  // Voter management
  | 'view_voters'
  | 'edit_voters'
  | 'delete_voters'
  // Field workers
  | 'view_field_workers'
  | 'manage_field_workers'
  | 'view_field_reports'
  | 'submit_field_reports'
  // Social media
  | 'view_social_media'
  | 'manage_social_channels'
  // Competitor analysis
  | 'view_competitor_analysis'
  // AI & Insights
  | 'view_ai_insights'
  | 'generate_ai_insights'
  // Settings
  | 'view_settings'
  | 'edit_settings'
  | 'manage_billing'
  // Alerts
  | 'view_alerts'
  | 'manage_alerts'
  // System (Super Admin only)
  | 'manage_organizations'
  | 'view_all_data'
  | 'manage_system_settings'
  | 'view_audit_logs';

export interface Permission {
  id: string;
  name: PermissionName;
  display_name: string;
  description: string;
  category: 'users' | 'data' | 'analytics' | 'settings' | 'billing' | 'system';
}

export interface Role {
  id: string;
  name: UserRole;
  display_name: string;
  description: string;
  level: number;
  permissions: PermissionName[];
}

export interface UserPermissions {
  userId: string;
  role: UserRole;
  isSuperAdmin: boolean;
  organizationId?: string;
  permissions: PermissionName[];
  customPermissions?: {
    granted: PermissionName[];
    revoked: PermissionName[];
  };
}

// =====================================================
// ROLE HIERARCHY & LEVELS
// =====================================================

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  superadmin: 1,
  super_admin: 1,
  admin: 2,
  manager: 3,
  analyst: 4,
  'ward-coordinator': 4,
  'social-media': 4,
  'survey-team': 4,
  'truth-team': 4,
  user: 5,
  viewer: 6,
  volunteer: 7,
};

export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  superadmin: 'Super Administrator',
  super_admin: 'Super Administrator',
  admin: 'Administrator',
  manager: 'Manager',
  analyst: 'Analyst',
  'ward-coordinator': 'Ward Coordinator',
  'social-media': 'Social Media Manager',
  'survey-team': 'Survey Team',
  'truth-team': 'Truth Team',
  user: 'User',
  viewer: 'Viewer',
  volunteer: 'Volunteer',
};

// =====================================================
// DEFAULT ROLE PERMISSIONS
// =====================================================

export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, PermissionName[]> = {
  superadmin: [
    // All permissions
    'view_users', 'create_users', 'edit_users', 'delete_users', 'manage_roles',
    'view_dashboard', 'view_analytics', 'view_reports', 'export_data', 'import_data',
    'create_surveys', 'view_surveys', 'view_voters', 'edit_voters', 'delete_voters',
    'view_field_workers', 'manage_field_workers', 'view_field_reports', 'submit_field_reports',
    'view_social_media', 'manage_social_channels', 'view_competitor_analysis',
    'view_ai_insights', 'generate_ai_insights', 'view_settings', 'edit_settings',
    'manage_billing', 'view_alerts', 'manage_alerts', 'manage_organizations',
    'view_all_data', 'manage_system_settings', 'view_audit_logs',
  ],
  super_admin: [
    // All permissions (duplicate for backward compatibility)
    'view_users', 'create_users', 'edit_users', 'delete_users', 'manage_roles',
    'view_dashboard', 'view_analytics', 'view_reports', 'export_data', 'import_data',
    'create_surveys', 'view_surveys', 'view_voters', 'edit_voters', 'delete_voters',
    'view_field_workers', 'manage_field_workers', 'view_field_reports', 'submit_field_reports',
    'view_social_media', 'manage_social_channels', 'view_competitor_analysis',
    'view_ai_insights', 'generate_ai_insights', 'view_settings', 'edit_settings',
    'manage_billing', 'view_alerts', 'manage_alerts', 'manage_organizations',
    'view_all_data', 'manage_system_settings', 'view_audit_logs',
  ],
  admin: [
    // All except system permissions
    'view_users', 'create_users', 'edit_users', 'delete_users', 'manage_roles',
    'view_dashboard', 'view_analytics', 'view_reports', 'export_data', 'import_data',
    'create_surveys', 'view_surveys', 'view_voters', 'edit_voters', 'delete_voters',
    'view_field_workers', 'manage_field_workers', 'view_field_reports', 'submit_field_reports',
    'view_social_media', 'manage_social_channels', 'view_competitor_analysis',
    'view_ai_insights', 'generate_ai_insights', 'view_settings', 'edit_settings',
    'manage_billing', 'view_alerts', 'manage_alerts',
  ],
  manager: [
    'view_users', 'create_users', 'edit_users',
    'view_dashboard', 'view_analytics', 'view_reports', 'export_data',
    'create_surveys', 'view_surveys', 'view_field_workers', 'manage_field_workers',
    'view_field_reports', 'view_alerts',
  ],
  analyst: [
    'view_dashboard', 'view_analytics', 'view_reports', 'export_data',
    'view_surveys', 'view_field_reports', 'view_social_media',
    'view_competitor_analysis', 'view_ai_insights', 'view_alerts',
  ],
  'ward-coordinator': [
    'view_dashboard', 'view_analytics', 'view_reports',
    'view_surveys', 'view_field_workers', 'view_field_reports',
    'submit_field_reports', 'view_alerts',
  ],
  'social-media': [
    'view_dashboard', 'view_analytics', 'view_reports',
    'view_social_media', 'manage_social_channels', 'view_alerts',
  ],
  'survey-team': [
    'view_dashboard', 'view_reports',
    'create_surveys', 'view_surveys', 'view_alerts',
  ],
  'truth-team': [
    'view_dashboard', 'view_analytics', 'view_reports',
    'view_social_media', 'view_competitor_analysis', 'view_alerts',
  ],
  user: [
    'view_dashboard', 'view_analytics', 'view_reports',
    'view_surveys', 'view_field_reports', 'view_alerts',
  ],
  viewer: [
    'view_dashboard', 'view_analytics', 'view_reports', 'view_alerts',
  ],
  volunteer: [
    'view_dashboard', 'submit_field_reports', 'view_surveys',
  ],
};

// =====================================================
// PERMISSION CHECKING FUNCTIONS
// =====================================================

/**
 * Check if a role has a specific permission
 */
export function roleHasPermission(role: UserRole, permission: PermissionName): boolean {
  const rolePermissions = DEFAULT_ROLE_PERMISSIONS[role] || [];
  return rolePermissions.includes(permission);
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(
  userPermissions: UserPermissions | null,
  permission: PermissionName
): boolean {
  if (!userPermissions) return false;

  // Super admins have all permissions
  if (userPermissions.isSuperAdmin) return true;

  // Check if permission is in user's permission list
  if (userPermissions.permissions.includes(permission)) {
    // Check if it's not explicitly revoked
    if (userPermissions.customPermissions?.revoked.includes(permission)) {
      return false;
    }
    return true;
  }

  // Check if permission is explicitly granted
  if (userPermissions.customPermissions?.granted.includes(permission)) {
    return true;
  }

  return false;
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(
  userPermissions: UserPermissions | null,
  permissions: PermissionName[]
): boolean {
  return permissions.some((permission) => hasPermission(userPermissions, permission));
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(
  userPermissions: UserPermissions | null,
  permissions: PermissionName[]
): boolean {
  return permissions.every((permission) => hasPermission(userPermissions, permission));
}

// =====================================================
// ROLE COMPARISON FUNCTIONS
// =====================================================

/**
 * Check if role A has higher authority than role B
 */
export function isRoleHigherThan(roleA: UserRole, roleB: UserRole): boolean {
  return ROLE_HIERARCHY[roleA] < ROLE_HIERARCHY[roleB];
}

/**
 * Check if role A has same or higher authority than role B
 */
export function isRoleSameOrHigherThan(roleA: UserRole, roleB: UserRole): boolean {
  return ROLE_HIERARCHY[roleA] <= ROLE_HIERARCHY[roleB];
}

/**
 * Check if user's role is higher than specified role
 */
export function hasRoleOrHigher(
  userPermissions: UserPermissions | null,
  requiredRole: UserRole
): boolean {
  if (!userPermissions) return false;
  if (userPermissions.isSuperAdmin) return true;
  return isRoleSameOrHigherThan(userPermissions.role, requiredRole);
}

// =====================================================
// ADMIN & SUPER ADMIN CHECKS
// =====================================================

/**
 * Check if user is super admin
 */
export function isSuperAdmin(userPermissions: UserPermissions | null): boolean {
  return userPermissions?.isSuperAdmin || false;
}

/**
 * Check if user is admin of their organization
 */
export function isAdmin(userPermissions: UserPermissions | null): boolean {
  if (!userPermissions) return false;
  return userPermissions.isSuperAdmin || userPermissions.role === 'admin' || userPermissions.role === 'superadmin' || userPermissions.role === 'super_admin';
}

/**
 * Check if user is admin or manager
 */
export function isAdminOrManager(userPermissions: UserPermissions | null): boolean {
  if (!userPermissions) return false;
  return (
    userPermissions.isSuperAdmin ||
    userPermissions.role === 'admin' ||
    userPermissions.role === 'manager'
  );
}

// =====================================================
// PERMISSION UTILITIES
// =====================================================

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole): PermissionName[] {
  return DEFAULT_ROLE_PERMISSIONS[role] || [];
}

/**
 * Get display name for a role
 */
export function getRoleDisplayName(role: UserRole): string {
  return ROLE_DISPLAY_NAMES[role] || role;
}

/**
 * Get all available roles
 */
export function getAllRoles(): UserRole[] {
  return Object.keys(ROLE_DISPLAY_NAMES) as UserRole[];
}

/**
 * Get roles that current user can assign (lower level than their role)
 */
export function getAssignableRoles(userPermissions: UserPermissions | null): UserRole[] {
  if (!userPermissions) return [];

  // Super admins can assign all roles
  if (userPermissions.isSuperAdmin) {
    return getAllRoles();
  }

  // Other roles can only assign roles lower than themselves
  const currentRoleLevel = ROLE_HIERARCHY[userPermissions.role];
  return getAllRoles().filter((role) => ROLE_HIERARCHY[role] > currentRoleLevel);
}

/**
 * Check if user can manage another user (based on role hierarchy)
 */
export function canManageUser(
  managerPermissions: UserPermissions | null,
  targetUserRole: UserRole
): boolean {
  if (!managerPermissions) return false;

  // Super admins can manage anyone
  if (managerPermissions.isSuperAdmin) return true;

  // Check if manager has permission to manage users
  if (!hasPermission(managerPermissions, 'edit_users')) return false;

  // Can only manage users with lower role level
  return isRoleHigherThan(managerPermissions.role, targetUserRole);
}

// =====================================================
// FEATURE FLAGS & SUBSCRIPTION CHECKS
// =====================================================

export interface OrganizationFeatures {
  analytics: boolean;
  aiInsights: boolean;
  socialMedia: boolean;
  fieldWorkers: boolean;
  voterDatabase: boolean;
  competitorAnalysis: boolean;
  customBranding: boolean;
  apiAccess: boolean;
  whatsappBot: boolean;
  exportData: boolean;
}

/**
 * Check if organization has a specific feature enabled
 */
export function hasFeatureAccess(
  features: Partial<OrganizationFeatures> | null,
  feature: keyof OrganizationFeatures
): boolean {
  if (!features) return false;
  return features[feature] === true;
}

/**
 * Get default features based on subscription tier
 */
export function getDefaultFeatures(
  tier: 'trial' | 'basic' | 'standard' | 'premium' | 'enterprise'
): OrganizationFeatures {
  const featureTiers: Record<string, OrganizationFeatures> = {
    trial: {
      analytics: true,
      aiInsights: false,
      socialMedia: false,
      fieldWorkers: true,
      voterDatabase: true,
      competitorAnalysis: false,
      customBranding: false,
      apiAccess: false,
      whatsappBot: false,
      exportData: true,
    },
    basic: {
      analytics: true,
      aiInsights: false,
      socialMedia: true,
      fieldWorkers: true,
      voterDatabase: true,
      competitorAnalysis: false,
      customBranding: false,
      apiAccess: false,
      whatsappBot: false,
      exportData: true,
    },
    standard: {
      analytics: true,
      aiInsights: true,
      socialMedia: true,
      fieldWorkers: true,
      voterDatabase: true,
      competitorAnalysis: true,
      customBranding: false,
      apiAccess: false,
      whatsappBot: true,
      exportData: true,
    },
    premium: {
      analytics: true,
      aiInsights: true,
      socialMedia: true,
      fieldWorkers: true,
      voterDatabase: true,
      competitorAnalysis: true,
      customBranding: true,
      apiAccess: true,
      whatsappBot: true,
      exportData: true,
    },
    enterprise: {
      analytics: true,
      aiInsights: true,
      socialMedia: true,
      fieldWorkers: true,
      voterDatabase: true,
      competitorAnalysis: true,
      customBranding: true,
      apiAccess: true,
      whatsappBot: true,
      exportData: true,
    },
  };

  return featureTiers[tier] || featureTiers.basic;
}

// =====================================================
// PERMISSION LABELS & DESCRIPTIONS
// =====================================================

export const PERMISSION_LABELS: Record<PermissionName, { label: string; description: string }> = {
  // User management
  view_users: { label: 'View Users', description: 'View list of users in organization' },
  create_users: { label: 'Create Users', description: 'Invite and create new users' },
  edit_users: { label: 'Edit Users', description: 'Edit user information and roles' },
  delete_users: { label: 'Delete Users', description: 'Remove users from organization' },
  manage_roles: { label: 'Manage Roles', description: 'Create and assign roles' },

  // Data management
  view_dashboard: { label: 'View Dashboard', description: 'Access main dashboard' },
  view_analytics: { label: 'View Analytics', description: 'Access analytics and reports' },
  view_reports: { label: 'View Reports', description: 'Access detailed reports' },
  export_data: { label: 'Export Data', description: 'Export data to CSV/Excel' },
  import_data: { label: 'Import Data', description: 'Import data from files' },
  create_surveys: { label: 'Create Surveys', description: 'Create and manage surveys' },
  view_surveys: { label: 'View Surveys', description: 'View survey results' },

  // Voter management
  view_voters: { label: 'View Voters', description: 'Access voter database' },
  edit_voters: { label: 'Edit Voters', description: 'Edit voter information' },
  delete_voters: { label: 'Delete Voters', description: 'Remove voter records' },

  // Field workers
  view_field_workers: { label: 'View Field Workers', description: 'View field worker list' },
  manage_field_workers: { label: 'Manage Field Workers', description: 'Add/remove field workers' },
  view_field_reports: { label: 'View Field Reports', description: 'View reports from field' },
  submit_field_reports: { label: 'Submit Field Reports', description: 'Submit field reports' },

  // Social media
  view_social_media: { label: 'View Social Media', description: 'Access social media monitoring' },
  manage_social_channels: { label: 'Manage Social Channels', description: 'Add/remove social channels' },

  // Competitor analysis
  view_competitor_analysis: { label: 'View Competitor Analysis', description: 'Access competitor data' },

  // AI & Insights
  view_ai_insights: { label: 'View AI Insights', description: 'Access AI-generated insights' },
  generate_ai_insights: { label: 'Generate AI Insights', description: 'Trigger AI analysis' },

  // Settings
  view_settings: { label: 'View Settings', description: 'View organization settings' },
  edit_settings: { label: 'Edit Settings', description: 'Modify organization settings' },
  manage_billing: { label: 'Manage Billing', description: 'Access billing and subscription' },

  // Alerts
  view_alerts: { label: 'View Alerts', description: 'View system alerts' },
  manage_alerts: { label: 'Manage Alerts', description: 'Create and configure alerts' },

  // System
  manage_organizations: { label: 'Manage Organizations', description: 'Create/delete organizations' },
  view_all_data: { label: 'View All Data', description: 'Access data across all organizations' },
  manage_system_settings: { label: 'Manage System Settings', description: 'Configure platform-wide settings' },
  view_audit_logs: { label: 'View Audit Logs', description: 'Access system audit logs' },
};

/**
 * Get permission label and description
 */
export function getPermissionInfo(permission: PermissionName) {
  return PERMISSION_LABELS[permission] || { label: permission, description: '' };
}
