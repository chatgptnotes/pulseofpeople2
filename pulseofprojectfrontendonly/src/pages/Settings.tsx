import { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { TIME_RANGES, REFRESH_INTERVALS } from '../utils/constants';
import { Settings as SettingsIcon, Bell, Palette, Database, Shield, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface SettingsData {
  dashboard: {
    refreshInterval: number;
    defaultTimeRange: string;
    enableRealTime: boolean;
    theme: 'light' | 'dark' | 'auto';
  };
  alerts: {
    enabled: boolean;
    email: boolean;
    push: boolean;
    sentimentThreshold: number;
    issueAlerts: string[];
  };
  data: {
    cacheEnabled: boolean;
    offlineMode: boolean;
    dataRetention: number;
  };
  privacy: {
    analytics: boolean;
    tracking: boolean;
    datasharing: boolean;
  };
}

const defaultSettings: SettingsData = {
  dashboard: {
    refreshInterval: REFRESH_INTERVALS.NORMAL,
    defaultTimeRange: '30d',
    enableRealTime: true,
    theme: 'light'
  },
  alerts: {
    enabled: true,
    email: true,
    push: false,
    sentimentThreshold: 0.3,
    issueAlerts: ['Jobs', 'Health']
  },
  data: {
    cacheEnabled: true,
    offlineMode: false,
    dataRetention: 90
  },
  privacy: {
    analytics: true,
    tracking: false,
    datasharing: false
  }
};

export default function Settings() {
  const { user } = useAuth();
  const [settings, setSettings] = useLocalStorage<SettingsData>('dashboard-settings', defaultSettings);
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);

  // Profile editing state
  const [profileData, setProfileData] = useState({
    full_name: user?.name || '',
    email: user?.email || '',
    phone: '',
    bio: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  const updateSetting = (section: keyof SettingsData, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  // Profile update handler
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setProfileMessage(null);

    try {
      if (!user?.id) throw new Error('User not authenticated');

      // Update in public.users table
      const { error: dbError } = await supabase
        .from('users')
        .update({
          full_name: profileData.full_name,
          phone: profileData.phone,
          bio: profileData.bio,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (dbError) throw dbError;

      // Update user metadata in Supabase Auth
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: profileData.full_name,
        }
      });

      if (authError) throw authError;

      setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });

      // Reload page after 1.5 seconds to reflect changes
      setTimeout(() => window.location.reload(), 1500);
    } catch (error: any) {
      console.error('Profile update error:', error);
      setProfileMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setIsSaving(false);
    }
  };

  // Password change handler
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setProfileMessage(null);

    // Validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setProfileMessage({ type: 'error', text: 'New passwords do not match' });
      setIsSaving(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setProfileMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      setIsSaving(false);
      return;
    }

    try {
      // Update password in Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      setProfileMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      console.error('Password change error:', error);
      setProfileMessage({ type: 'error', text: error.message || 'Failed to change password' });
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'dashboard', label: 'Dashboard', icon: SettingsIcon },
    { id: 'alerts', label: 'Alerts', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'data', label: 'Data', icon: Database },
    { id: 'privacy', label: 'Privacy', icon: Shield }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Customize your dashboard experience</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-3" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            {activeTab === 'profile' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Profile</h3>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                      {user?.role}
                    </span>
                  </div>
                </div>

                {profileMessage && (
                  <div className={`p-2.5 rounded-lg text-sm ${
                    profileMessage.type === 'success'
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {profileMessage.text}
                  </div>
                )}

                {/* Compact 2-Column Layout */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Left Column - Profile Form */}
                  <form onSubmit={handleProfileUpdate} className="space-y-3">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 border border-blue-100">
                      <div className="text-xs font-medium text-gray-600 mb-1">Account Details</div>
                      <div className="text-xs text-gray-500 font-mono">{user?.id.slice(0, 16)}...</div>
                      <div className="text-xs text-gray-600 mt-1">
                        Org: {user?.organization_id ? 'TVK' : 'None'}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={profileData.full_name}
                        onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        disabled
                        className="w-full border border-gray-300 rounded-md px-2.5 py-1.5 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-400 mt-0.5">Cannot be changed</p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="+91 9876543210"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Bio
                      </label>
                      <textarea
                        value={profileData.bio}
                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows={2}
                        placeholder="Brief description..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSaving}
                      className="w-full bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {isSaving ? 'Saving...' : 'Update Profile'}
                    </button>
                  </form>

                  {/* Right Column - Password Change */}
                  <form onSubmit={handlePasswordChange} className="space-y-3">
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-3 border border-red-100">
                      <div className="text-xs font-medium text-gray-700">Security</div>
                      <div className="text-xs text-gray-500 mt-1">Change your password</div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        New Password *
                      </label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Min. 6 characters"
                        minLength={6}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Confirm Password *
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Re-enter password"
                        minLength={6}
                      />
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-2">
                      <p className="text-xs text-yellow-700">
                        Password must be at least 6 characters. You'll need to login again after changing.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={isSaving || !passwordData.newPassword || !passwordData.confirmPassword}
                      className="w-full bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSaving ? 'Changing...' : 'Change Password'}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Dashboard Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Refresh Interval
                    </label>
                    <select
                      value={settings.dashboard.refreshInterval}
                      onChange={(e) => updateSetting('dashboard', 'refreshInterval', Number(e.target.value))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={REFRESH_INTERVALS.REAL_TIME}>30 seconds</option>
                      <option value={REFRESH_INTERVALS.FREQUENT}>1 minute</option>
                      <option value={REFRESH_INTERVALS.NORMAL}>5 minutes</option>
                      <option value={REFRESH_INTERVALS.SLOW}>10 minutes</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Time Range
                    </label>
                    <select
                      value={settings.dashboard.defaultTimeRange}
                      onChange={(e) => updateSetting('dashboard', 'defaultTimeRange', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    >
                      {Object.entries(TIME_RANGES).map(([key, range]) => (
                        <option key={key} value={key}>{range.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Real-time Updates</h4>
                    <p className="text-sm text-gray-500">Enable automatic data refresh</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.dashboard.enableRealTime}
                    onChange={(e) => updateSetting('dashboard', 'enableRealTime', e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {activeTab === 'alerts' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Alert Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Enable Alerts</h4>
                      <p className="text-sm text-gray-500">Receive notifications for important changes</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.alerts.enabled}
                      onChange={(e) => updateSetting('alerts', 'enabled', e.target.checked)}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                      <p className="text-sm text-gray-500">Receive alerts via email</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.alerts.email}
                      onChange={(e) => updateSetting('alerts', 'email', e.target.checked)}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sentiment Threshold ({settings.alerts.sentimentThreshold})
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={settings.alerts.sentimentThreshold}
                      onChange={(e) => updateSetting('alerts', 'sentimentThreshold', Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Very Negative</span>
                      <span>Neutral</span>
                      <span>Very Positive</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Appearance</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Theme
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['light', 'dark', 'auto'].map(theme => (
                      <button
                        key={theme}
                        onClick={() => updateSetting('dashboard', 'theme', theme)}
                        className={`p-3 border rounded-lg text-sm font-medium capitalize transition-colors ${
                          settings.dashboard.theme === theme
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Data Management</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Enable Caching</h4>
                      <p className="text-sm text-gray-500">Cache data for faster loading</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.data.cacheEnabled}
                      onChange={(e) => updateSetting('data', 'cacheEnabled', e.target.checked)}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data Retention (days)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={settings.data.dataRetention}
                      onChange={(e) => updateSetting('data', 'dataRetention', Number(e.target.value))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Privacy Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Analytics</h4>
                      <p className="text-sm text-gray-500">Help improve the app by sharing usage data</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.privacy.analytics}
                      onChange={(e) => updateSetting('privacy', 'analytics', e.target.checked)}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Data Sharing</h4>
                      <p className="text-sm text-gray-500">Share anonymized data for research</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.privacy.datasharing}
                      onChange={(e) => updateSetting('privacy', 'datasharing', e.target.checked)}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}