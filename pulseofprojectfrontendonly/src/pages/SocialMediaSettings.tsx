import React, { useState, useEffect } from 'react';
import {
  Globe,
  Camera,
  MessageCircle,
  Play,
  MessageSquare,
  Zap,
  UserPlus,
  Mic,
  Settings,
  Save,
  TestTube,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  Edit2,
  Key,
  Hash,
  Users,
  Target,
  RefreshCw,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
  Download,
  Upload,
  Copy,
  TrendingUp,
  BarChart3,
  Search,
  DollarSign,
  Info,
  ExternalLink,
  Clock,
  Shield
} from 'lucide-react';
import { TVKLogo } from '../components/TVKLogo';

// ============================================================================
// INTERFACES
// ============================================================================

interface SocialMediaAccount {
  id: string;
  platform: string;
  accountName: string;
  accountUrl: string;
  accountId: string;
  enabled: boolean;
  verified: boolean;
  followerCount?: number;
  apiConfig?: {
    accessToken?: string;
    apiKey?: string;
    bearerToken?: string;
    channelId?: string;
  };
  lastSynced?: Date;
  connectionStatus: 'connected' | 'error' | 'not_configured' | 'testing';
}

interface SeedData {
  keywords: string[];
  hashtags: string[];
  competitorAccounts: string[];
  influencers: string[];
  locations: string[];
}

interface ThirdPartyService {
  id: string;
  name: string;
  description: string;
  category: string;
  enabled: boolean;
  apiKey: string;
  endpoint: string;
  accountId?: string;
  projectId?: string;
  status: 'active' | 'inactive' | 'error' | 'not_configured';
  features: string[];
  integrationSteps: string[];
  pricing: {
    free?: string;
    starter?: string;
    professional?: string;
    enterprise?: string;
  };
  setupUrl: string;
  docsUrl: string;
}

// ============================================================================
// PLATFORM CONFIGURATIONS
// ============================================================================

const PLATFORMS = [
  { id: 'facebook', name: 'Facebook', icon: Globe, color: 'bg-blue-600', fields: ['pageId', 'accessToken'] },
  { id: 'instagram', name: 'Instagram', icon: Camera, color: 'bg-pink-600', fields: ['accountId', 'accessToken'] },
  { id: 'twitter', name: 'Twitter/X', icon: MessageCircle, color: 'bg-black', fields: ['accountId', 'bearerToken'] },
  { id: 'youtube', name: 'YouTube', icon: Play, color: 'bg-red-600', fields: ['channelId', 'apiKey'] },
  { id: 'whatsapp', name: 'WhatsApp', icon: MessageSquare, color: 'bg-green-600', fields: ['businessId', 'apiToken'] },
  { id: 'telegram', name: 'Telegram', icon: Zap, color: 'bg-blue-500', fields: ['channelId', 'botToken'] },
  { id: 'linkedin', name: 'LinkedIn', icon: UserPlus, color: 'bg-blue-700', fields: ['pageId', 'accessToken'] },
  { id: 'tiktok', name: 'TikTok', icon: Mic, color: 'bg-black', fields: ['accountId', 'accessToken'] }
];

// Third-Party Social Media Monitoring Services
const THIRD_PARTY_SERVICES = [
  {
    id: 'brandwatch',
    name: 'Brandwatch',
    description: 'Enterprise-grade social listening and consumer intelligence platform',
    category: 'Social Listening',
    icon: TrendingUp,
    color: 'bg-purple-600',
    features: [
      'Real-time social media monitoring across 100M+ sources',
      'AI-powered sentiment analysis and trend detection',
      'Competitive intelligence and market research',
      'Custom dashboards and automated reporting',
      'Image recognition and logo detection'
    ],
    integrationSteps: [
      'Create a Brandwatch account at brandwatch.com',
      'Navigate to Settings → API Access',
      'Generate a new API key with read permissions',
      'Copy your Project ID from project settings',
      'Add credentials below and test connection'
    ],
    pricing: {
      professional: '$800-1,200/month',
      enterprise: '$2,000-5,000/month',
      custom: 'Custom pricing for large organizations'
    },
    setupUrl: 'https://www.brandwatch.com/demo',
    docsUrl: 'https://developers.brandwatch.com/'
  },
  {
    id: 'mention',
    name: 'Mention',
    description: 'Real-time media monitoring and social listening tool',
    category: 'Brand Monitoring',
    icon: Search,
    color: 'bg-blue-600',
    features: [
      'Track brand mentions across web and social media',
      'Real-time alerts for critical mentions',
      'Competitor tracking and analysis',
      'Influencer identification',
      'Sentiment analysis and reporting'
    ],
    integrationSteps: [
      'Sign up at mention.com',
      'Go to Settings → Integrations → API',
      'Generate API token',
      'Copy your Account ID from account settings',
      'Configure alert settings and keywords'
    ],
    pricing: {
      starter: '$41/month',
      professional: '$83/month',
      enterprise: '$149/month'
    },
    setupUrl: 'https://mention.com/en/pricing/',
    docsUrl: 'https://dev.mention.com/'
  },
  {
    id: 'hootsuite',
    name: 'Hootsuite Insights',
    description: 'Powered by Brandwatch - Social media analytics and insights',
    category: 'Analytics',
    icon: BarChart3,
    color: 'bg-black',
    features: [
      'Comprehensive social media analytics',
      'Audience insights and demographics',
      'Campaign performance tracking',
      'Competitive benchmarking',
      'Custom report builder'
    ],
    integrationSteps: [
      'Log in to Hootsuite dashboard',
      'Navigate to Settings → Integrations',
      'Enable Hootsuite Insights API',
      'Generate access token',
      'Configure data sync preferences'
    ],
    pricing: {
      professional: '$99/month',
      team: '$249/month',
      enterprise: 'Custom pricing'
    },
    setupUrl: 'https://www.hootsuite.com/products/insights',
    docsUrl: 'https://developer.hootsuite.com/'
  },
  {
    id: 'sproutsocial',
    name: 'Sprout Social',
    description: 'All-in-one social media management and analytics platform',
    category: 'Social Management',
    icon: Target,
    color: 'bg-green-600',
    features: [
      'Unified social inbox for all platforms',
      'Advanced analytics and reporting',
      'Social listening and monitoring',
      'Publishing and scheduling tools',
      'Team collaboration features'
    ],
    integrationSteps: [
      'Create Sprout Social account',
      'Connect your social media accounts',
      'Go to Settings → API Clients',
      'Create new API client',
      'Copy Client ID and Secret for integration'
    ],
    pricing: {
      standard: '$249/month',
      professional: '$399/month',
      advanced: '$499/month'
    },
    setupUrl: 'https://sproutsocial.com/pricing/',
    docsUrl: 'https://developers.sproutsocial.com/'
  },
  {
    id: 'talkwalker',
    name: 'Talkwalker',
    description: 'AI-powered social listening and analytics platform',
    category: 'Social Listening',
    icon: MessageCircle,
    color: 'bg-red-600',
    features: [
      'Monitor 150M+ websites and social networks',
      'AI-driven insights and trend prediction',
      'Crisis detection and alerts',
      'Image and video recognition',
      'Influencer identification and tracking'
    ],
    integrationSteps: [
      'Request demo at talkwalker.com',
      'Complete onboarding with account manager',
      'Access API credentials in platform settings',
      'Configure topics and search queries',
      'Set up alerts and notifications'
    ],
    pricing: {
      professional: '$9,600/year',
      enterprise: 'Custom pricing'
    },
    setupUrl: 'https://www.talkwalker.com/demo',
    docsUrl: 'https://api.talkwalker.com/'
  },
  {
    id: 'meltwater',
    name: 'Meltwater',
    description: 'Media intelligence and social monitoring suite',
    category: 'Media Intelligence',
    icon: Globe,
    color: 'bg-indigo-600',
    features: [
      'Global media monitoring (news + social)',
      'PR and communications analytics',
      'Media contact database',
      'Competitive intelligence',
      'Executive briefings and reports'
    ],
    integrationSteps: [
      'Contact Meltwater sales for account setup',
      'Complete platform onboarding',
      'Receive API credentials from support team',
      'Configure search queries and alerts',
      'Set up custom dashboards'
    ],
    pricing: {
      enterprise: '$5,000-15,000/year (typically)'
    },
    setupUrl: 'https://www.meltwater.com/en/request-demo',
    docsUrl: 'https://developer.meltwater.com/'
  },
  {
    id: 'brand24',
    name: 'Brand24',
    description: 'Affordable social media monitoring and analytics',
    category: 'Brand Monitoring',
    icon: Shield,
    color: 'bg-yellow-600',
    features: [
      'Real-time brand mention monitoring',
      'Sentiment analysis',
      'Influencer score tracking',
      'Discussion volume charts',
      'Automated reporting'
    ],
    integrationSteps: [
      'Sign up at brand24.com',
      'Create monitoring projects',
      'Go to Settings → API',
      'Generate API key',
      'Configure webhooks for real-time updates'
    ],
    pricing: {
      starter: '$69/month',
      plus: '$139/month',
      premium: '$239/month',
      max: '$399/month'
    },
    setupUrl: 'https://brand24.com/pricing/',
    docsUrl: 'https://docs.brand24.com/api/'
  },
  {
    id: 'awario',
    name: 'Awario',
    description: 'Social listening and lead generation tool',
    category: 'Lead Generation',
    icon: Users,
    color: 'bg-teal-600',
    features: [
      'Monitor keywords across social and web',
      'Lead generation from social conversations',
      'Boolean search for precise tracking',
      'Sentiment analysis',
      'Competitor monitoring'
    ],
    integrationSteps: [
      'Create Awario account',
      'Set up alerts for keywords',
      'Navigate to Settings → API Access',
      'Generate API token',
      'Configure alert delivery preferences'
    ],
    pricing: {
      starter: '$29/month',
      pro: '$89/month',
      enterprise: '$299/month'
    },
    setupUrl: 'https://awario.com/pricing/',
    docsUrl: 'https://awario.com/help/api/'
  }
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SocialMediaSettings() {
  const [activeTab, setActiveTab] = useState<'accounts' | 'credentials' | 'seeddata' | 'thirdparty'>('accounts');
  const [accounts, setAccounts] = useState<SocialMediaAccount[]>([]);
  const [seedData, setSeedData] = useState<SeedData>({
    keywords: ['TVK', 'Tamilaga Vettri Kazhagam', 'தமிழக வெற்றி கழகம்'],
    hashtags: ['#TVK', '#TamilNadu', '#தமிழகம்'],
    competitorAccounts: [],
    influencers: [],
    locations: ['Tamil Nadu', 'Chennai', 'Coimbatore', 'Madurai']
  });
  const [thirdPartyServices, setThirdPartyServices] = useState<ThirdPartyService[]>([]);
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<SocialMediaAccount | null>(null);
  const [showApiKeys, setShowApiKeys] = useState<{ [key: string]: boolean }>({});
  const [editingService, setEditingService] = useState<ThirdPartyService | null>(null);
  const [showServiceModal, setShowServiceModal] = useState(false);

  // Load saved data from localStorage on mount
  useEffect(() => {
    loadSavedData();
  }, []);

  const loadSavedData = () => {
    try {
      const savedAccounts = localStorage.getItem('tvk_social_accounts');
      const savedSeedData = localStorage.getItem('tvk_seed_data');
      const savedServices = localStorage.getItem('tvk_third_party_services');

      if (savedAccounts) setAccounts(JSON.parse(savedAccounts));
      if (savedSeedData) setSeedData(JSON.parse(savedSeedData));
      if (savedServices) setThirdPartyServices(JSON.parse(savedServices));
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  };

  const saveToLocalStorage = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  // ============================================================================
  // ACCOUNT MANAGEMENT
  // ============================================================================

  const addAccount = (platform: string) => {
    const newAccount: SocialMediaAccount = {
      id: Date.now().toString(),
      platform,
      accountName: '',
      accountUrl: '',
      accountId: '',
      enabled: true,
      verified: false,
      connectionStatus: 'not_configured',
      apiConfig: {}
    };
    setEditingAccount(newAccount);
    setShowAddAccountModal(true);
  };

  const saveAccount = (account: SocialMediaAccount) => {
    const updatedAccounts = account.id && accounts.find(a => a.id === account.id)
      ? accounts.map(a => a.id === account.id ? account : a)
      : [...accounts, account];

    setAccounts(updatedAccounts);
    saveToLocalStorage('tvk_social_accounts', updatedAccounts);
    setShowAddAccountModal(false);
    setEditingAccount(null);
  };

  const deleteAccount = (id: string) => {
    if (confirm('Are you sure you want to delete this account?')) {
      const updatedAccounts = accounts.filter(a => a.id !== id);
      setAccounts(updatedAccounts);
      saveToLocalStorage('tvk_social_accounts', updatedAccounts);
    }
  };

  const testConnection = async (account: SocialMediaAccount) => {
    // Update status to testing
    const updatedAccounts = accounts.map(a =>
      a.id === account.id ? { ...a, connectionStatus: 'testing' as const } : a
    );
    setAccounts(updatedAccounts);

    // Simulate API test (in real implementation, call actual APIs)
    setTimeout(() => {
      const success = Math.random() > 0.3; // Simulate 70% success rate
      const finalAccounts = accounts.map(a =>
        a.id === account.id
          ? {
              ...a,
              connectionStatus: success ? 'connected' as const : 'error' as const,
              verified: success,
              lastSynced: success ? new Date() : undefined
            }
          : a
      );
      setAccounts(finalAccounts);
      saveToLocalStorage('tvk_social_accounts', finalAccounts);
    }, 2000);
  };

  const exportConfiguration = () => {
    const config = {
      accounts,
      seedData,
      thirdPartyServices,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tvk-social-media-config-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importConfiguration = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target?.result as string);
        if (config.accounts) {
          setAccounts(config.accounts);
          saveToLocalStorage('tvk_social_accounts', config.accounts);
        }
        if (config.seedData) {
          setSeedData(config.seedData);
          saveToLocalStorage('tvk_seed_data', config.seedData);
        }
        if (config.thirdPartyServices) {
          setThirdPartyServices(config.thirdPartyServices);
          saveToLocalStorage('tvk_third_party_services', config.thirdPartyServices);
        }
        alert('Configuration imported successfully!');
      } catch (error) {
        alert('Error importing configuration. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  // ============================================================================
  // SEED DATA MANAGEMENT
  // ============================================================================

  const addKeyword = (keyword: string) => {
    if (keyword && !seedData.keywords.includes(keyword)) {
      const updated = { ...seedData, keywords: [...seedData.keywords, keyword] };
      setSeedData(updated);
      saveToLocalStorage('tvk_seed_data', updated);
    }
  };

  const removeKeyword = (keyword: string) => {
    const updated = { ...seedData, keywords: seedData.keywords.filter(k => k !== keyword) };
    setSeedData(updated);
    saveToLocalStorage('tvk_seed_data', updated);
  };

  // ============================================================================
  // THIRD-PARTY SERVICE MANAGEMENT
  // ============================================================================

  const configureService = (serviceTemplate: any) => {
    const existing = thirdPartyServices.find(s => s.id === serviceTemplate.id);
    if (existing) {
      setEditingService(existing);
    } else {
      setEditingService({
        ...serviceTemplate,
        enabled: false,
        apiKey: '',
        endpoint: '',
        accountId: '',
        projectId: '',
        status: 'not_configured' as const
      });
    }
    setShowServiceModal(true);
  };

  const saveService = (service: ThirdPartyService) => {
    const updatedServices = service.id && thirdPartyServices.find(s => s.id === service.id)
      ? thirdPartyServices.map(s => s.id === service.id ? service : s)
      : [...thirdPartyServices, service];

    setThirdPartyServices(updatedServices);
    saveToLocalStorage('tvk_third_party_services', updatedServices);
    setShowServiceModal(false);
    setEditingService(null);
  };

  const testServiceConnection = async (service: ThirdPartyService) => {
    const updatedServices = thirdPartyServices.map(s =>
      s.id === service.id ? { ...s, status: 'inactive' as const } : s
    );
    setThirdPartyServices(updatedServices);

    setTimeout(() => {
      const success = Math.random() > 0.3;
      const finalServices = thirdPartyServices.map(s =>
        s.id === service.id
          ? { ...s, status: success ? 'active' as const : 'error' as const }
          : s
      );
      setThirdPartyServices(finalServices);
      saveToLocalStorage('tvk_third_party_services', finalServices);
    }, 2000);
  };

  const toggleService = (serviceId: string) => {
    const updatedServices = thirdPartyServices.map(s =>
      s.id === serviceId ? { ...s, enabled: !s.enabled } : s
    );
    setThirdPartyServices(updatedServices);
    saveToLocalStorage('tvk_third_party_services', updatedServices);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <TVKLogo size="medium" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Social Media Configuration</h1>
                <p className="text-gray-600 mt-1">Manage TVK's social media accounts, credentials, and monitoring settings</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".json"
                  onChange={importConfiguration}
                  className="hidden"
                />
                <div className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center space-x-2">
                  <Upload className="w-4 h-4" />
                  <span>Import</span>
                </div>
              </label>
              <button
                onClick={exportConfiguration}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button
                onClick={() => loadSavedData()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex border-b border-gray-200">
            {[
              { id: 'accounts', label: 'Social Media Accounts', icon: Globe },
              { id: 'credentials', label: 'API Credentials', icon: Key },
              { id: 'seeddata', label: 'Seed Data', icon: Hash },
              { id: 'thirdparty', label: 'Third-Party Services', icon: Settings }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 px-6 py-4 flex items-center justify-center space-x-2 font-medium transition ${
                  activeTab === tab.id
                    ? 'bg-red-50 text-red-700 border-b-2 border-red-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto">
        {/* Accounts Tab */}
        {activeTab === 'accounts' && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Accounts</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{accounts.length}</p>
                  </div>
                  <Globe className="w-10 h-10 text-blue-600" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Connected</p>
                    <p className="text-3xl font-bold text-green-600 mt-1">
                      {accounts.filter(a => a.connectionStatus === 'connected').length}
                    </p>
                  </div>
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Errors</p>
                    <p className="text-3xl font-bold text-red-600 mt-1">
                      {accounts.filter(a => a.connectionStatus === 'error').length}
                    </p>
                  </div>
                  <XCircle className="w-10 h-10 text-red-600" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Not Configured</p>
                    <p className="text-3xl font-bold text-yellow-600 mt-1">
                      {accounts.filter(a => a.connectionStatus === 'not_configured').length}
                    </p>
                  </div>
                  <AlertCircle className="w-10 h-10 text-yellow-600" />
                </div>
              </div>
            </div>

            {/* Add Account Buttons */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Account</h3>
              <div className="grid grid-cols-4 gap-4">
                {PLATFORMS.map(platform => {
                  const PlatformIcon = platform.icon;
                  const exists = accounts.find(a => a.platform === platform.id);
                  return (
                    <button
                      key={platform.id}
                      onClick={() => addAccount(platform.id)}
                      disabled={!!exists}
                      className={`p-4 rounded-lg border-2 transition ${
                        exists
                          ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                          : 'border-gray-200 hover:border-red-500 hover:bg-red-50'
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <div className={`p-3 rounded-lg ${platform.color}`}>
                          <PlatformIcon className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-medium text-gray-900">{platform.name}</span>
                        {exists && (
                          <span className="text-xs text-green-600 flex items-center">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Added
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Existing Accounts */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">TVK Social Media Accounts</h3>
                <p className="text-gray-600 text-sm mt-1">
                  {accounts.length} account{accounts.length !== 1 ? 's' : ''} configured
                </p>
              </div>
              <div className="divide-y divide-gray-200">
                {accounts.length === 0 ? (
                  <div className="p-12 text-center">
                    <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No social media accounts added yet</p>
                    <p className="text-gray-400 text-sm mt-2">Click on a platform above to get started</p>
                  </div>
                ) : (
                  accounts.map(account => {
                    const platform = PLATFORMS.find(p => p.id === account.platform);
                    if (!platform) return null;
                    const PlatformIcon = platform.icon;

                    return (
                      <div key={account.id} className="p-6 hover:bg-gray-50 transition">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`p-3 rounded-lg ${platform.color}`}>
                              <PlatformIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{platform.name}</h4>
                              <p className="text-gray-600 text-sm">{account.accountName || 'Not configured'}</p>
                              {account.accountUrl && (
                                <a
                                  href={account.accountUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 text-sm hover:underline"
                                >
                                  {account.accountUrl}
                                </a>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-4">
                            {/* Connection Status */}
                            <div className="flex items-center space-x-2">
                              {account.connectionStatus === 'connected' && (
                                <span className="flex items-center text-green-600 text-sm">
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Connected
                                </span>
                              )}
                              {account.connectionStatus === 'error' && (
                                <span className="flex items-center text-red-600 text-sm">
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Error
                                </span>
                              )}
                              {account.connectionStatus === 'not_configured' && (
                                <span className="flex items-center text-yellow-600 text-sm">
                                  <AlertCircle className="w-4 h-4 mr-1" />
                                  Not Configured
                                </span>
                              )}
                              {account.connectionStatus === 'testing' && (
                                <span className="flex items-center text-blue-600 text-sm">
                                  <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                                  Testing...
                                </span>
                              )}
                            </div>

                            {/* Actions */}
                            <button
                              onClick={() => testConnection(account)}
                              disabled={account.connectionStatus === 'testing'}
                              className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm flex items-center space-x-1"
                            >
                              <TestTube className="w-4 h-4" />
                              <span>Test</span>
                            </button>
                            <button
                              onClick={() => {
                                setEditingAccount(account);
                                setShowAddAccountModal(true);
                              }}
                              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteAccount(account.id)}
                              className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {account.followerCount && (
                          <div className="mt-4 flex items-center text-gray-600 text-sm">
                            <Users className="w-4 h-4 mr-1" />
                            {account.followerCount.toLocaleString()} followers
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* Seed Data Tab */}
        {activeTab === 'seeddata' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Hash className="w-5 h-5 mr-2" />
                Keywords to Monitor
              </h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {seedData.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm flex items-center space-x-2"
                  >
                    <span>{keyword}</span>
                    <button
                      onClick={() => removeKeyword(keyword)}
                      className="hover:text-red-900"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Add new keyword"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addKeyword((e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Similar sections for hashtags, competitors, etc. */}
          </div>
        )}

        {/* Third-Party Services Tab */}
        {activeTab === 'thirdparty' && (
          <div className="space-y-6">
            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">About Third-Party Social Media Monitoring</h3>
                  <p className="text-blue-800 text-sm leading-relaxed">
                    These professional tools provide advanced social listening, sentiment analysis, and competitive intelligence beyond what's possible with direct social media APIs.
                    They aggregate mentions across millions of websites, news sources, and social platforms - perfect for comprehensive political campaign monitoring.
                  </p>
                  <div className="mt-3 flex items-center space-x-4 text-sm text-blue-700">
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      <span>{thirdPartyServices.filter(s => s.enabled).length} services enabled</span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" />
                      <span>Estimated monthly: ${thirdPartyServices.filter(s => s.enabled).reduce((sum, s) => {
                        const service = THIRD_PARTY_SERVICES.find(t => t.id === s.id);
                        const price = service?.pricing.starter || service?.pricing.professional || '0';
                        return sum + parseInt(price.replace(/[^0-9]/g, '')) || 0;
                      }, 0)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {THIRD_PARTY_SERVICES.map(service => {
                const configured = thirdPartyServices.find(s => s.id === service.id);
                const ServiceIcon = service.icon;

                return (
                  <div
                    key={service.id}
                    className={`bg-white rounded-lg shadow-sm border-2 transition-all ${
                      configured?.enabled
                        ? 'border-green-500 ring-2 ring-green-100'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {/* Service Header */}
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`p-3 rounded-lg ${service.color}`}>
                            <ServiceIcon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{service.name}</h3>
                            <p className="text-sm text-gray-500">{service.category}</p>
                          </div>
                        </div>

                        {/* Status Badge */}
                        {configured && (
                          <div className="flex items-center space-x-2">
                            {configured.status === 'active' && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                Active
                              </span>
                            )}
                            {configured.status === 'error' && (
                              <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                                Error
                              </span>
                            )}
                            {configured.status === 'not_configured' && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                                Not Configured
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <p className="text-gray-600 text-sm mb-4">{service.description}</p>

                      {/* Features */}
                      <div className="mb-4">
                        <h4 className="text-xs font-semibold text-gray-700 uppercase mb-2">Key Features</h4>
                        <ul className="space-y-1">
                          {service.features.slice(0, 3).map((feature, idx) => (
                            <li key={idx} className="flex items-start text-sm text-gray-600">
                              <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                        {service.features.length > 3 && (
                          <button className="text-xs text-blue-600 hover:underline mt-1">
                            +{service.features.length - 3} more features
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Integration Steps */}
                    <div className="p-6 bg-gray-50 border-b border-gray-200">
                      <h4 className="text-xs font-semibold text-gray-700 uppercase mb-3 flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        Quick Integration Steps
                      </h4>
                      <ol className="space-y-2">
                        {service.integrationSteps.map((step, idx) => (
                          <li key={idx} className="flex items-start text-sm text-gray-600">
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">
                              {idx + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                      <div className="mt-4 flex items-center space-x-3">
                        <a
                          href={service.setupUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex items-center"
                        >
                          Setup Guide
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                        <span className="text-gray-300">|</span>
                        <a
                          href={service.docsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex items-center"
                        >
                          API Docs
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="p-6 border-b border-gray-200">
                      <h4 className="text-xs font-semibold text-gray-700 uppercase mb-3 flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        Cost Estimate
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        {service.pricing.free && (
                          <div className="bg-gray-50 rounded p-3">
                            <p className="text-xs text-gray-500">Free Tier</p>
                            <p className="text-sm font-semibold text-gray-900">{service.pricing.free}</p>
                          </div>
                        )}
                        {service.pricing.starter && (
                          <div className="bg-blue-50 rounded p-3">
                            <p className="text-xs text-gray-500">Starter</p>
                            <p className="text-sm font-semibold text-blue-900">{service.pricing.starter}</p>
                          </div>
                        )}
                        {service.pricing.professional && (
                          <div className="bg-purple-50 rounded p-3">
                            <p className="text-xs text-gray-500">Professional</p>
                            <p className="text-sm font-semibold text-purple-900">{service.pricing.professional}</p>
                          </div>
                        )}
                        {service.pricing.enterprise && (
                          <div className="bg-red-50 rounded p-3">
                            <p className="text-xs text-gray-500">Enterprise</p>
                            <p className="text-sm font-semibold text-red-900">{service.pricing.enterprise}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        {configured ? (
                          <>
                            <div className="flex items-center space-x-3">
                              <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={configured.enabled}
                                  onChange={() => toggleService(service.id)}
                                  className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                                />
                                <span className="text-sm text-gray-700">Enabled</span>
                              </label>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => testServiceConnection(configured)}
                                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm flex items-center space-x-1"
                              >
                                <TestTube className="w-4 h-4" />
                                <span>Test</span>
                              </button>
                              <button
                                onClick={() => configureService(service)}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm flex items-center space-x-1"
                              >
                                <Settings className="w-4 h-4" />
                                <span>Configure</span>
                              </button>
                            </div>
                          </>
                        ) : (
                          <button
                            onClick={() => configureService(service)}
                            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center space-x-2"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Configure {service.name}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Account Modal (simplified - would be expanded in full implementation) */}
      {showAddAccountModal && editingAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full m-4 p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {accounts.find(a => a.id === editingAccount.id) ? 'Edit' : 'Add'} Account
            </h3>
            <p className="text-gray-600 mb-6">
              Configure your {PLATFORMS.find(p => p.id === editingAccount.platform)?.name} account
            </p>
            <div className="space-y-4 mb-6">
              <input
                type="text"
                placeholder="Account Name (e.g., TVK Official)"
                value={editingAccount.accountName}
                onChange={(e) => setEditingAccount({ ...editingAccount, accountName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              />
              <input
                type="url"
                placeholder="Account URL"
                value={editingAccount.accountUrl}
                onChange={(e) => setEditingAccount({ ...editingAccount, accountUrl: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              />
              <input
                type="text"
                placeholder="Account ID"
                value={editingAccount.accountId}
                onChange={(e) => setEditingAccount({ ...editingAccount, accountId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAddAccountModal(false);
                  setEditingAccount(null);
                }}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => saveAccount(editingAccount)}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Account</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Third-Party Service Configuration Modal */}
      {showServiceModal && editingService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full m-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
              <h3 className="text-2xl font-bold text-gray-900">
                Configure {editingService.name}
              </h3>
              <p className="text-gray-600 mt-1">{editingService.description}</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Integration Steps */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                  <Info className="w-5 h-5 mr-2" />
                  Integration Steps
                </h4>
                <ol className="space-y-2">
                  {editingService.integrationSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start text-sm text-blue-800">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-200 text-blue-900 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
                <div className="mt-4 flex space-x-4">
                  <a
                    href={editingService.setupUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline font-medium flex items-center"
                  >
                    Open Setup Page
                    <ExternalLink className="w-4 h-4 ml-1" />
                  </a>
                  <a
                    href={editingService.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline font-medium flex items-center"
                  >
                    View API Documentation
                    <ExternalLink className="w-4 h-4 ml-1" />
                  </a>
                </div>
              </div>

              {/* Configuration Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Key *
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKeys[editingService.id] ? 'text' : 'password'}
                      placeholder="Enter your API key"
                      value={editingService.apiKey}
                      onChange={(e) => setEditingService({ ...editingService, apiKey: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKeys({ ...showApiKeys, [editingService.id]: !showApiKeys[editingService.id] })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showApiKeys[editingService.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Endpoint URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://api.example.com"
                    value={editingService.endpoint}
                    onChange={(e) => setEditingService({ ...editingService, endpoint: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account ID (optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Your account ID"
                      value={editingService.accountId || ''}
                      onChange={(e) => setEditingService({ ...editingService, accountId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project ID (optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Your project ID"
                      value={editingService.projectId || ''}
                      onChange={(e) => setEditingService({ ...editingService, projectId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="enable-service"
                    checked={editingService.enabled}
                    onChange={(e) => setEditingService({ ...editingService, enabled: e.target.checked })}
                    className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                  />
                  <label htmlFor="enable-service" className="text-sm text-gray-700">
                    Enable this service immediately
                  </label>
                </div>
              </div>

              {/* Pricing Reminder */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 mb-2 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Pricing Information
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {editingService.pricing.starter && (
                    <div className="text-sm">
                      <span className="text-yellow-700">Starter:</span>{' '}
                      <span className="font-semibold text-yellow-900">{editingService.pricing.starter}</span>
                    </div>
                  )}
                  {editingService.pricing.professional && (
                    <div className="text-sm">
                      <span className="text-yellow-700">Professional:</span>{' '}
                      <span className="font-semibold text-yellow-900">{editingService.pricing.professional}</span>
                    </div>
                  )}
                  {editingService.pricing.enterprise && (
                    <div className="text-sm">
                      <span className="text-yellow-700">Enterprise:</span>{' '}
                      <span className="font-semibold text-yellow-900">{editingService.pricing.enterprise}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowServiceModal(false);
                  setEditingService(null);
                }}
                className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => saveService(editingService)}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Configuration</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
