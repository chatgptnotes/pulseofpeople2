import { Routes, Route } from 'react-router-dom'
import { RealTimeProvider } from './contexts/RealTimeContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { TenantProvider } from './contexts/TenantContext'
import { PermissionProvider } from './contexts/PermissionContext'
import { OnboardingProvider } from './contexts/OnboardingContext'
import { ToastProvider } from './contexts/ToastContext'
import ErrorBoundary from './components/ErrorBoundary'
import FullScreenLoader from './components/FullScreenLoader'
import Layout from './components/Layout'
import LandingLayout from './components/LandingLayout'
import TenantLandingPage from './pages/TenantLandingPage'
import Dashboard from './pages/Dashboard'
import Analytics from './pages/Analytics'
import Reports from './pages/Reports'
import Alerts from './pages/Alerts'
import Settings from './pages/Settings'
import DataCaptureKit from './pages/DataCaptureKit'
import DataSubmission from './pages/DataSubmission'
import DataTracking from './pages/DataTracking'
import PoliticalPolling from './pages/PoliticalPolling'
import PoliticalChoice from './pages/PoliticalChoice'
import VoterDatabasePage from './pages/VoterDatabase'
import FieldWorkers from './pages/FieldWorkers'
import SocialMedia from './pages/SocialMedia'
import CompetitorAnalysis from './pages/CompetitorAnalysis'
import AIInsights from './pages/AIInsights'
import Login from './pages/Login'
import ResetPassword from './pages/ResetPassword'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import PressMediaMonitoring from './pages/PressMediaMonitoring'
import TVBroadcastAnalysis from './pages/TVBroadcastAnalysis'
import SocialMediaChannels from './pages/SocialMediaChannels'
import SocialMediaSettings from './pages/SocialMediaSettings'
import InfluencerTracking from './pages/InfluencerTracking'
import ConversationBot from './pages/ConversationBot'
import VoterSentimentAnalysis from './pages/VoterSentimentAnalysis'
import VoiceAgentChat from './pages/VoiceAgentChat'
import EnhancedWardHeatmap from './components/EnhancedWardHeatmap'
import ManifestoMatch from './components/ManifestoMatch'
import FeedbackChatbot from './components/FeedbackChatbot'
import MyConstituency from './components/MyConstituencyApp'
import Subscription from './pages/Subscription'
import AgenticPlatform from './components/AgenticPlatform'
import DPDPCompliance from './components/DPDPCompliance'
import PrivataIntegration from './components/PrivataIntegration'
import WhatsAppBot from './components/WhatsAppBot'
import PulseOfPeopleDashboard from './components/PulseOfPeopleDashboard'
import VoterDatabaseComponent from './components/VoterDatabase'
import FieldWorkerManagement from './components/FieldWorkerManagement'
import AIInsightsEngine from './components/AIInsightsEngine'
import MagicSearchBar from './components/MagicSearchBar'
import AdvancedCharts from './pages/AdvancedCharts'
import SocialMediaMonitoring from './components/SocialMediaMonitoring'
import ExportManager from './components/ExportManager'
import FieldWorkerApp from './components/FieldWorkerApp'
import CompetitorTracking from './components/CompetitorTracking'
import CompetitorRegistry from './pages/CompetitorRegistry'
import CompetitorSocialMonitor from './pages/CompetitorSocialMonitor'
import CompetitorSentimentDashboard from './pages/CompetitorSentimentDashboard'
import RegionalMap from './pages/RegionalMap'
import TamilNaduMapDashboard from './pages/TamilNaduMapDashboard'
import { MobileContactBar } from './components/MobileResponsive'
import SuperAdminDashboard from './pages/SuperAdmin/Dashboard'
import AdminManagement from './pages/SuperAdmin/AdminManagement'
import PollingBoothUpload from './pages/SuperAdmin/PollingBoothUpload'
import TenantRegistry from './pages/SuperAdmin/TenantRegistry'
import TenantProvisioning from './pages/SuperAdmin/TenantProvisioning'
import TenantDetail from './pages/SuperAdmin/TenantDetail'
import FeatureFlagManager from './pages/SuperAdmin/FeatureFlagManager'
import BillingDashboard from './pages/SuperAdmin/BillingDashboard'
import OrganizationDashboard from './pages/Admin/OrganizationDashboard'
import SubscriptionManagement from './pages/Admin/SubscriptionManagement'
import TenantManagement from './pages/Admin/TenantManagement'
import UserManagement from './pages/Admin/UserManagement'
import AuditLogViewer from './pages/Admin/AuditLogViewer'
import Unauthorized from './pages/Unauthorized'
import AnalyticsDashboard from './pages/AnalyticsDashboard'
import DjangoTest from './pages/DjangoTest'
import RoleBasedDashboard from './components/RoleBasedDashboard'
import SuperAdminDashboardNew from './pages/dashboards/SuperAdminDashboard'
import AdminStateDashboard from './pages/dashboards/AdminStateDashboard'
import ManagerDistrictDashboard from './pages/dashboards/ManagerDistrictDashboard'
import AnalystConstituencyDashboard from './pages/dashboards/AnalystConstituencyDashboard'
import UserBoothDashboard from './pages/dashboards/UserBoothDashboard'
import VolunteerDashboard from './pages/dashboards/VolunteerDashboard'
import ViewerDashboard from './pages/dashboards/ViewerDashboard'
import UserManagementNew from './pages/UserManagement'
import WardsUpload from './pages/WardsUpload'
import BoothsUpload from './pages/BoothsUpload'
import WardsList from './pages/WardsList'
import BoothsList from './pages/BoothsList'
import BoothsMap from './pages/BoothsMap'
import WardsBoothsAnalytics from './pages/WardsBoothsAnalytics'

// Inner component that uses auth context
function AppRoutes() {
  const { isInitializing } = useAuth();

  // Show full-screen loader until initialization completes
  if (isInitializing) {
    return <FullScreenLoader />;
  }

  return (
    <Routes>
              {/* Landing Page with minimal layout - Now tenant-aware */}
              <Route path="/" element={
                <LandingLayout>
                  <TenantLandingPage />
                </LandingLayout>
              } />

              {/* Login Page */}
              <Route path="/login" element={<Login />} />

              {/* Reset Password Page */}
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Django Backend Test Page (No auth required for testing) */}
              <Route path="/django-test" element={<DjangoTest />} />

              {/* Role-Based Dashboards - NEW */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Layout>
                    <RoleBasedDashboard />
                  </Layout>
                </ProtectedRoute>
              } />

              <Route path="/superadmin" element={
                <ProtectedRoute requiredRole="superadmin">
                  <Layout>
                    <SuperAdminDashboardNew />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Legacy route - redirect to new one */}
              <Route path="/dashboard/superadmin" element={
                <ProtectedRoute requiredRole="superadmin">
                  <Layout>
                    <SuperAdminDashboardNew />
                  </Layout>
                </ProtectedRoute>
              } />

              <Route path="/dashboard/admin" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminStateDashboard />
                </ProtectedRoute>
              } />

              <Route path="/dashboard/manager" element={
                <ProtectedRoute requiredRole="manager">
                  <Layout>
                    <ManagerDistrictDashboard />
                  </Layout>
                </ProtectedRoute>
              } />

              <Route path="/dashboard/analyst" element={
                <ProtectedRoute requiredRole="analyst">
                  <Layout>
                    <AnalystConstituencyDashboard />
                  </Layout>
                </ProtectedRoute>
              } />

              <Route path="/dashboard/user" element={
                <ProtectedRoute requiredRole="user">
                  <Layout>
                    <UserBoothDashboard />
                  </Layout>
                </ProtectedRoute>
              } />

              <Route path="/dashboard/volunteer" element={
                <ProtectedRoute requiredRole="volunteer">
                  <Layout>
                    <VolunteerDashboard />
                  </Layout>
                </ProtectedRoute>
              } />

              <Route path="/dashboard/viewer" element={
                <ProtectedRoute requiredRole="viewer">
                  <Layout>
                    <ViewerDashboard />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* User Management - Accessible by superadmin, admin, manager, analyst */}
              <Route path="/user-management" element={
                <ProtectedRoute>
                  <Layout>
                    <UserManagementNew />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Wards & Booths Management */}
              <Route path="/wards" element={
                <ProtectedRoute>
                  <Layout>
                    <WardsList />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/wards/upload" element={
                <ProtectedRoute>
                  <Layout>
                    <WardsUpload />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/booths" element={
                <ProtectedRoute>
                  <Layout>
                    <BoothsList />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/booths/upload" element={
                <ProtectedRoute>
                  <Layout>
                    <BoothsUpload />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/booths/map" element={
                <ProtectedRoute>
                  <Layout>
                    <BoothsMap />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/wards-booths/analytics" element={
                <ProtectedRoute>
                  <Layout>
                    <WardsBoothsAnalytics />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Legacy Dashboard (Keep for backward compatibility) */}
              <Route path="/dashboard/legacy" element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/analytics" element={
                <ProtectedRoute>
                  <Layout>
                    <Analytics />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/reports" element={
                <ProtectedRoute>
                  <Layout>
                    <Reports />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/alerts" element={
                <ProtectedRoute>
                  <Layout>
                    <Alerts />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/data-kit" element={
                <ProtectedRoute>
                  <Layout>
                    <DataCaptureKit />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/submit-data" element={
                <ProtectedRoute>
                  <Layout>
                    <DataSubmission />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/data-tracking" element={
                <ProtectedRoute>
                  <Layout>
                    <DataTracking />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/political-polling" element={
                <ProtectedRoute>
                  <Layout>
                    <PoliticalPolling />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/political-choice" element={
                <ProtectedRoute>
                  <Layout>
                    <PoliticalChoice />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/voter-database" element={
                <ProtectedRoute>
                  <Layout>
                    <VoterDatabasePage />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/field-workers" element={
                <ProtectedRoute>
                  <Layout>
                    <FieldWorkers />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/social-media" element={
                <ProtectedRoute>
                  <Layout>
                    <SocialMedia />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/competitor-analysis" element={
                <ProtectedRoute>
                  <Layout>
                    <CompetitorAnalysis />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/ai-insights" element={
                <ProtectedRoute>
                  <Layout>
                    <AIInsights />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Layout>
                    <Settings />
                  </Layout>
                </ProtectedRoute>
              } />
              
              {/* New Feature Pages */}
              <Route path="/heatmap" element={
                <ProtectedRoute>
                  <Layout>
                    <EnhancedWardHeatmap />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/manifesto" element={
                <ProtectedRoute>
                  <Layout>
                    <ManifestoMatch />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/feedback" element={
                <ProtectedRoute>
                  <Layout>
                    <FeedbackChatbot />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/constituency" element={
                <ProtectedRoute>
                  <Layout>
                    <MyConstituency />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/subscription" element={
                <ProtectedRoute>
                  <Layout>
                    <Subscription />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/pulse" element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/agents" element={
                <ProtectedRoute>
                  <Layout>
                    <AgenticPlatform />
                  </Layout>
                </ProtectedRoute>
              } />
              
              {/* Data Collection Pages */}
              <Route path="/press-media-monitoring" element={
                <ProtectedRoute>
                  <Layout>
                    <PressMediaMonitoring />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/tv-broadcast-analysis" element={
                <ProtectedRoute>
                  <Layout>
                    <TVBroadcastAnalysis />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/social-media-channels" element={
                <ProtectedRoute>
                  <Layout>
                    <SocialMediaChannels />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/social-media-settings" element={
                <ProtectedRoute>
                  <Layout>
                    <SocialMediaSettings />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/influencer-tracking" element={
                <ProtectedRoute>
                  <Layout>
                    <InfluencerTracking />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/conversation-bot" element={
                <ProtectedRoute>
                  <Layout>
                    <ConversationBot />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/voter-sentiment-analysis" element={
                <ProtectedRoute>
                  <Layout>
                    <VoterSentimentAnalysis />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/voice-agent-chat" element={
                <ProtectedRoute>
                  <Layout>
                    <VoiceAgentChat />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Additional Feature Pages */}
              <Route path="/dpdp-compliance" element={
                <ProtectedRoute>
                  <Layout>
                    <DPDPCompliance />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/privata-integration" element={
                <ProtectedRoute>
                  <Layout>
                    <PrivataIntegration />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/whatsapp-bot" element={
                <ProtectedRoute>
                  <Layout>
                    <WhatsAppBot />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/pulse-dashboard" element={
                <ProtectedRoute>
                  <Layout>
                    <PulseOfPeopleDashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              
              {/* Advanced Component Pages */}
              <Route path="/advanced-voter-database" element={
                <ProtectedRoute>
                  <Layout>
                    <VoterDatabaseComponent />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/field-worker-management" element={
                <ProtectedRoute>
                  <Layout>
                    <FieldWorkerManagement />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/ai-insights-engine" element={
                <ProtectedRoute>
                  <Layout>
                    <AIInsightsEngine />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/magic-search" element={
                <ProtectedRoute>
                  <Layout>
                    <MagicSearchBar />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/advanced-charts" element={
                <ProtectedRoute>
                  <Layout>
                    <AdvancedCharts />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/social-monitoring" element={
                <ProtectedRoute>
                  <Layout>
                    <SocialMediaMonitoring />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/export-manager" element={
                <ProtectedRoute>
                  <Layout>
                    <ExportManager />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/field-worker-app" element={
                <ProtectedRoute>
                  <Layout>
                    <FieldWorkerApp />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/competitor-tracking" element={
                <ProtectedRoute>
                  <Layout>
                    <CompetitorTracking />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/competitors/registry" element={
                <ProtectedRoute>
                  <Layout>
                    <CompetitorRegistry />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/competitors/monitor" element={
                <ProtectedRoute>
                  <Layout>
                    <CompetitorSocialMonitor />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/competitors/sentiment" element={
                <ProtectedRoute>
                  <Layout>
                    <CompetitorSentimentDashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/regional-map" element={
                <ProtectedRoute>
                  <Layout>
                    <RegionalMap />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/tamil-nadu-map" element={
                <ProtectedRoute>
                  <Layout>
                    <TamilNaduMapDashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/analytics-dashboard" element={
                <ProtectedRoute>
                  <Layout>
                    <AnalyticsDashboard />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/demo-requests" element={<AdminDashboard />} />
              <Route path="/admin/dashboard" element={
                <ProtectedRoute requiredPermission="manage_tenants">
                  <Layout>
                    <OrganizationDashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/admin/tenants" element={
                <ProtectedRoute requiredPermission="manage_tenants">
                  <Layout>
                    <TenantManagement />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute requiredPermission="manage_users">
                  <Layout>
                    <UserManagement />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/admin/audit-logs" element={
                <ProtectedRoute requiredPermission="view_audit_logs">
                  <Layout>
                    <AuditLogViewer />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Super Admin Routes */}
              <Route path="/super-admin/dashboard" element={
                <ProtectedRoute requiredPermission="manage_organizations">
                  <Layout>
                    <SuperAdminDashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/super-admin/admins" element={
                <ProtectedRoute requiredPermission="manage_organizations">
                  <Layout>
                    <AdminManagement />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/super-admin/polling-booth-upload" element={
                <ProtectedRoute requiredPermission="manage_organizations">
                  <Layout>
                    <PollingBoothUpload />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/super-admin/tenants" element={
                <ProtectedRoute requiredPermission="manage_organizations">
                  <Layout>
                    <TenantRegistry />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/super-admin/tenants/new" element={
                <ProtectedRoute requiredPermission="manage_organizations">
                  <Layout>
                    <TenantProvisioning />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/super-admin/tenants/:id" element={
                <ProtectedRoute requiredPermission="manage_organizations">
                  <Layout>
                    <TenantDetail />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/super-admin/billing" element={
                <ProtectedRoute requiredPermission="manage_organizations">
                  <Layout>
                    <BillingDashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/super-admin/feature-flags" element={
                <ProtectedRoute requiredPermission="manage_organizations">
                  <Layout>
                    <FeatureFlagManager />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Admin Subscription Management */}
              <Route path="/admin/subscriptions" element={
                <ProtectedRoute requiredPermission="manage_tenants">
                  <Layout>
                    <SubscriptionManagement />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Unauthorized Page */}
              <Route path="/unauthorized" element={<Unauthorized />} />
    </Routes>
  );
}

// Main App component with providers
function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <TenantProvider>
          <AuthProvider>
            <PermissionProvider>
              <OnboardingProvider>
                <RealTimeProvider>
                  <ErrorBoundary>
                    <AppRoutes />
                    <MobileContactBar />
                  </ErrorBoundary>
                </RealTimeProvider>
              </OnboardingProvider>
            </PermissionProvider>
          </AuthProvider>
        </TenantProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App