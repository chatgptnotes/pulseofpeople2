import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Apartment as ApartmentIcon,
  NavigateNext as NextIcon,
  NavigateBefore as BackIcon,
  Check as CheckIcon,
  Business as BusinessIcon,
  Public as PublicIcon,
  Settings as SettingsIcon,
  Palette as PaletteIcon
} from '@mui/icons-material';
import { useAuth, apiCall } from '../../contexts/AuthContext';
import { usePermission } from '../../hooks/usePermission';
import { VersionFooter } from '../../components/VersionFooter';

interface Organization {
  id: string;
  name: string;
  owned_by_admin_id: string;
}

interface TenantFormData {
  // Step 1: Basic Information
  organizationId: string;
  name: string;
  displayName: string;
  subdomain: string;
  description: string;

  // Step 2: Coverage & Configuration
  state: string;
  coverageArea: string;
  districts: string[];
  wardCount: number;
  expectedUsers: number;

  // Step 3: Subscription & Features
  subscriptionTier: 'basic' | 'standard' | 'premium' | 'enterprise';
  trialDays: number;
  enabledFeatures: string[];
  maxUsers: number;
  maxStorageGb: number;

  // Step 4: Contact Information
  contactName: string;
  contactEmail: string;
  contactPhone: string;

  // Step 5: Branding
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Tamil Nadu', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

const DEFAULT_FEATURES = [
  'dashboard', 'analytics', 'field-reports', 'surveys', 'social-media',
  'voter-database', 'competitor-analysis', 'ai-insights', 'alerts'
];


export function TenantProvisioning() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSuperAdmin = usePermission('manage_organizations');

  const [currentStep, setCurrentStep] = useState(1);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [provisioning, setProvisioning] = useState(false);

  const [formData, setFormData] = useState<TenantFormData>({
    organizationId: '',
    name: '',
    displayName: '',
    subdomain: '',
    description: '',
    state: '',
    coverageArea: '',
    districts: [],
    wardCount: 100,
    expectedUsers: 50,
    subscriptionTier: 'standard',
    trialDays: 14,
    enabledFeatures: DEFAULT_FEATURES,
    maxUsers: 100,
    maxStorageGb: 50,
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    primaryColor: '#3b82f6',
    secondaryColor: '#8b5cf6',
    logoUrl: ''
  });

  useEffect(() => {
    if (!isSuperAdmin) {
      navigate('/unauthorized');
      return;
    }

    loadOrganizations();
  }, [isSuperAdmin, navigate]);

  useEffect(() => {
    // Auto-generate subdomain from name
    if (formData.name) {
      const subdomain = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      setFormData((prev) => ({ ...prev, subdomain }));
    }
  }, [formData.name]);


  async function loadOrganizations() {
    try {
      setLoading(true);

      // Fetch organizations from Django API
      const response = await apiCall('/organizations/');

      if (response.ok) {
        const data = await response.json();
        console.log('[TenantProvisioning] Organizations loaded:', data);

        // Transform Django response to match our interface
        const orgs = (data.results || data || []).map((org: any) => ({
          id: org.id.toString(),
          name: org.party_name || org.name,
          owned_by_admin_id: org.owner?.toString() || ''
        }));

        setOrganizations(orgs);
      } else {
        console.error('[TenantProvisioning] Failed to load organizations:', response.status);
      }
    } catch (error) {
      console.error('[TenantProvisioning] Error loading organizations:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(field: keyof TenantFormData, value: any) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function validateStep(step: number): boolean {
    switch (step) {
      case 1:
        return !!(
          formData.organizationId &&
          formData.name &&
          formData.displayName &&
          formData.subdomain
        );
      case 2:
        return !!(formData.state && formData.coverageArea);
      case 3:
        return formData.enabledFeatures.length > 0;
      case 4:
        return !!(formData.contactName && formData.contactEmail);
      case 5:
        return true; // Branding is optional
      default:
        return false;
    }
  }

  async function handleProvision() {
    if (!validateStep(5)) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setProvisioning(true);

      // Generate slug from subdomain
      const slug = formData.subdomain;

      // Call the create_tenant_with_audit function
      const { data, error } = await supabase.rpc('create_tenant_with_audit', {
        p_slug: slug,
        p_name: formData.name,
        p_display_name: formData.displayName,
        p_organization_id: formData.organizationId,
        p_subdomain: formData.subdomain,
        p_created_by: (await supabase.auth.getUser()).data.user?.id,
        p_coverage_area: formData.coverageArea,
        p_state: formData.state,
        p_subscription_tier: formData.subscriptionTier
      });

      if (error) throw error;

      const tenantId = data;

      // Update additional tenant details
      await supabase
        .from('tenants')
        .update({
          description: formData.description,
          districts: formData.districts,
          ward_count: formData.wardCount,
          expected_users: formData.expectedUsers,
          trial_end_date: new Date(Date.now() + formData.trialDays * 24 * 60 * 60 * 1000).toISOString(),
          enabled_features: formData.enabledFeatures,
          max_users: formData.maxUsers,
          max_storage_gb: formData.maxStorageGb,
          contact_name: formData.contactName,
          contact_email: formData.contactEmail,
          contact_phone: formData.contactPhone,
          branding: {
            logo: formData.logoUrl,
            primaryColor: formData.primaryColor,
            secondaryColor: formData.secondaryColor
          }
        })
        .eq('id', tenantId);

      alert('Tenant provisioned successfully!');
      navigate('/super-admin/tenants');
    } catch (error) {
      console.error('Failed to provision tenant:', error);
      alert('Failed to provision tenant. Please try again.');
    } finally {
      setProvisioning(false);
    }
  }

  const steps = [
    { number: 1, title: 'Basic Information', icon: BusinessIcon },
    { number: 2, title: 'Coverage & Configuration', icon: PublicIcon },
    { number: 3, title: 'Subscription & Features', icon: SettingsIcon },
    { number: 4, title: 'Contact Information', icon: BusinessIcon },
    { number: 5, title: 'Branding', icon: PaletteIcon }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <ApartmentIcon className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Provision New Tenant</h1>
              <p className="text-sm text-gray-500">Create a new tenant with automated setup</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = currentStep === step.number;
            const isCompleted = currentStep > step.number;

            return (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isCompleted
                        ? 'bg-green-600 text-white'
                        : isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckIcon className="w-6 h-6" />
                    ) : (
                      <StepIcon className="w-6 h-6" />
                    )}
                  </div>
                  <p className="mt-2 text-xs font-medium text-gray-600 text-center max-w-[100px]">
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      currentStep > step.number ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  ></div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow p-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.organizationId}
                  onChange={(e) => handleInputChange('organizationId', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select an organization</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tenant Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Tamil Nadu Campaign 2026"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
                  placeholder="e.g., Tamil Nadu 2026"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subdomain <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={formData.subdomain}
                    onChange={(e) => handleInputChange('subdomain', e.target.value)}
                    placeholder="kerala-campaign-2026"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <span className="px-4 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-600">
                    .yourapp.com
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Auto-generated from name. Only lowercase letters, numbers, and hyphens allowed.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Brief description of this tenant..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                ></textarea>
              </div>
            </div>
          )}

          {/* Step 2: Coverage & Configuration */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Coverage & Configuration</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a state</option>
                  {INDIAN_STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coverage Area <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.coverageArea}
                  onChange={(e) => handleInputChange('coverageArea', e.target.value)}
                  placeholder="e.g., Entire State, Thiruvananthapuram District"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Districts (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.districts.join(', ')}
                  onChange={(e) =>
                    handleInputChange(
                      'districts',
                      e.target.value.split(',').map((d) => d.trim()).filter(Boolean)
                    )
                  }
                  placeholder="Thiruvananthapuram, Kollam, Pathanamthitta"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ward Count
                  </label>
                  <input
                    type="number"
                    value={formData.wardCount}
                    onChange={(e) => handleInputChange('wardCount', parseInt(e.target.value))}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Users
                  </label>
                  <input
                    type="number"
                    value={formData.expectedUsers}
                    onChange={(e) => handleInputChange('expectedUsers', parseInt(e.target.value))}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Subscription & Features */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Subscription & Features</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subscription Tier
                </label>
                <select
                  value={formData.subscriptionTier}
                  onChange={(e) => handleInputChange('subscriptionTier', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="basic">Basic</option>
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trial Period (days)
                  </label>
                  <input
                    type="number"
                    value={formData.trialDays}
                    onChange={(e) => handleInputChange('trialDays', parseInt(e.target.value))}
                    min="0"
                    max="90"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Users
                  </label>
                  <input
                    type="number"
                    value={formData.maxUsers}
                    onChange={(e) => handleInputChange('maxUsers', parseInt(e.target.value))}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enabled Features
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {DEFAULT_FEATURES.map((feature) => (
                    <label key={feature} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.enabledFeatures.includes(feature)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleInputChange('enabledFeatures', [
                              ...formData.enabledFeatures,
                              feature
                            ]);
                          } else {
                            handleInputChange(
                              'enabledFeatures',
                              formData.enabledFeatures.filter((f) => f !== feature)
                            );
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700 capitalize">
                        {feature.replace(/-/g, ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Contact Information */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Contact Information</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.contactName}
                    onChange={(e) => handleInputChange('contactName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  placeholder="contact@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          )}

          {/* Step 5: Branding */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Branding (Optional)</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
                <input
                  type="url"
                  value={formData.logoUrl}
                  onChange={(e) => handleInputChange('logoUrl', e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.primaryColor}
                      onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secondary Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={formData.secondaryColor}
                      onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.secondaryColor}
                      onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Preview</h3>
                <div className="flex items-center space-x-3">
                  {formData.logoUrl && (
                    <img
                      src={formData.logoUrl}
                      alt="Logo preview"
                      className="w-12 h-12 object-contain"
                    />
                  )}
                  <div>
                    <div
                      className="px-4 py-2 rounded"
                      style={{ backgroundColor: formData.primaryColor, color: 'white' }}
                    >
                      Primary Color
                    </div>
                    <div
                      className="px-4 py-2 rounded mt-2"
                      style={{ backgroundColor: formData.secondaryColor, color: 'white' }}
                    >
                      Secondary Color
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              disabled={currentStep === 1}
              className="flex items-center px-6 py-2 border border-gray-300 rounded-lg text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <BackIcon className="w-5 h-5 mr-2" />
              Back
            </button>

            {currentStep < 5 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!validateStep(currentStep)}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
              >
                Next
                <NextIcon className="w-5 h-5 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleProvision}
                disabled={!validateStep(5) || provisioning}
                className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700"
              >
                {provisioning ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Provisioning...
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-5 h-5 mr-2" />
                    Provision Tenant
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <VersionFooter className="mt-12" />
    </div>
  );
}

export default TenantProvisioning;
