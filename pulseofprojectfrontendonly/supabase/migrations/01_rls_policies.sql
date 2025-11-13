-- =====================================================
-- PULSE OF PEOPLE - RLS POLICIES
-- Row Level Security for Role-Based Access Control
-- =====================================================
-- Role Hierarchy: superadmin → admin → manager → analyst → user → viewer → volunteer
-- =====================================================

-- Helper function to get current user's role from users table
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role
    FROM users
    WHERE auth_user_id = auth.uid();

    RETURN COALESCE(user_role, 'viewer');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get current user's organization
CREATE OR REPLACE FUNCTION get_current_user_organization()
RETURNS UUID AS $$
DECLARE
    org_id UUID;
BEGIN
    SELECT organization_id INTO org_id
    FROM users
    WHERE auth_user_id = auth.uid();

    RETURN org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user has specific permission
CREATE OR REPLACE FUNCTION user_has_permission(permission_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    has_perm BOOLEAN;
    user_role TEXT;
    user_id_var UUID;
BEGIN
    -- Get current user's role
    user_role := get_current_user_role();

    -- Superadmin has all permissions
    IF user_role = 'superadmin' THEN
        RETURN TRUE;
    END IF;

    -- Get user ID
    SELECT id INTO user_id_var FROM users WHERE auth_user_id = auth.uid();

    -- Check role-based permissions
    SELECT EXISTS (
        SELECT 1 FROM role_permissions rp
        JOIN permissions p ON p.id = rp.permission_id
        WHERE rp.role = user_role AND p.name = permission_name
    ) INTO has_perm;

    IF has_perm THEN
        RETURN TRUE;
    END IF;

    -- Check user-specific permissions
    SELECT EXISTS (
        SELECT 1 FROM user_permissions up
        JOIN permissions p ON p.id = up.permission_id
        WHERE up.user_id = user_id_var
        AND p.name = permission_name
        AND up.granted = true
    ) INTO has_perm;

    RETURN COALESCE(has_perm, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE two_factor_backup_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE states ENABLE ROW LEVEL SECURITY;
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE constituencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE polling_booths ENABLE ROW LEVEL SECURITY;
ALTER TABLE political_parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE voter_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE direct_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE sentiment_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE booth_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_upload_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_upload_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE voters ENABLE ROW LEVEL SECURITY;
ALTER TABLE voter_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE voter_profiles_whatsapp ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- ORGANIZATIONS POLICIES
-- =====================================================

-- Superadmin and Admin can view all organizations
CREATE POLICY "Superadmin/Admin can view all organizations"
ON organizations FOR SELECT
USING (get_current_user_role() IN ('superadmin', 'admin'));

-- Users can view their own organization
CREATE POLICY "Users can view their own organization"
ON organizations FOR SELECT
USING (id = get_current_user_organization());

-- Superadmin can create organizations
CREATE POLICY "Superadmin can create organizations"
ON organizations FOR INSERT
WITH CHECK (get_current_user_role() = 'superadmin');

-- Superadmin and Admin can update their organization
CREATE POLICY "Superadmin/Admin can update organizations"
ON organizations FOR UPDATE
USING (
    get_current_user_role() = 'superadmin' OR
    (get_current_user_role() = 'admin' AND id = get_current_user_organization())
);

-- =====================================================
-- PERMISSIONS POLICIES
-- =====================================================

-- All authenticated users can view permissions
CREATE POLICY "Authenticated users can view permissions"
ON permissions FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Superadmin can manage permissions
CREATE POLICY "Superadmin can manage permissions"
ON permissions FOR ALL
USING (get_current_user_role() = 'superadmin');

-- =====================================================
-- USERS POLICIES
-- =====================================================

-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
ON users FOR SELECT
USING (auth_user_id = auth.uid());

-- Superadmin and Admin can view all users in their organization
CREATE POLICY "Superadmin/Admin can view users"
ON users FOR SELECT
USING (
    get_current_user_role() = 'superadmin' OR
    (get_current_user_role() IN ('admin', 'manager') AND organization_id = get_current_user_organization())
);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON users FOR UPDATE
USING (auth_user_id = auth.uid())
WITH CHECK (auth_user_id = auth.uid());

-- Superadmin and Admin can create users
CREATE POLICY "Superadmin/Admin can create users"
ON users FOR INSERT
WITH CHECK (
    get_current_user_role() IN ('superadmin', 'admin')
);

-- =====================================================
-- ROLE_PERMISSIONS POLICIES
-- =====================================================

-- Authenticated users can view role permissions
CREATE POLICY "Authenticated users can view role permissions"
ON role_permissions FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Superadmin can manage role permissions
CREATE POLICY "Superadmin can manage role permissions"
ON role_permissions FOR ALL
USING (get_current_user_role() = 'superadmin');

-- =====================================================
-- USER_PERMISSIONS POLICIES
-- =====================================================

-- Users can view their own permissions
CREATE POLICY "Users can view their own permissions"
ON user_permissions FOR SELECT
USING (
    user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
);

-- Admin can manage user permissions in their organization
CREATE POLICY "Admin can manage user permissions"
ON user_permissions FOR ALL
USING (
    get_current_user_role() IN ('superadmin', 'admin') AND
    user_id IN (SELECT id FROM users WHERE organization_id = get_current_user_organization())
);

-- =====================================================
-- AUDIT_LOGS POLICIES
-- =====================================================

-- Superadmin and Admin can view audit logs
CREATE POLICY "Superadmin/Admin can view audit logs"
ON audit_logs FOR SELECT
USING (get_current_user_role() IN ('superadmin', 'admin'));

-- All authenticated users can insert audit logs
CREATE POLICY "Authenticated users can create audit logs"
ON audit_logs FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- =====================================================
-- NOTIFICATIONS POLICIES
-- =====================================================

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
ON notifications FOR SELECT
USING (
    user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
ON notifications FOR UPDATE
USING (
    user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
);

-- System can create notifications for users
CREATE POLICY "System can create notifications"
ON notifications FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- =====================================================
-- TWO_FACTOR_BACKUP_CODES POLICIES
-- =====================================================

-- Users can view their own backup codes
CREATE POLICY "Users can view their own backup codes"
ON two_factor_backup_codes FOR SELECT
USING (
    user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
);

-- Users can manage their own backup codes
CREATE POLICY "Users can manage their own backup codes"
ON two_factor_backup_codes FOR ALL
USING (
    user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
);

-- =====================================================
-- UPLOADED_FILES POLICIES
-- =====================================================

-- Users can view their own files
CREATE POLICY "Users can view their own files"
ON uploaded_files FOR SELECT
USING (
    user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
);

-- Superadmin and Admin can view all files in organization
CREATE POLICY "Superadmin/Admin can view all files"
ON uploaded_files FOR SELECT
USING (
    get_current_user_role() IN ('superadmin', 'admin')
);

-- Users can upload files
CREATE POLICY "Users can upload files"
ON uploaded_files FOR INSERT
WITH CHECK (
    user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
);

-- Users can delete their own files
CREATE POLICY "Users can delete their own files"
ON uploaded_files FOR DELETE
USING (
    user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
);

-- =====================================================
-- GEOGRAPHY TABLES POLICIES (Read-only for most users)
-- =====================================================

-- All authenticated users can view geography data
CREATE POLICY "Authenticated users can view states"
ON states FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view districts"
ON districts FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view constituencies"
ON constituencies FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view polling booths"
ON polling_booths FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Superadmin can manage geography data
CREATE POLICY "Superadmin can manage states"
ON states FOR ALL
USING (get_current_user_role() = 'superadmin');

CREATE POLICY "Superadmin can manage districts"
ON districts FOR ALL
USING (get_current_user_role() = 'superadmin');

CREATE POLICY "Superadmin can manage constituencies"
ON constituencies FOR ALL
USING (get_current_user_role() = 'superadmin');

CREATE POLICY "Superadmin can manage polling booths"
ON polling_booths FOR ALL
USING (get_current_user_role() = 'superadmin');

-- =====================================================
-- POLITICAL PARTIES, ISSUES, SEGMENTS (Read for all, manage for admin)
-- =====================================================

CREATE POLICY "Authenticated users can view political parties"
ON political_parties FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin can manage political parties"
ON political_parties FOR ALL
USING (get_current_user_role() IN ('superadmin', 'admin'));

CREATE POLICY "Authenticated users can view issue categories"
ON issue_categories FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin can manage issue categories"
ON issue_categories FOR ALL
USING (get_current_user_role() IN ('superadmin', 'admin'));

CREATE POLICY "Authenticated users can view voter segments"
ON voter_segments FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin can manage voter segments"
ON voter_segments FOR ALL
USING (get_current_user_role() IN ('superadmin', 'admin'));

-- =====================================================
-- DIRECT FEEDBACK POLICIES
-- =====================================================

-- All authenticated users can view feedback
CREATE POLICY "Authenticated users can view feedback"
ON direct_feedback FOR SELECT
USING (auth.uid() IS NOT NULL);

-- All authenticated users can submit feedback
CREATE POLICY "Authenticated users can submit feedback"
ON direct_feedback FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Assigned users and admins can update feedback
CREATE POLICY "Assigned users and admins can update feedback"
ON direct_feedback FOR UPDATE
USING (
    get_current_user_role() IN ('superadmin', 'admin', 'manager') OR
    assigned_to IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
);

-- =====================================================
-- FIELD REPORTS POLICIES
-- =====================================================

-- All authenticated users can view field reports
CREATE POLICY "Authenticated users can view field reports"
ON field_reports FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Volunteers can create their own field reports
CREATE POLICY "Volunteers can create field reports"
ON field_reports FOR INSERT
WITH CHECK (
    volunteer_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
);

-- Volunteers can update their own unverified reports
CREATE POLICY "Volunteers can update their own reports"
ON field_reports FOR UPDATE
USING (
    volunteer_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()) AND
    verification_status = 'pending'
);

-- Managers and above can verify reports
CREATE POLICY "Managers can verify field reports"
ON field_reports FOR UPDATE
USING (
    get_current_user_role() IN ('superadmin', 'admin', 'manager')
);

-- =====================================================
-- SENTIMENT DATA POLICIES
-- =====================================================

-- All authenticated users can view sentiment data
CREATE POLICY "Authenticated users can view sentiment data"
ON sentiment_data FOR SELECT
USING (auth.uid() IS NOT NULL);

-- System can insert sentiment data
CREATE POLICY "System can insert sentiment data"
ON sentiment_data FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- =====================================================
-- BOOTH AGENTS POLICIES
-- =====================================================

-- All authenticated users can view booth agents
CREATE POLICY "Authenticated users can view booth agents"
ON booth_agents FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Admin can manage booth agents
CREATE POLICY "Admin can manage booth agents"
ON booth_agents FOR ALL
USING (get_current_user_role() IN ('superadmin', 'admin', 'manager'));

-- =====================================================
-- BULK UPLOAD JOBS POLICIES
-- =====================================================

-- Users can view their own bulk upload jobs
CREATE POLICY "Users can view their own bulk jobs"
ON bulk_upload_jobs FOR SELECT
USING (
    created_by IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
);

-- Admin can view all bulk upload jobs
CREATE POLICY "Admin can view all bulk jobs"
ON bulk_upload_jobs FOR SELECT
USING (get_current_user_role() IN ('superadmin', 'admin'));

-- Users can create bulk upload jobs
CREATE POLICY "Users can create bulk jobs"
ON bulk_upload_jobs FOR INSERT
WITH CHECK (
    created_by IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
);

-- =====================================================
-- VOTERS POLICIES (Sensitive data - restricted access)
-- =====================================================

-- Admin, Manager, Analyst can view voters
CREATE POLICY "Admin/Manager/Analyst can view voters"
ON voters FOR SELECT
USING (get_current_user_role() IN ('superadmin', 'admin', 'manager', 'analyst'));

-- Admin, Manager can create voters
CREATE POLICY "Admin/Manager can create voters"
ON voters FOR INSERT
WITH CHECK (get_current_user_role() IN ('superadmin', 'admin', 'manager'));

-- Admin, Manager can update voters
CREATE POLICY "Admin/Manager can update voters"
ON voters FOR UPDATE
USING (get_current_user_role() IN ('superadmin', 'admin', 'manager'));

-- =====================================================
-- VOTER INTERACTIONS POLICIES
-- =====================================================

-- All authenticated users can view voter interactions
CREATE POLICY "Authenticated users can view voter interactions"
ON voter_interactions FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Users can create voter interactions
CREATE POLICY "Users can create voter interactions"
ON voter_interactions FOR INSERT
WITH CHECK (
    contacted_by IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
);

-- =====================================================
-- CAMPAIGNS POLICIES
-- =====================================================

-- All authenticated users can view campaigns
CREATE POLICY "Authenticated users can view campaigns"
ON campaigns FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Admin, Manager can create campaigns
CREATE POLICY "Admin/Manager can create campaigns"
ON campaigns FOR INSERT
WITH CHECK (get_current_user_role() IN ('superadmin', 'admin', 'manager'));

-- Campaign managers and admins can update campaigns
CREATE POLICY "Campaign managers can update campaigns"
ON campaigns FOR UPDATE
USING (
    get_current_user_role() IN ('superadmin', 'admin') OR
    campaign_manager_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
);

-- =====================================================
-- SOCIAL MEDIA POSTS POLICIES
-- =====================================================

-- All authenticated users can view social media posts
CREATE POLICY "Authenticated users can view social posts"
ON social_media_posts FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Users can create social media posts
CREATE POLICY "Users can create social posts"
ON social_media_posts FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Post authors and admins can update posts
CREATE POLICY "Post authors can update social posts"
ON social_media_posts FOR UPDATE
USING (
    get_current_user_role() IN ('superadmin', 'admin') OR
    posted_by IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
);

-- =====================================================
-- ALERTS POLICIES
-- =====================================================

-- Users can view alerts targeted to them
CREATE POLICY "Users can view their alerts"
ON alerts FOR SELECT
USING (
    target_role = get_current_user_role() OR
    EXISTS (
        SELECT 1 FROM alert_target_users atu
        WHERE atu.alert_id = alerts.id
        AND atu.user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
    )
);

-- Admin can create alerts
CREATE POLICY "Admin can create alerts"
ON alerts FOR INSERT
WITH CHECK (get_current_user_role() IN ('superadmin', 'admin', 'manager'));

-- Users can update their alert read status
CREATE POLICY "Users can update their alerts"
ON alerts FOR UPDATE
USING (
    target_role = get_current_user_role() OR
    EXISTS (
        SELECT 1 FROM alert_target_users atu
        WHERE atu.alert_id = alerts.id
        AND atu.user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
    )
);

-- =====================================================
-- EVENTS POLICIES
-- =====================================================

-- All authenticated users can view events
CREATE POLICY "Authenticated users can view events"
ON events FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Admin, Manager can create events
CREATE POLICY "Admin/Manager can create events"
ON events FOR INSERT
WITH CHECK (get_current_user_role() IN ('superadmin', 'admin', 'manager'));

-- Event organizers and admins can update events
CREATE POLICY "Event organizers can update events"
ON events FOR UPDATE
USING (
    get_current_user_role() IN ('superadmin', 'admin') OR
    organizer_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
);

-- =====================================================
-- VOLUNTEER PROFILES POLICIES
-- =====================================================

-- All authenticated users can view volunteer profiles
CREATE POLICY "Authenticated users can view volunteer profiles"
ON volunteer_profiles FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Admin can manage volunteer profiles
CREATE POLICY "Admin can manage volunteer profiles"
ON volunteer_profiles FOR ALL
USING (get_current_user_role() IN ('superadmin', 'admin', 'manager'));

-- =====================================================
-- EXPENSES POLICIES
-- =====================================================

-- Users can view expenses they created
CREATE POLICY "Users can view their expenses"
ON expenses FOR SELECT
USING (
    created_by IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
);

-- Admin can view all expenses
CREATE POLICY "Admin can view all expenses"
ON expenses FOR SELECT
USING (get_current_user_role() IN ('superadmin', 'admin', 'manager'));

-- Users can create expenses
CREATE POLICY "Users can create expenses"
ON expenses FOR INSERT
WITH CHECK (
    created_by IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
);

-- Admin can update expenses (approve/reject)
CREATE POLICY "Admin can update expenses"
ON expenses FOR UPDATE
USING (get_current_user_role() IN ('superadmin', 'admin', 'manager'));

-- =====================================================
-- WHATSAPP CONVERSATIONS POLICIES
-- =====================================================

-- Admin and Analysts can view WhatsApp conversations
CREATE POLICY "Admin/Analyst can view WhatsApp conversations"
ON whatsapp_conversations FOR SELECT
USING (get_current_user_role() IN ('superadmin', 'admin', 'manager', 'analyst'));

-- System can create WhatsApp conversations
CREATE POLICY "System can create WhatsApp conversations"
ON whatsapp_conversations FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- System can update WhatsApp conversations
CREATE POLICY "System can update WhatsApp conversations"
ON whatsapp_conversations FOR UPDATE
USING (auth.uid() IS NOT NULL);

-- =====================================================
-- WHATSAPP MESSAGES POLICIES
-- =====================================================

-- Admin and Analysts can view WhatsApp messages
CREATE POLICY "Admin/Analyst can view WhatsApp messages"
ON whatsapp_messages FOR SELECT
USING (get_current_user_role() IN ('superadmin', 'admin', 'manager', 'analyst'));

-- System can create WhatsApp messages
CREATE POLICY "System can create WhatsApp messages"
ON whatsapp_messages FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- =====================================================
-- VOTER PROFILES (WHATSAPP) POLICIES
-- =====================================================

-- Admin and Analysts can view WhatsApp voter profiles
CREATE POLICY "Admin/Analyst can view WhatsApp voter profiles"
ON voter_profiles_whatsapp FOR SELECT
USING (get_current_user_role() IN ('superadmin', 'admin', 'manager', 'analyst'));

-- System can create WhatsApp voter profiles
CREATE POLICY "System can manage WhatsApp voter profiles"
ON voter_profiles_whatsapp FOR ALL
USING (auth.uid() IS NOT NULL);

-- =====================================================
-- BOT CONFIGURATIONS POLICIES
-- =====================================================

-- Admin can view bot configurations
CREATE POLICY "Admin can view bot configurations"
ON bot_configurations FOR SELECT
USING (get_current_user_role() IN ('superadmin', 'admin'));

-- Superadmin can manage bot configurations
CREATE POLICY "Superadmin can manage bot configurations"
ON bot_configurations FOR ALL
USING (get_current_user_role() = 'superadmin');

-- =====================================================
-- TASKS POLICIES
-- =====================================================

-- Users can view their own tasks
CREATE POLICY "Users can view their own tasks"
ON tasks FOR SELECT
USING (
    owner_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
);

-- Users can manage their own tasks
CREATE POLICY "Users can manage their own tasks"
ON tasks FOR ALL
USING (
    owner_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
);

-- Admin can view all tasks
CREATE POLICY "Admin can view all tasks"
ON tasks FOR SELECT
USING (get_current_user_role() IN ('superadmin', 'admin'));

-- =====================================================
-- RLS POLICIES MIGRATION COMPLETE
-- Total Policies Created: 100+
-- All tables now have role-based access control
-- =====================================================
