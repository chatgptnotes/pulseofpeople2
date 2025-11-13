import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Dashboard as DashboardIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  Apartment as ApartmentIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
  Group as UsersIcon,
  Assignment as ReportsIcon,
  Notifications as AlertsIcon,
  ArrowDropDown as DropdownIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  Logout as LogoutIcon,
  AdminPanelSettings as SuperAdminIcon,
  Shield as SecurityIcon,
  // Data Intelligence Icons
  Satellite as DataIntelligenceIcon,
  Twitter as TwitterIcon,
  Tv as TvIcon,
  Newspaper as NewspaperIcon,
  RecordVoiceOver as InfluencerIcon,
  SmartToy as BotIcon,
  Poll as PollIcon,
  CameraAlt as DataCaptureIcon,
  // Analytics Icons
  TrendingUp as TrendingIcon,
  Insights as InsightsIcon,
  Assessment as AssessmentIcon,
  CompareArrows as ComparisonIcon,
  Timeline as TimelineIcon,
  // Geographic Icons
  Map as MapIcon,
  LocationOn as LocationIcon,
  Public as GlobalIcon,
  Place as PlaceIcon,
  // Operations Icons
  WorkOutline as OperationsIcon,
  PersonSearch as FieldWorkerIcon,
  Storage as DatabaseIcon,
  TrackChanges as TrackingIcon,
  // Alerts Icons
  NotificationsActive as AlertActiveIcon,
  Warning as CrisisIcon,
  Forum as EngagementIcon,
  // Settings Icons
  Tune as ConfigIcon,
  // AI & Automation Icons
  Psychology as AIIcon,
  AutoAwesome as MagicIcon,
  SmartDisplay as PulseDashboardIcon,
  // Compliance Icons
  VerifiedUser as ComplianceIcon,
  Policy as PolicyIcon,
  // Tools Icons
  Download as ExportIcon,
  PhonelinkRing as MobileAppIcon,
  // Engagement Icons
  Chat as WhatsAppIcon,
  FeedbackOutlined as FeedbackIcon,
  Description as ManifestoIcon,
  HowToVote as ChoiceIcon,
  // Subscription
  Subscriptions as SubscriptionIcon,
  LocalAtm as BillingIcon,
  // Competitor Intelligence Icons
  Monitor as MonitorIcon,
  SentimentSatisfied as SentimentIcon,
  BarChart as BarChartIcon,
  // Additional Super Admin Icons
  CloudUpload as UploadIcon,
  AddBusiness as AddTenantIcon,
  Flag as FeatureFlagIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { usePermission } from '../hooks/usePermission';
import Logo from './Logo';
import { TVKLogo } from './TVKLogo';

interface MenuItem {
  name: string;
  href: string;
  icon: any;
  permission?: string;
  badge?: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
  categoryIcon?: any;
  categoryColor?: string; // Tailwind color class prefix (e.g., 'blue', 'green', 'orange')
}

export function EnhancedNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, supabase } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tenantMenuOpen, setTenantMenuOpen] = useState(false);
  const [userTenants, setUserTenants] = useState<any[]>([]);
  const [currentTenant, setCurrentTenant] = useState<any>(null);

  const isSuperAdmin = usePermission('manage_organizations');
  const isAdmin = usePermission('manage_tenants');
  const canManageUsers = usePermission('manage_users');
  const canViewAudit = usePermission('view_audit_logs');

  useEffect(() => {
    if (isAdmin) {
      loadUserTenants();
    }
  }, [isAdmin]);

  async function loadUserTenants() {
    try {
      // Get user's organization
      const { data: orgData } = await supabase
        .from('user_organizations')
        .select('organization_id')
        .eq('user_id', user?.id)
        .single();

      if (!orgData) return;

      // Load organization tenants
      const { data: tenants } = await supabase
        .from('tenants')
        .select('id, name, display_name, subdomain, status')
        .eq('organization_id', orgData.organization_id)
        .eq('status', 'active')
        .order('name');

      setUserTenants(tenants || []);

      // Set first tenant as current if none selected
      if (tenants && tenants.length > 0 && !currentTenant) {
        setCurrentTenant(tenants[0]);
      }
    } catch (error) {
      console.error('Failed to load tenants:', error);
    }
  }

  // Super Admin Navigation
  const superAdminMenu: MenuSection[] = [
    {
      title: 'Platform Management',
      items: [
        { name: 'Platform Dashboard', href: '/super-admin/dashboard', icon: DashboardIcon },
        { name: 'Admin Management', href: '/super-admin/admins', icon: PeopleIcon },
        { name: 'Tenant Registry', href: '/super-admin/tenants', icon: ApartmentIcon },
        { name: 'Tenant Provisioning', href: '/super-admin/tenants/new', icon: AddTenantIcon },
        { name: 'Polling Booth Upload', href: '/super-admin/polling-booth-upload', icon: UploadIcon },
        { name: 'Feature Flags', href: '/super-admin/feature-flags', icon: FeatureFlagIcon },
      ],
    },
    {
      title: 'Competitor Intelligence',
      categoryIcon: ComparisonIcon,
      categoryColor: 'red',
      items: [
        { name: 'Competitor Registry', href: '/competitors/registry', icon: PeopleIcon },
        { name: 'Social Media Monitor', href: '/competitors/monitor', icon: MonitorIcon },
        { name: 'Sentiment Dashboard', href: '/competitors/sentiment', icon: BarChartIcon },
        { name: 'Competitor Analysis', href: '/competitor-analysis', icon: ComparisonIcon },
        { name: 'Competitor Tracking', href: '/competitor-tracking', icon: ComparisonIcon },
      ],
    },
  ];

  // Admin Navigation
  const adminMenu: MenuSection[] = [
    {
      title: 'Organization',
      items: [
        { name: 'Organization Dashboard', href: '/admin/dashboard', icon: BusinessIcon },
        { name: 'Tenant Management', href: '/admin/tenants', icon: ApartmentIcon, permission: 'manage_tenants' },
        { name: 'User Management', href: '/admin/users', icon: PeopleIcon, permission: 'manage_users' },
        { name: 'Subscription & Billing', href: '/admin/subscriptions', icon: SubscriptionIcon, permission: 'manage_tenants' },
        { name: 'Audit Logs', href: '/admin/audit-logs', icon: HistoryIcon, permission: 'view_audit_logs' },
      ],
    },
  ];

  // Standard User Navigation - Categorized Structure
  const userMenu: MenuSection[] = [
    {
      title: 'Main Dashboard',
      categoryIcon: DashboardIcon,
      categoryColor: 'indigo',
      items: [
        { name: 'POP Dashboard', href: '/dashboard/legacy', icon: DashboardIcon, badge: 'Live' },
        { name: 'Pulse Dashboard', href: '/pulse-dashboard', icon: PulseDashboardIcon },
        { name: 'Analytics Overview', href: '/analytics', icon: AnalyticsIcon },
      ],
    },
    {
      title: 'Data Intelligence',
      categoryIcon: DataIntelligenceIcon,
      categoryColor: 'blue',
      items: [
        { name: 'Social Media Channels', href: '/social-media-channels', icon: TwitterIcon },
        { name: 'Social Media Settings', href: '/social-media-settings', icon: ConfigIcon, badge: 'New' },
        { name: 'Social Monitoring', href: '/social-monitoring', icon: TwitterIcon },
        { name: 'Social Media Hub', href: '/social-media', icon: TwitterIcon },
        { name: 'TV Broadcast Analysis', href: '/tv-broadcast-analysis', icon: TvIcon },
        { name: 'Press Monitoring', href: '/press-media-monitoring', icon: NewspaperIcon },
        { name: 'Influencer Tracking', href: '/influencer-tracking', icon: InfluencerIcon },
        { name: 'Political Polling', href: '/political-polling', icon: PollIcon },
        { name: 'Political Choice', href: '/political-choice', icon: ChoiceIcon },
        { name: 'Data Capture Kit', href: '/data-kit', icon: DataCaptureIcon },
        { name: 'Data Submission', href: '/submit-data', icon: DataCaptureIcon },
      ],
    },
    {
      title: 'Analytics & Insights',
      categoryIcon: TrendingIcon,
      categoryColor: 'green',
      items: [
        { name: 'Analytics Dashboard', href: '/analytics-dashboard', icon: AnalyticsIcon },
        { name: 'Advanced Charts', href: '/advanced-charts', icon: AssessmentIcon },
        { name: 'AI Insights', href: '/ai-insights', icon: InsightsIcon },
        { name: 'AI Insights Engine', href: '/ai-insights-engine', icon: AIIcon },
        { name: 'Reports', href: '/reports', icon: ReportsIcon },
        { name: 'Data Tracking', href: '/data-tracking', icon: TimelineIcon },
      ],
    },
    {
      title: 'Competitor Intelligence',
      categoryIcon: ComparisonIcon,
      categoryColor: 'red',
      items: [
        { name: 'Competitor Registry', href: '/competitors/registry', icon: PeopleIcon },
        { name: 'Social Media Monitor', href: '/competitors/monitor', icon: MonitorIcon },
        { name: 'Sentiment Dashboard', href: '/competitors/sentiment', icon: BarChartIcon },
        { name: 'Competitor Analysis', href: '/competitor-analysis', icon: ComparisonIcon },
        { name: 'Competitor Tracking', href: '/competitor-tracking', icon: ComparisonIcon },
      ],
    },
    {
      title: 'Wards & Booths',
      categoryIcon: LocationIcon,
      categoryColor: 'indigo',
      items: [
        { name: 'Wards List', href: '/wards', icon: LocationIcon },
        { name: 'Upload Wards', href: '/wards/upload', icon: UploadIcon },
        { name: 'Booths List', href: '/booths', icon: LocationIcon },
        { name: 'Upload Booths', href: '/booths/upload', icon: UploadIcon },
        { name: 'Booths Map', href: '/booths/map', icon: MapIcon },
        { name: 'Analytics', href: '/wards-booths/analytics', icon: AssessmentIcon },
      ],
    },
    {
      title: 'Maps & Territory',
      categoryIcon: MapIcon,
      categoryColor: 'orange',
      items: [
        { name: 'Regional Map', href: '/regional-map', icon: GlobalIcon },
        { name: 'Tamil Nadu Map', href: '/tamil-nadu-map', icon: MapIcon },
        { name: 'Ward Heatmap', href: '/heatmap', icon: MapIcon },
        { name: 'Voter Database', href: '/voter-database', icon: DatabaseIcon },
        { name: 'Advanced Voter DB', href: '/advanced-voter-database', icon: DatabaseIcon },
        { name: 'My Constituency', href: '/constituency', icon: PlaceIcon },
      ],
    },
    {
      title: 'Campaign Operations',
      categoryIcon: OperationsIcon,
      categoryColor: 'purple',
      items: [
        { name: 'Field Workers', href: '/field-workers', icon: FieldWorkerIcon },
        { name: 'Field Worker Management', href: '/field-worker-management', icon: FieldWorkerIcon },
        { name: 'Field Worker App', href: '/field-worker-app', icon: MobileAppIcon },
      ],
    },
    {
      title: 'AI & Automation',
      categoryIcon: AIIcon,
      categoryColor: 'cyan',
      items: [
        { name: 'AI Agents', href: '/agents', icon: AIIcon },
        { name: 'Conversation Bot', href: '/conversation-bot', icon: BotIcon },
        { name: 'WhatsApp Bot', href: '/whatsapp-bot', icon: WhatsAppIcon },
        { name: 'Magic Search', href: '/magic-search', icon: MagicIcon },
      ],
    },
    {
      title: 'Engagement & Feedback',
      categoryIcon: EngagementIcon,
      categoryColor: 'pink',
      items: [
        { name: 'Alert Center', href: '/alerts', icon: AlertsIcon },
        { name: 'Feedback Center', href: '/feedback', icon: FeedbackIcon },
        { name: 'Manifesto Match', href: '/manifesto', icon: ManifestoIcon },
      ],
    },
    {
      title: 'Compliance & Privacy',
      categoryIcon: ComplianceIcon,
      categoryColor: 'teal',
      items: [
        { name: 'DPDP Compliance', href: '/dpdp-compliance', icon: ComplianceIcon },
        { name: 'Privata Integration', href: '/privata-integration', icon: PolicyIcon },
      ],
    },
    {
      title: 'Tools & Utilities',
      categoryIcon: SettingsIcon,
      categoryColor: 'gray',
      items: [
        { name: 'Export Manager', href: '/export-manager', icon: ExportIcon },
        { name: 'Settings', href: '/settings', icon: SettingsIcon },
        { name: 'Subscription', href: '/subscription', icon: SubscriptionIcon },
      ],
    },
  ];

  const settingsMenu: MenuItem[] = [
    { name: 'Settings', href: '/settings', icon: SettingsIcon },
  ];

  function getMenuSections(): MenuSection[] {
    let sections: MenuSection[];

    if (isSuperAdmin) {
      // Superadmins get platform management tools + all user features
      sections = [...superAdminMenu, ...userMenu];
      console.log('[Navigation] 🔑 Superadmin menu loaded:', sections.length, 'sections');
    } else if (isAdmin) {
      sections = [...adminMenu, ...userMenu];
      console.log('[Navigation] 👤 Admin menu loaded:', sections.length, 'sections');
    } else {
      sections = userMenu;
      console.log('[Navigation] 👥 User menu loaded:', sections.length, 'sections');
    }

    // Debug: Log section titles
    console.log('[Navigation] 📋 Menu sections:', sections.map(s => s.title));

    return sections;
  }

  function handleTenantSwitch(tenant: any) {
    setCurrentTenant(tenant);
    setTenantMenuOpen(false);

    // Redirect to tenant-specific subdomain in production
    if (import.meta.env.PROD) {
      window.location.href = `https://${tenant.subdomain}.yourapp.com/dashboard/legacy`;
    } else {
      // In development, just navigate
      navigate('/dashboard/legacy');
    }
  }

  const isActive = (href: string) => location.pathname === href;

  return (
    <>
      {/* Mobile Header - ChatGPT style */}
      <div className="md:hidden bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-600 hover:text-gray-900 transition-colors duration-200 p-1 rounded-lg hover:bg-gray-100"
          >
            {sidebarOpen ? <CloseIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
          <Logo size="small" variant="horizontal" />
        </div>
        {user && (
          <div className="text-sm text-gray-600 font-medium truncate max-w-[120px]">{user.name || user.email}</div>
        )}
      </div>

      {/* Sidebar - ChatGPT style */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200
        transform transition-all duration-300 ease-smooth
        flex flex-col shadow-lg
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        {/* Logos - TVK and Pulse of People side by side */}
        <div className="h-20 flex items-center justify-center gap-3 px-6 border-b border-gray-200">
          {/* TVK Party Logo */}
          <div className="flex-shrink-0">
            <TVKLogo size="medium" />
          </div>

          {/* Pulse of People Logo - Reduced to 60% size */}
          <div className="scale-[0.6] origin-center flex-1">
            <Logo size="medium" variant="horizontal" />
          </div>
        </div>

        {/* User Info & Tenant Switcher - ChatGPT style */}
        <div className="flex-shrink-0 p-5 border-b border-gray-200">
          {user && (
            <div className="mb-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 h-11 w-11 bg-accent-light rounded-xl flex items-center justify-center">
                  <PeopleIcon className="w-6 h-6 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.name || user.email}</p>
                  <p className="text-xs text-gray-400 capitalize mt-0.5">{user.role || 'User'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tenant Switcher for Admins */}
          {(isAdmin || isSuperAdmin) && userTenants.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setTenantMenuOpen(!tenantMenuOpen)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm bg-gray-50 rounded-lg hover:bg-gray-100"
              >
                <div className="flex items-center">
                  <ApartmentIcon className="w-4 h-4 text-gray-600 mr-2" />
                  <span className="text-gray-900 truncate">
                    {currentTenant?.display_name || 'Select Tenant'}
                  </span>
                </div>
                <DropdownIcon className="w-5 h-5 text-gray-400" />
              </button>

              {tenantMenuOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                  {userTenants.map((tenant) => (
                    <button
                      key={tenant.id}
                      onClick={() => handleTenantSwitch(tenant)}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                        currentTenant?.id === tenant.id ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                      }`}
                    >
                      {tenant.display_name || tenant.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Sections - ChatGPT style with generous spacing */}
        <nav className="flex-1 px-5 py-6 space-y-8 overflow-y-auto scrollbar-thin">
          {getMenuSections().map((section, idx) => {
            const CategoryIcon = section.categoryIcon;
            const colorClass = section.categoryColor || 'gray';

            // ChatGPT-inspired color styles - more subtle
            const colorStyles = {
              blue: { icon: 'text-blue-600', header: 'text-gray-900', activeBg: 'bg-accent-light', activeText: 'text-accent', activeBorder: 'border-accent' },
              green: { icon: 'text-green-600', header: 'text-gray-900', activeBg: 'bg-green-50', activeText: 'text-green-700', activeBorder: 'border-green-600' },
              orange: { icon: 'text-orange-600', header: 'text-gray-900', activeBg: 'bg-orange-50', activeText: 'text-orange-700', activeBorder: 'border-orange-600' },
              purple: { icon: 'text-purple-600', header: 'text-gray-900', activeBg: 'bg-purple-50', activeText: 'text-purple-700', activeBorder: 'border-purple-600' },
              red: { icon: 'text-red-600', header: 'text-gray-900', activeBg: 'bg-red-50', activeText: 'text-red-700', activeBorder: 'border-red-600' },
              indigo: { icon: 'text-indigo-600', header: 'text-gray-900', activeBg: 'bg-indigo-50', activeText: 'text-indigo-700', activeBorder: 'border-indigo-600' },
              gray: { icon: 'text-gray-600', header: 'text-gray-900', activeBg: 'bg-bg-tertiary', activeText: 'text-gray-900', activeBorder: 'border-text-secondary' }
            };

            const styles = colorStyles[colorClass as keyof typeof colorStyles] || colorStyles.gray;

            return (
              <div key={idx}>
                {/* Category Header with Icon - more prominent */}
                <div className="flex items-center px-3 mb-3">
                  {CategoryIcon && (
                    <CategoryIcon className={`w-4 h-4 mr-2.5 ${styles.icon}`} />
                  )}
                  <h3 className={`text-xs font-semibold ${styles.header} uppercase tracking-wide`}>
                    {section.title}
                  </h3>
                </div>
                <div className="space-y-1.5">
                  {section.items
                    .filter((item) => !item.permission || usePermission(item.permission))
                    .map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.href);

                      return (
                        <button
                          key={item.name}
                          onClick={() => {
                            navigate(item.href);
                            setSidebarOpen(false);
                          }}
                          className={`w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-lg
                            transition-all duration-200 ease-smooth
                            ${
                            active
                              ? `${styles.activeBg} ${styles.activeText} shadow-sm`
                              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                        >
                          <Icon className={`w-5 h-5 mr-3.5 ${active ? styles.icon : 'text-gray-400'}`} />
                          <span className="flex-1 text-left">{item.name}</span>
                          {item.badge && (
                            <span className="ml-2 px-2.5 py-0.5 text-xs font-semibold bg-red-100 text-red-600 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>
            );
          })}

          {/* Settings & Logout - ChatGPT style */}
          <div>
            <h3 className="px-3 text-xs font-semibold text-gray-900 uppercase tracking-wide mb-3">
              Account
            </h3>
            <div className="space-y-1.5">
              {settingsMenu.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      navigate(item.href);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-lg
                      transition-all duration-200 ease-smooth
                      ${
                      active
                        ? 'bg-accent-light text-accent shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mr-3.5 ${active ? 'text-accent' : 'text-gray-400'}`} />
                    {item.name}
                  </button>
                );
              })}

              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="w-full flex items-center px-4 py-2.5 text-sm font-medium text-red-600
                  hover:bg-red-50 rounded-lg transition-all duration-200 ease-smooth"
              >
                <LogoutIcon className="w-5 h-5 mr-3.5 text-red-600" />
                Logout
              </button>
            </div>
          </div>
        </nav>

        {/* Role Badge - ChatGPT style */}
        {isSuperAdmin && (
          <div className="flex-shrink-0 p-5 border-t border-gray-200">
            <div className="flex items-center px-4 py-3 bg-purple-50 rounded-xl shadow-sm">
              <SuperAdminIcon className="w-5 h-5 text-purple-600 mr-3" />
              <span className="text-sm font-semibold text-purple-600">Super Admin</span>
            </div>
          </div>
        )}
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}

export default EnhancedNavigation;
