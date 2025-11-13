import React, { useState, useEffect } from 'react';
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  Download,
  Trash2,
  FileText,
  CheckCircle,
  AlertTriangle,
  User,
  Database,
  Clock,
  Globe,
  Phone,
  Mail,
  Settings,
  X
} from 'lucide-react';

interface ConsentPreferences {
  dataCollection: boolean;
  analytics: boolean;
  marketing: boolean;
  thirdPartySharing: boolean;
  profileCreation: boolean;
  locationTracking: boolean;
}

interface UserDataInfo {
  category: string;
  description: string;
  purpose: string;
  retention: string;
  sharing: string;
  canDelete: boolean;
}

export default function DPDPCompliance() {
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'consent' | 'data' | 'rights' | 'contact'>('overview');
  const [consentPreferences, setConsentPreferences] = useState<ConsentPreferences>({
    dataCollection: false,
    analytics: false,
    marketing: false,
    thirdPartySharing: false,
    profileCreation: false,
    locationTracking: false
  });
  const [hasGivenConsent, setHasGivenConsent] = useState(false);
  const [showDataDetails, setShowDataDetails] = useState(false);

  // Check if user has previously given consent
  useEffect(() => {
    const savedConsent = localStorage.getItem('dpdp_consent');
    const savedPreferences = localStorage.getItem('dpdp_preferences');
    
    if (savedConsent) {
      setHasGivenConsent(JSON.parse(savedConsent));
    }
    if (savedPreferences) {
      setConsentPreferences(JSON.parse(savedPreferences));
    }
  }, []);

  const dataCategories: UserDataInfo[] = [
    {
      category: 'Personal Information',
      description: 'Name, email, phone number, location',
      purpose: 'Account creation, communication, service delivery',
      retention: '5 years after account deletion',
      sharing: 'Not shared with third parties without consent',
      canDelete: true
    },
    {
      category: 'Voting Preferences',
      description: 'Political opinions, candidate preferences, issue priorities',
      purpose: 'Sentiment analysis, campaign insights, demographic research',
      retention: 'Until election completion + 2 years',
      sharing: 'Aggregated data only, no individual identification',
      canDelete: true
    },
    {
      category: 'Usage Analytics',
      description: 'Page views, clicks, session duration, device information',
      purpose: 'Platform improvement, user experience optimization',
      retention: '2 years from collection',
      sharing: 'Aggregated analytics with research partners',
      canDelete: true
    },
    {
      category: 'Location Data',
      description: 'Constituency, ward, approximate location',
      purpose: 'Regional sentiment analysis, local campaign targeting',
      retention: '3 years from collection',
      sharing: 'Aggregated regional data only',
      canDelete: true
    },
    {
      category: 'Communication Records',
      description: 'Feedback, complaints, survey responses',
      purpose: 'Service improvement, issue resolution, policy research',
      retention: '7 years for legal compliance',
      sharing: 'Anonymous excerpts in research reports',
      canDelete: false // Legal requirement
    }
  ];

  const userRights = [
    {
      icon: Eye,
      title: 'Right to Know',
      description: 'You have the right to know what personal data we collect and how we use it.'
    },
    {
      icon: Download,
      title: 'Right to Access',
      description: 'Request a copy of all personal data we have about you in a portable format.'
    },
    {
      icon: Settings,
      title: 'Right to Correct',
      description: 'Request corrections to any inaccurate or incomplete personal data.'
    },
    {
      icon: Trash2,
      title: 'Right to Delete',
      description: 'Request deletion of your personal data (subject to legal retention requirements).'
    },
    {
      icon: Lock,
      title: 'Right to Restrict',
      description: 'Limit how we process your personal data in certain circumstances.'
    },
    {
      icon: AlertTriangle,
      title: 'Right to Object',
      description: 'Object to processing of your data for direct marketing or legitimate interests.'
    }
  ];

  const handleConsentChange = (key: keyof ConsentPreferences, value: boolean) => {
    const newPreferences = { ...consentPreferences, [key]: value };
    setConsentPreferences(newPreferences);
    localStorage.setItem('dpdp_preferences', JSON.stringify(newPreferences));
  };

  const handleConsentSubmit = () => {
    setHasGivenConsent(true);
    localStorage.setItem('dpdp_consent', JSON.stringify(true));
    localStorage.setItem('dpdp_consent_date', new Date().toISOString());
    setShowConsentModal(false);
  };

  const handleWithdrawConsent = () => {
    setHasGivenConsent(false);
    setConsentPreferences({
      dataCollection: false,
      analytics: false,
      marketing: false,
      thirdPartySharing: false,
      profileCreation: false,
      locationTracking: false
    });
    localStorage.removeItem('dpdp_consent');
    localStorage.removeItem('dpdp_preferences');
    localStorage.removeItem('dpdp_consent_date');
  };

  const downloadPersonalData = () => {
    // Simulate data export
    const userData = {
      personalInfo: {
        name: 'User Name',
        email: 'user@example.com',
        location: 'Thiruvananthapuram, Tamil Nadu',
        joinDate: '2024-08-01'
      },
      preferences: consentPreferences,
      activityData: {
        lastLogin: new Date().toISOString(),
        totalSessions: 42,
        feedbackSubmitted: 3,
        issuesReported: 1
      }
    };
    
    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pulse-of-people-personal-data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <Shield className="mr-2 h-6 w-6 text-green-600" />
            DPDP Compliance & Privacy Center
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Your data protection rights under India's Digital Personal Data Protection Act, 2023
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            hasGivenConsent ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {hasGivenConsent ? 'Consent Given' : 'Consent Required'}
          </div>
          <button
            onClick={() => setShowConsentModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            Manage Consent
          </button>
        </div>
      </div>

      {/* Consent Warning Banner */}
      {!hasGivenConsent && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
            <div className="flex-1">
              <h4 className="font-medium text-yellow-800">Consent Required</h4>
              <p className="text-sm text-yellow-700 mt-1">
                To use Pulse of People platform, you must provide consent for data collection and processing. 
                This is required under DPDP Act, 2023.
              </p>
              <button
                onClick={() => setShowConsentModal(true)}
                className="mt-2 px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 transition-colors"
              >
                Provide Consent
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'overview', label: 'Privacy Overview', icon: Shield },
              { key: 'consent', label: 'Consent Management', icon: CheckCircle },
              { key: 'data', label: 'Your Data', icon: Database },
              { key: 'rights', label: 'Your Rights', icon: User },
              { key: 'contact', label: 'Privacy Contact', icon: Phone }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === key
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="mr-1 h-4 w-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Privacy Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <Shield className="h-6 w-6 text-green-600 mr-2" />
                <h4 className="font-semibold text-green-800">DPDP Compliant</h4>
              </div>
              <p className="text-sm text-green-700">
                Full compliance with India's Digital Personal Data Protection Act, 2023
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <Lock className="h-6 w-6 text-blue-600 mr-2" />
                <h4 className="font-semibold text-blue-800">Secure Processing</h4>
              </div>
              <p className="text-sm text-blue-700">
                AES-256 encryption and privacy-first architecture
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <Globe className="h-6 w-6 text-purple-600 mr-2" />
                <h4 className="font-semibold text-purple-800">Cross-Border</h4>
              </div>
              <p className="text-sm text-purple-700">
                International data transfer safeguards in place
              </p>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-4">How We Protect Your Privacy</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-1 mr-3" />
                  <div>
                    <span className="font-medium text-gray-900">Data Minimization</span>
                    <p className="text-sm text-gray-600">We collect only necessary data for platform functionality</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-1 mr-3" />
                  <div>
                    <span className="font-medium text-gray-900">Purpose Limitation</span>
                    <p className="text-sm text-gray-600">Data used only for stated purposes with your consent</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-1 mr-3" />
                  <div>
                    <span className="font-medium text-gray-900">Storage Limitation</span>
                    <p className="text-sm text-gray-600">Data retained only as long as necessary</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-1 mr-3" />
                  <div>
                    <span className="font-medium text-gray-900">Accuracy Assurance</span>
                    <p className="text-sm text-gray-600">Regular data validation and correction processes</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-1 mr-3" />
                  <div>
                    <span className="font-medium text-gray-900">Security Measures</span>
                    <p className="text-sm text-gray-600">Technical and organizational security safeguards</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-1 mr-3" />
                  <div>
                    <span className="font-medium text-gray-900">Breach Notification</span>
                    <p className="text-sm text-gray-600">Prompt notification in case of data breaches</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Consent Management */}
      {activeTab === 'consent' && (
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Your Consent Preferences</h4>
            <p className="text-sm text-blue-700">
              You can manage your data processing consent at any time. Changes take effect immediately.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { key: 'dataCollection', label: 'Essential Data Collection', description: 'Required for platform functionality and account management', required: true },
              { key: 'analytics', label: 'Usage Analytics', description: 'Help us improve the platform through anonymous usage statistics' },
              { key: 'marketing', label: 'Marketing Communications', description: 'Receive updates about new features and political insights' },
              { key: 'thirdPartySharing', label: 'Research Data Sharing', description: 'Anonymous data sharing with academic and research institutions' },
              { key: 'profileCreation', label: 'Voter Profile Creation', description: 'Create detailed voter profiles for personalized insights' },
              { key: 'locationTracking', label: 'Location-based Services', description: 'Provide location-specific political information and alerts' }
            ].map((item) => (
              <div key={item.key} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h5 className="font-medium text-gray-900">{item.label}</h5>
                    {item.required && (
                      <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 text-xs rounded">Required</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
                <div className="ml-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consentPreferences[item.key as keyof ConsentPreferences]}
                      onChange={(e) => handleConsentChange(item.key as keyof ConsentPreferences, e.target.checked)}
                      disabled={item.required}
                      className="sr-only"
                    />
                    <div className={`w-11 h-6 rounded-full ${
                      consentPreferences[item.key as keyof ConsentPreferences] ? 'bg-blue-600' : 'bg-gray-300'
                    } ${item.required ? 'opacity-50' : ''}`}>
                      <div className={`w-4 h-4 bg-white rounded-full mt-1 transition-transform ${
                        consentPreferences[item.key as keyof ConsentPreferences] ? 'translate-x-6' : 'translate-x-1'
                      }`}></div>
                    </div>
                  </label>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-600">
                Last updated: {localStorage.getItem('dpdp_consent_date') ? 
                  new Date(localStorage.getItem('dpdp_consent_date')!).toLocaleDateString() : 'Not set'}
              </p>
            </div>
            <div className="space-x-3">
              {hasGivenConsent && (
                <button
                  onClick={handleWithdrawConsent}
                  className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition-colors"
                >
                  Withdraw All Consent
                </button>
              )}
              <button
                onClick={() => {
                  localStorage.setItem('dpdp_preferences', JSON.stringify(consentPreferences));
                  alert('Consent preferences updated successfully!');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Your Data */}
      {activeTab === 'data' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold text-gray-900">Data We Collect About You</h4>
            <button
              onClick={downloadPersonalData}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center text-sm"
            >
              <Download className="mr-1 h-4 w-4" />
              Download My Data
            </button>
          </div>

          <div className="space-y-4">
            {dataCategories.map((category, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <h5 className="font-medium text-gray-900">{category.category}</h5>
                  <div className="flex items-center space-x-2">
                    {category.canDelete ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Can Delete</span>
                    ) : (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">Legal Retention</span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <strong>Description:</strong> {category.description}
                  </div>
                  <div>
                    <strong>Purpose:</strong> {category.purpose}
                  </div>
                  <div>
                    <strong>Retention:</strong> {category.retention}
                  </div>
                  <div>
                    <strong>Sharing:</strong> {category.sharing}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Your Rights */}
      {activeTab === 'rights' && (
        <div className="space-y-6">
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-900 mb-2">Your Data Protection Rights</h4>
            <p className="text-sm text-purple-700">
              Under the Digital Personal Data Protection Act, 2023, you have specific rights regarding your personal data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userRights.map((right, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start mb-3">
                  <right.icon className="h-6 w-6 text-blue-600 mr-3 mt-1" />
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">{right.title}</h5>
                    <p className="text-sm text-gray-600">{right.description}</p>
                  </div>
                </div>
                <button className="mt-3 px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors">
                  Exercise Right
                </button>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h5 className="font-medium text-gray-900 mb-2">How to Exercise Your Rights</h5>
            <p className="text-sm text-gray-600 mb-3">
              To exercise any of these rights, please contact our Data Protection Officer using the contact information in the Privacy Contact section.
              We will respond to your request within 30 days as required by law.
            </p>
            <div className="flex space-x-3">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm">
                Contact DPO
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm">
                File Complaint
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Contact */}
      {activeTab === 'contact' && (
        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-4">Data Protection Officer (DPO)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-medium text-gray-900 mb-3">Contact Information</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-500 mr-2" />
                    <span>dpo@pulseofpeople.com</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-gray-500 mr-2" />
                    <span>+971-4-XXX-XXXX (Dubai)</span>
                  </div>
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 text-gray-500 mr-2" />
                    <span>Animal-i Initiative, Dubai, UAE</span>
                  </div>
                </div>
              </div>
              <div>
                <h5 className="font-medium text-gray-900 mb-3">Response Times</h5>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>• Privacy inquiries: 2-3 business days</div>
                  <div>• Data requests: Up to 30 days</div>
                  <div>• Breach notifications: Within 72 hours</div>
                  <div>• Complaint resolution: 30-45 days</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h5 className="font-medium text-blue-900 mb-2">Regulatory Authority</h5>
            <p className="text-sm text-blue-700 mb-3">
              If you're not satisfied with our response, you can lodge a complaint with the Data Protection Board of India.
            </p>
            <div className="space-y-1 text-sm text-blue-700">
              <div>Data Protection Board of India</div>
              <div>Email: grievance@dpb.gov.in</div>
              <div>Website: www.dpb.gov.in</div>
            </div>
          </div>
        </div>
      )}

      {/* Consent Modal */}
      {showConsentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold">Data Processing Consent</h4>
              <button
                onClick={() => setShowConsentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-6">
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h5 className="font-medium text-blue-900 mb-2">DPDP Act Compliance Notice</h5>
                <p className="text-sm text-blue-700">
                  Under India's Digital Personal Data Protection Act, 2023, we need your explicit consent to collect and process your personal data for the Pulse of People platform.
                </p>
              </div>
              
              <div className="space-y-3">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={consentPreferences.dataCollection}
                    onChange={(e) => handleConsentChange('dataCollection', e.target.checked)}
                    className="mt-1 mr-3"
                  />
                  <div className="text-sm">
                    <strong>I consent to essential data collection</strong> for platform functionality, account management, and service delivery. (Required)
                  </div>
                </label>
                
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={consentPreferences.analytics}
                    onChange={(e) => handleConsentChange('analytics', e.target.checked)}
                    className="mt-1 mr-3"
                  />
                  <div className="text-sm">
                    I consent to usage analytics to help improve the platform through anonymous statistics.
                  </div>
                </label>
                
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={consentPreferences.profileCreation}
                    onChange={(e) => handleConsentChange('profileCreation', e.target.checked)}
                    className="mt-1 mr-3"
                  />
                  <div className="text-sm">
                    I consent to voter profile creation for personalized political insights and campaign analysis.
                  </div>
                </label>
              </div>
            </div>

            <div className="text-xs text-gray-500 mb-4">
              By providing consent, you acknowledge that you have read and understood our Privacy Policy and agree to data processing as described. You can withdraw consent at any time.
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConsentModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConsentSubmit}
                disabled={!consentPreferences.dataCollection}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Give Consent
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}