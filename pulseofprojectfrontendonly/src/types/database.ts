/**
 * Database Type Definitions
 * Auto-generated types for Supabase tables
 * Based on: supabase/migrations/20251109_phase1_core_entities.sql
 *
 * NOTE: In production, use `supabase gen types typescript` to auto-generate
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ============================================================================
// ENUMS
// ============================================================================

export type UserRole =
  | 'superadmin'
  | 'admin'
  | 'manager'
  | 'analyst'
  | 'user'
  | 'viewer'
  | 'volunteer';

export type OrganizationType =
  | 'political_party'
  | 'campaign'
  | 'ngo'
  | 'advocacy_group';

export type SubscriptionStatus =
  | 'trial'
  | 'active'
  | 'suspended'
  | 'cancelled';

export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'view'
  | 'login'
  | 'logout'
  | 'login_failed'
  | 'export'
  | 'import'
  | 'bulk_upload'
  | 'permission_granted'
  | 'permission_revoked'
  | 'status_changed'
  | 'password_reset';

// ============================================================================
// TABLE ROW TYPES
// ============================================================================

export interface Organization {
  id: string;
  name: string;
  slug: string;
  type: OrganizationType;
  logo_url: string | null;
  website: string | null;
  settings: Json;
  is_active: boolean;
  created_at: string;
  updated_at: string;

  // Subscription
  subscription_status: SubscriptionStatus;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  monthly_fee: number;

  // Contact
  primary_contact_name: string | null;
  primary_contact_email: string | null;
  primary_contact_phone: string | null;

  // Metadata
  metadata: Json;
}

export interface User {
  id: string;
  organization_id: string;

  // Authentication
  email: string;
  username: string;
  password_hash: string | null;

  // Profile
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  bio: string | null;

  // Role & Permissions
  role: UserRole;

  // Status
  is_active: boolean;
  is_verified: boolean;
  email_verified_at: string | null;
  last_login: string | null;

  // Audit
  created_at: string;
  updated_at: string;
  created_by: string | null;

  // Preferences
  preferences: Json;

  // Security
  failed_login_attempts: number;
  locked_until: string | null;
  password_changed_at: string | null;
}

export interface UserPermission {
  id: string;
  user_id: string;
  permission_key: string;
  granted_at: string;
  granted_by: string | null;
  expires_at: string | null;
}

export interface AuditLog {
  id: string;
  organization_id: string | null;
  user_id: string | null;

  // Action details
  action: AuditAction;

  // Resource details
  resource_type: string | null;
  resource_id: string | null;
  resource_name: string | null;

  // Change tracking
  changes: Json | null;
  previous_values: Json | null;
  new_values: Json | null;

  // Request metadata
  ip_address: string | null;
  user_agent: string | null;
  request_method: string | null;
  request_path: string | null;

  // Timestamps
  created_at: string;

  // Additional context
  metadata: Json;
}

// ============================================================================
// PHASE 2: GEOGRAPHY & TERRITORY TABLE TYPES
// ============================================================================

export interface Constituency {
  id: string;
  organization_id: string;

  // Basic Info
  name: string;
  code: string;
  type: ConstituencyType;

  // Geographic Info
  state: string | null;
  district: string | null;
  boundaries: Json | null;
  geom: unknown | null; // PostGIS GEOGRAPHY type

  // Demographics
  population: number | null;
  voter_count: number;
  total_booths: number;
  area_sq_km: number | null;

  // Political Info
  reserved_category: string | null;
  last_election_year: number | null;
  current_representative: string | null;
  current_party: string | null;

  // Metadata
  metadata: Json;
  created_at: string;
  updated_at: string;
}

export interface Ward {
  id: string;
  organization_id: string;
  constituency_id: string;

  // Basic Info
  name: string;
  code: string;
  ward_number: number | null;

  // Geographic Info
  boundaries: Json | null;
  geom: unknown | null; // PostGIS GEOGRAPHY type

  // Demographics
  population: number | null;
  voter_count: number;
  total_booths: number;
  demographics: Json;

  // Socioeconomic Data
  income_level: IncomeLevel | null;
  urbanization: Urbanization | null;
  literacy_rate: number | null;

  // Metadata
  metadata: Json;
  created_at: string;
  updated_at: string;
}

export interface PollingBooth {
  id: string;
  organization_id: string;
  constituency_id: string;
  ward_id: string | null;

  // Booth Identity
  booth_number: string;
  name: string;

  // Location
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  location: unknown | null; // PostGIS GEOGRAPHY type
  landmark: string | null;

  // Voter Stats
  total_voters: number;
  male_voters: number;
  female_voters: number;
  transgender_voters: number;

  // Booth Details
  booth_type: BoothType;
  is_accessible: boolean;
  facilities: Json;

  // Building Info
  building_name: string | null;
  building_type: string | null;
  floor_number: number | null;
  room_number: string | null;

  // Operational Info
  is_active: boolean;
  last_used_election: string | null;
  booth_level_officer: string | null;
  contact_number: string | null;

  // Sentiment & Strategy
  party_strength: Json | null;
  swing_potential: SwingPotential | null;
  priority_level: number;

  // Metadata
  notes: string | null;
  metadata: Json;
  created_at: string;
  updated_at: string;
}

export interface Voter {
  id: string;
  organization_id: string;
  polling_booth_id: string | null;

  // Voter Identity
  voter_id_number: string;
  epic_number: string | null;
  aadhaar_number_hash: string | null;

  // Personal Info
  full_name: string;
  gender: VoterGender | null;
  age: number | null;
  date_of_birth: string | null;

  // Contact Info
  address: string | null;
  phone: string | null;
  email: string | null;
  whatsapp_number: string | null;

  // Demographics
  religion: string | null;
  caste: string | null;
  caste_category: string | null;
  occupation: string | null;
  education: string | null;
  monthly_income_range: string | null;

  // Family & Social Network
  family_head_id: string | null;
  family_size: number | null;
  influencer_score: number;

  // Voting History
  voting_history: Json;
  voter_turnout_rate: number | null;
  first_time_voter: boolean;

  // Political Sentiment
  sentiment: VoterSentiment | null;
  sentiment_score: number | null;
  sentiment_last_updated: string | null;
  preferred_party: string | null;
  previous_party_support: string | null;

  // Issues & Concerns
  top_issues: string[] | null;
  complaints_filed: Json | null;
  benefits_received: Json | null;

  // Engagement
  contacted_by_party: boolean;
  last_contact_date: string | null;
  contact_method: string | null;
  meeting_attendance: number;
  rally_participation: number;

  // Tags & Categories
  tags: string[] | null;
  voter_category: VoterCategory | null;

  // Data Quality
  data_quality_score: number;
  verified: boolean;
  verified_by: string | null;
  verified_at: string | null;

  // Privacy & Consent
  consent_given: boolean;
  consent_date: string | null;
  data_retention_until: string | null;

  // Metadata
  notes: string | null;
  metadata: Json;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

// ============================================================================
// INSERT TYPES (for creating new records)
// ============================================================================

export type OrganizationInsert = Omit<Organization, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type UserInsert = Omit<User, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type UserPermissionInsert = Omit<UserPermission, 'id' | 'granted_at'> & {
  id?: string;
  granted_at?: string;
};

export type AuditLogInsert = Omit<AuditLog, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

// Phase 2 Insert Types
export type ConstituencyInsert = Omit<Constituency, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type WardInsert = Omit<Ward, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type PollingBoothInsert = Omit<PollingBooth, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type VoterInsert = Omit<Voter, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

// ============================================================================
// UPDATE TYPES (for updating existing records)
// ============================================================================

export type OrganizationUpdate = Partial<Omit<Organization, 'id' | 'created_at'>>;
export type UserUpdate = Partial<Omit<User, 'id' | 'created_at'>>;
export type UserPermissionUpdate = Partial<Omit<UserPermission, 'id' | 'user_id' | 'granted_at'>>;

// Phase 2 Update Types
export type ConstituencyUpdate = Partial<Omit<Constituency, 'id' | 'created_at'>>;
export type WardUpdate = Partial<Omit<Ward, 'id' | 'created_at'>>;
export type PollingBoothUpdate = Partial<Omit<PollingBooth, 'id' | 'created_at'>>;
export type VoterUpdate = Partial<Omit<Voter, 'id' | 'created_at'>>;

// ============================================================================
// DATABASE INTERFACE
// ============================================================================

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: Organization;
        Insert: OrganizationInsert;
        Update: OrganizationUpdate;
      };
      users: {
        Row: User;
        Insert: UserInsert;
        Update: UserUpdate;
      };
      user_permissions: {
        Row: UserPermission;
        Insert: UserPermissionInsert;
        Update: UserPermissionUpdate;
      };
      audit_logs: {
        Row: AuditLog;
        Insert: AuditLogInsert;
        Update: never; // Audit logs should not be updated
      };
      // Phase 2 tables
      constituencies: {
        Row: Constituency;
        Insert: ConstituencyInsert;
        Update: ConstituencyUpdate;
      };
      wards: {
        Row: Ward;
        Insert: WardInsert;
        Update: WardUpdate;
      };
      polling_booths: {
        Row: PollingBooth;
        Insert: PollingBoothInsert;
        Update: PollingBoothUpdate;
      };
      voters: {
        Row: Voter;
        Insert: VoterInsert;
        Update: VoterUpdate;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      // Phase 1 functions
      get_user_permissions: {
        Args: { p_user_id: string };
        Returns: { permission_key: string }[];
      };
      has_permission: {
        Args: { p_user_id: string; p_permission: string };
        Returns: boolean;
      };
      // Phase 2 functions
      find_booths_near: {
        Args: {
          p_latitude: number;
          p_longitude: number;
          p_radius_meters?: number;
        };
        Returns: {
          booth_id: string;
          booth_name: string;
          distance_meters: number;
        }[];
      };
      get_constituency_stats: {
        Args: { p_constituency_id: string };
        Returns: {
          total_voters: number;
          male_voters: number;
          female_voters: number;
          support_count: number;
          oppose_count: number;
          undecided_count: number;
          avg_sentiment: number;
        }[];
      };
    };
    Enums: {
      user_role: UserRole;
      organization_type: OrganizationType;
      subscription_status: SubscriptionStatus;
      audit_action: AuditAction;
      constituency_type: ConstituencyType;
      voter_gender: VoterGender;
      voter_sentiment: VoterSentiment;
      voter_category: VoterCategory;
      booth_type: BoothType;
      swing_potential: SwingPotential;
      income_level: IncomeLevel;
      urbanization: Urbanization;
    };
  };
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

// User with organization details
export interface UserWithOrganization extends User {
  organization: Organization;
}

// User with permissions
export interface UserWithPermissions extends User {
  permissions: UserPermission[];
}

// Permission groups for easier management
export type PermissionCategory =
  | 'users'
  | 'voters'
  | 'booths'
  | 'social'
  | 'media'
  | 'analytics'
  | 'reports'
  | 'campaigns'
  | 'field_workers'
  | 'alerts';

export type PermissionAction =
  | 'view'
  | 'create'
  | 'update'
  | 'delete'
  | 'manage'
  | 'export';

export type Permission = `${PermissionCategory}.${PermissionAction}`;

// ============================================================================
// PHASE 2 ENUMS (Geography & Territory)
// ============================================================================

export type ConstituencyType =
  | 'parliament'
  | 'assembly'
  | 'municipal'
  | 'panchayat';

export type VoterGender =
  | 'Male'
  | 'Female'
  | 'Transgender'
  | 'Other';

export type VoterSentiment =
  | 'strong_support'
  | 'support'
  | 'neutral'
  | 'oppose'
  | 'strong_oppose'
  | 'undecided';

export type VoterCategory =
  | 'core_supporter'
  | 'swing_voter'
  | 'opponent';

export type BoothType =
  | 'regular'
  | 'auxiliary'
  | 'special';

export type SwingPotential =
  | 'high'
  | 'medium'
  | 'low';

export type IncomeLevel =
  | 'low'
  | 'middle'
  | 'high';

export type Urbanization =
  | 'urban'
  | 'semi_urban'
  | 'rural';

// Helper type for permission checking
export interface PermissionCheck {
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
}

// Filter types for queries
export interface UserFilters {
  organization_id?: string;
  role?: UserRole | UserRole[];
  is_active?: boolean;
  is_verified?: boolean;
  email?: string;
  search?: string; // Search across name, email, username
}

export interface AuditLogFilters {
  organization_id?: string;
  user_id?: string;
  action?: AuditAction | AuditAction[];
  resource_type?: string;
  date_from?: string;
  date_to?: string;
}

// Phase 2 Filter Types
export interface ConstituencyFilters {
  organization_id?: string;
  type?: ConstituencyType | ConstituencyType[];
  state?: string;
  district?: string;
  search?: string; // Search across name, code
}

export interface PollingBoothFilters {
  organization_id?: string;
  constituency_id?: string;
  ward_id?: string;
  is_active?: boolean;
  booth_type?: BoothType;
  swing_potential?: SwingPotential;
  priority_level?: number;
  search?: string; // Search across name, booth_number, address
}

export interface VoterFilters {
  organization_id?: string;
  polling_booth_id?: string;
  sentiment?: VoterSentiment | VoterSentiment[];
  voter_category?: VoterCategory | VoterCategory[];
  gender?: VoterGender | VoterGender[];
  age_min?: number;
  age_max?: number;
  verified?: boolean;
  consent_given?: boolean;
  tags?: string[];
  search?: string; // Search across name, voter_id_number, epic_number, phone
}

// Utility types for related data
export interface PollingBoothWithConstituency extends PollingBooth {
  constituency: Constituency;
}

export interface VoterWithBooth extends Voter {
  polling_booth: PollingBooth;
}

export interface ConstituencyWithStats extends Constituency {
  stats?: {
    total_voters: number;
    male_voters: number;
    female_voters: number;
    support_count: number;
    oppose_count: number;
    undecided_count: number;
    avg_sentiment: number;
  };
}

// Pagination
export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Sort options
export type SortDirection = 'asc' | 'desc';

export interface SortParams {
  column: string;
  direction: SortDirection;
}
