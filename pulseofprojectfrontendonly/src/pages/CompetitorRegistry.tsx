import React, { useState, useEffect } from 'react';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Business as PartyIcon,
  Person as LeaderIcon,
  Twitter as TwitterIcon,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  YouTube as YouTubeIcon,
  Warning as WarningIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { supabase } from '../lib/supabase';

interface Competitor {
  id: string;
  name: string;
  party_name: string;
  party_acronym?: string;
  leader_name?: string;
  logo_url?: string;
  color_code: string;
  description?: string;
  state?: string;
  district?: string;
  constituency?: string;
  campaign_slogan?: string;
  data_source: string;
  is_active: boolean;
  created_at: string;
}

interface SocialAccount {
  id: string;
  competitor_id: string;
  platform: string;
  handle: string;
  profile_url?: string;
  follower_count: number;
  verified: boolean;
  data_source: string;
}

export default function CompetitorRegistry() {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [selectedCompetitor, setSelectedCompetitor] = useState<Competitor | null>(null);
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    party_name: '',
    party_acronym: '',
    leader_name: '',
    color_code: '#6B7280',
    description: '',
    state: '',
    district: '',
    constituency: '',
    campaign_slogan: '',
    data_source: 'manual',
  });

  // Social account form
  const [socialForm, setSocialForm] = useState({
    platform: 'twitter',
    handle: '',
    profile_url: '',
    follower_count: 0,
    verified: false,
    data_source: 'manual',
  });

  useEffect(() => {
    loadCompetitors();
  }, []);

  async function loadCompetitors() {
    try {
      setLoading(true);
      console.log('🔍 [CompetitorRegistry] Loading competitors from Supabase...');

      const { data, error } = await supabase
        .from('competitors')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('📊 [CompetitorRegistry] Query result:', { data, error, count: data?.length });

      if (error) {
        console.error('❌ [CompetitorRegistry] Supabase error:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.warn('⚠️ [CompetitorRegistry] No competitors found in database');
      } else {
        console.log('✅ [CompetitorRegistry] Loaded', data.length, 'competitors:', data);
      }

      setCompetitors(data || []);
    } catch (error) {
      console.error('💥 [CompetitorRegistry] Failed to load competitors:', error);
    } finally {
      setLoading(false);
    }
  }

  // Validate required fields
  function validateForm(): { isValid: boolean; message: string } {
    if (!formData.party_name.trim()) {
      return { isValid: false, message: 'Party Name is required' };
    }
    if (!formData.name.trim()) {
      return { isValid: false, message: 'Display Name is required' };
    }
    if (!formData.data_source) {
      return { isValid: false, message: 'Data Source is required' };
    }
    return { isValid: true, message: '' };
  }

  // Clean form data: convert empty strings to null for optional fields
  function cleanFormData() {
    return {
      name: formData.name.trim(),
      party_name: formData.party_name.trim(),
      party_acronym: formData.party_acronym.trim() || null,
      leader_name: formData.leader_name.trim() || null,
      color_code: formData.color_code,
      description: formData.description.trim() || null,
      state: formData.state.trim() || null,
      district: formData.district.trim() || null,
      constituency: formData.constituency.trim() || null,
      campaign_slogan: formData.campaign_slogan.trim() || null,
      data_source: formData.data_source,
      is_active: true,
    };
  }

  async function handleAddCompetitor() {
    // Validate form
    const validation = validateForm();
    if (!validation.isValid) {
      alert(validation.message);
      return;
    }

    try {
      const cleanedData = cleanFormData();
      console.log('🔄 [CompetitorRegistry] Inserting competitor:', cleanedData);

      const { data, error } = await supabase
        .from('competitors')
        .insert([cleanedData])
        .select();

      if (error) {
        console.error('❌ [CompetitorRegistry] Supabase error:', error);

        // Provide specific error messages
        if (error.code === '23505') {
          alert('A competitor with this name already exists. Please use a different name.');
        } else if (error.code === '23502') {
          alert('Missing required field. Please fill in all required fields marked with *');
        } else if (error.message) {
          alert(`Failed to add competitor: ${error.message}`);
        } else {
          alert('Failed to add competitor. Please check your input and try again.');
        }
        return;
      }

      console.log('✅ [CompetitorRegistry] Competitor added successfully:', data);
      setShowAddModal(false);
      resetForm();
      await loadCompetitors();
    } catch (error: any) {
      console.error('💥 [CompetitorRegistry] Unexpected error:', error);
      alert(`An unexpected error occurred: ${error?.message || 'Unknown error'}`);
    }
  }

  async function handleUpdateCompetitor() {
    if (!selectedCompetitor) return;

    // Validate form
    const validation = validateForm();
    if (!validation.isValid) {
      alert(validation.message);
      return;
    }

    try {
      const cleanedData = cleanFormData();
      // Remove is_active since we're updating (keep existing value)
      const { is_active, ...updateData } = cleanedData;

      console.log('🔄 [CompetitorRegistry] Updating competitor:', selectedCompetitor.id, updateData);

      const { data, error } = await supabase
        .from('competitors')
        .update(updateData)
        .eq('id', selectedCompetitor.id)
        .select();

      if (error) {
        console.error('❌ [CompetitorRegistry] Supabase error:', error);

        // Provide specific error messages
        if (error.code === '23505') {
          alert('A competitor with this name already exists. Please use a different name.');
        } else if (error.code === '23502') {
          alert('Missing required field. Please fill in all required fields marked with *');
        } else if (error.message) {
          alert(`Failed to update competitor: ${error.message}`);
        } else {
          alert('Failed to update competitor. Please check your input and try again.');
        }
        return;
      }

      console.log('✅ [CompetitorRegistry] Competitor updated successfully:', data);
      setShowEditModal(false);
      setSelectedCompetitor(null);
      resetForm();
      await loadCompetitors();
    } catch (error: any) {
      console.error('💥 [CompetitorRegistry] Unexpected error:', error);
      alert(`An unexpected error occurred: ${error?.message || 'Unknown error'}`);
    }
  }

  async function handleDeleteCompetitor(id: string) {
    if (!confirm('Are you sure you want to delete this competitor? This will also delete all associated social media accounts and posts.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('competitors')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadCompetitors();
    } catch (error) {
      console.error('Failed to delete competitor:', error);
      alert('Failed to delete competitor');
    }
  }

  async function handleToggleActive(id: string, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from('competitors')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      await loadCompetitors();
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  }

  async function loadSocialAccounts(competitorId: string) {
    try {
      const { data, error } = await supabase
        .from('competitor_social_accounts')
        .select('*')
        .eq('competitor_id', competitorId);

      if (error) throw error;
      setSocialAccounts(data || []);
    } catch (error) {
      console.error('Failed to load social accounts:', error);
    }
  }

  async function handleAddSocialAccount() {
    if (!selectedCompetitor) return;

    try {
      const { error } = await supabase
        .from('competitor_social_accounts')
        .insert([{
          ...socialForm,
          competitor_id: selectedCompetitor.id,
        }]);

      if (error) throw error;

      resetSocialForm();
      await loadSocialAccounts(selectedCompetitor.id);
    } catch (error) {
      console.error('Failed to add social account:', error);
      alert('Failed to add social account');
    }
  }

  async function handleDeleteSocialAccount(id: string) {
    if (!selectedCompetitor) return;

    try {
      const { error } = await supabase
        .from('competitor_social_accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadSocialAccounts(selectedCompetitor.id);
    } catch (error) {
      console.error('Failed to delete social account:', error);
    }
  }

  function resetForm() {
    setFormData({
      name: '',
      party_name: '',
      party_acronym: '',
      leader_name: '',
      color_code: '#6B7280',
      description: '',
      state: '',
      district: '',
      constituency: '',
      campaign_slogan: '',
      data_source: 'manual',
    });
  }

  function resetSocialForm() {
    setSocialForm({
      platform: 'twitter',
      handle: '',
      profile_url: '',
      follower_count: 0,
      verified: false,
      data_source: 'manual',
    });
  }

  function openEditModal(competitor: Competitor) {
    setSelectedCompetitor(competitor);
    setFormData({
      name: competitor.name,
      party_name: competitor.party_name,
      party_acronym: competitor.party_acronym || '',
      leader_name: competitor.leader_name || '',
      color_code: competitor.color_code,
      description: competitor.description || '',
      state: competitor.state || '',
      district: competitor.district || '',
      constituency: competitor.constituency || '',
      campaign_slogan: competitor.campaign_slogan || '',
      data_source: competitor.data_source,
    });
    setShowEditModal(true);
  }

  function openSocialModal(competitor: Competitor) {
    setSelectedCompetitor(competitor);
    loadSocialAccounts(competitor.id);
    setShowSocialModal(true);
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter': return <TwitterIcon className="w-5 h-5" />;
      case 'facebook': return <FacebookIcon className="w-5 h-5" />;
      case 'instagram': return <InstagramIcon className="w-5 h-5" />;
      case 'youtube': return <YouTubeIcon className="w-5 h-5" />;
      default: return <TwitterIcon className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading competitors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Legal Compliance Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <InfoIcon className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-900 mb-1">
                Legal Data Collection Only
              </h3>
              <p className="text-sm text-blue-800 mb-2">
                This platform collects competitor data through <strong>LEGAL methods only</strong>: Official APIs, Third-party services (Mention, Brand24), and Manual entry.
                <strong className="text-red-600"> Web scraping is strictly prohibited</strong> and violates platform Terms of Service.
              </p>
              <a
                href="/docs/COMPETITOR_ANALYSIS_LEGAL_GUIDE.md"
                target="_blank"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium underline"
              >
                Read Legal Data Collection Guide →
              </a>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <PartyIcon className="w-8 h-8 mr-3 text-blue-600" />
                Competitor Registry
              </h1>
              <p className="text-gray-600 mt-1">
                Manage competitor profiles and social media accounts
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <AddIcon className="w-5 h-5 mr-2" />
              Add Competitor
            </button>
          </div>
        </div>

        {/* Competitors Grid */}
        {competitors.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <PartyIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Competitors Yet</h3>
            <p className="text-gray-600 mb-4">
              Add your first competitor to start tracking their social media presence
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <AddIcon className="w-5 h-5 mr-2" />
              Add Competitor
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {competitors.map((competitor) => (
              <div
                key={competitor.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: competitor.color_code }}
                    >
                      {competitor.party_acronym || competitor.name.charAt(0)}
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-900">{competitor.name}</h3>
                      <p className="text-sm text-gray-600">{competitor.party_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {competitor.is_active ? (
                      <ActiveIcon className="w-5 h-5 text-green-500" title="Active" />
                    ) : (
                      <InactiveIcon className="w-5 h-5 text-gray-400" title="Inactive" />
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  {competitor.leader_name && (
                    <div className="flex items-center text-sm text-gray-600">
                      <LeaderIcon className="w-4 h-4 mr-2" />
                      {competitor.leader_name}
                    </div>
                  )}
                  {competitor.constituency && (
                    <div className="text-sm text-gray-600">
                      📍 {competitor.constituency}{competitor.district && `, ${competitor.district}`}
                    </div>
                  )}
                  {competitor.campaign_slogan && (
                    <div className="text-sm italic text-gray-500">
                      "{competitor.campaign_slogan}"
                    </div>
                  )}
                </div>

                {/* Data Source Badge */}
                <div className="mb-4">
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                    competitor.data_source === 'manual'
                      ? 'bg-gray-100 text-gray-700'
                      : competitor.data_source === 'official_api'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {competitor.data_source === 'manual' ? '📝 Manual Entry' :
                     competitor.data_source === 'official_api' ? '✅ Official API' :
                     `🔗 ${competitor.data_source}`}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openSocialModal(competitor)}
                    className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Social Media
                  </button>
                  <button
                    onClick={() => openEditModal(competitor)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Edit"
                  >
                    <EditIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleToggleActive(competitor.id, competitor.is_active)}
                    className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg"
                    title={competitor.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {competitor.is_active ? <InactiveIcon className="w-5 h-5" /> : <ActiveIcon className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => handleDeleteCompetitor(competitor.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    title="Delete"
                  >
                    <DeleteIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Competitor Modal */}
        {(showAddModal || showEditModal) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
                <h2 className="text-xl font-bold text-gray-900">
                  {showAddModal ? 'Add Competitor' : 'Edit Competitor'}
                </h2>
                <button
                  onClick={() => {
                    showAddModal ? setShowAddModal(false) : setShowEditModal(false);
                    resetForm();
                    setSelectedCompetitor(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <CloseIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="px-6 py-4 space-y-4">
                {/* Party Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Party Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.party_name}
                      onChange={(e) => setFormData({ ...formData, party_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Dravida Munnetra Kazhagam"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Acronym
                    </label>
                    <input
                      type="text"
                      value={formData.party_acronym}
                      onChange={(e) => setFormData({ ...formData, party_acronym: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="DMK"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Display Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="DMK"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Leader Name
                    </label>
                    <input
                      type="text"
                      value={formData.leader_name}
                      onChange={(e) => setFormData({ ...formData, leader_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="M.K. Stalin"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color Code
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={formData.color_code}
                      onChange={(e) => setFormData({ ...formData, color_code: e.target.value })}
                      className="h-10 w-20 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.color_code}
                      onChange={(e) => setFormData({ ...formData, color_code: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="#6B7280"
                    />
                  </div>
                </div>

                {/* Geographic Info */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Tamil Nadu"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                    <input
                      type="text"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Chennai"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Constituency</label>
                    <input
                      type="text"
                      value={formData.constituency}
                      onChange={(e) => setFormData({ ...formData, constituency: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Kolathur"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Slogan</label>
                  <input
                    type="text"
                    value={formData.campaign_slogan}
                    onChange={(e) => setFormData({ ...formData, campaign_slogan: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Rising Sun for All"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Main opposition party in Tamil Nadu..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Source <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.data_source}
                    onChange={(e) => setFormData({ ...formData, data_source: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="manual">📝 Manual Entry</option>
                    <option value="official_api">✅ Official API (Facebook, Twitter, etc.)</option>
                    <option value="mention">🔗 Mention.com Subscription</option>
                    <option value="brand24">🔗 Brand24 Subscription</option>
                    <option value="hootsuite">🔗 Hootsuite Subscription</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Legal sources only. Never select "scraped" or unauthorized methods.
                  </p>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3 sticky bottom-0 bg-white">
                <button
                  onClick={() => {
                    showAddModal ? setShowAddModal(false) : setShowEditModal(false);
                    resetForm();
                    setSelectedCompetitor(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={showAddModal ? handleAddCompetitor : handleUpdateCompetitor}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {showAddModal ? 'Add Competitor' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Social Media Modal */}
        {showSocialModal && selectedCompetitor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Social Media Accounts</h2>
                  <p className="text-sm text-gray-600">{selectedCompetitor.name}</p>
                </div>
                <button
                  onClick={() => {
                    setShowSocialModal(false);
                    setSelectedCompetitor(null);
                    setSocialAccounts([]);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <CloseIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="px-6 py-4">
                {/* Add Social Account Form */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Add Social Account</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                      <select
                        value={socialForm.platform}
                        onChange={(e) => setSocialForm({ ...socialForm, platform: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="twitter">Twitter/X</option>
                        <option value="facebook">Facebook</option>
                        <option value="instagram">Instagram</option>
                        <option value="youtube">YouTube</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Handle</label>
                      <input
                        type="text"
                        value={socialForm.handle}
                        onChange={(e) => setSocialForm({ ...socialForm, handle: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="@dmk_official"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Followers</label>
                      <input
                        type="number"
                        value={socialForm.follower_count}
                        onChange={(e) => setSocialForm({ ...socialForm, follower_count: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Profile URL</label>
                      <input
                        type="url"
                        value={socialForm.profile_url}
                        onChange={(e) => setSocialForm({ ...socialForm, profile_url: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://twitter.com/dmk_official"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <label className="flex items-center text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={socialForm.verified}
                        onChange={(e) => setSocialForm({ ...socialForm, verified: e.target.checked })}
                        className="mr-2 rounded"
                      />
                      Verified Account
                    </label>
                    <button
                      onClick={handleAddSocialAccount}
                      disabled={!socialForm.handle}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add Account
                    </button>
                  </div>
                </div>

                {/* Social Accounts List */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Existing Accounts</h3>
                  {socialAccounts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No social media accounts added yet
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {socialAccounts.map((account) => (
                        <div
                          key={account.id}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="text-gray-600">
                              {getPlatformIcon(account.platform)}
                            </div>
                            <div>
                              <div className="flex items-center">
                                <p className="font-medium text-gray-900">{account.handle}</p>
                                {account.verified && (
                                  <span className="ml-2 text-blue-500" title="Verified">✓</span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">
                                {account.follower_count.toLocaleString()} followers
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {account.profile_url && (
                              <a
                                href={account.profile_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                              >
                                View
                              </a>
                            )}
                            <button
                              onClick={() => handleDeleteSocialAccount(account.id)}
                              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <DeleteIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
