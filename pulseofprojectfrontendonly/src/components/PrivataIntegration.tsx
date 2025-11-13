import React, { useState, useEffect } from 'react';
import {
  Shield,
  Lock,
  Zap,
  Eye,
  EyeOff,
  Upload,
  Download,
  CheckCircle,
  AlertTriangle,
  Cpu,
  HardDrive,
  Wifi,
  WifiOff,
  User,
  FileText,
  MessageSquare,
  BarChart3,
  Globe,
  Smartphone,
  Server,
  Key
} from 'lucide-react';

interface PrivataConnection {
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  lastSync: Date | null;
  encryptionLevel: 'AES-256' | 'AES-128';
  localProcessing: boolean;
  dataResidency: 'device' | 'edge' | 'cloud';
}

interface DataSubmission {
  id: string;
  type: 'survey_response' | 'feedback' | 'sentiment' | 'preference';
  timestamp: Date;
  status: 'pending' | 'processed' | 'encrypted' | 'submitted';
  size: number;
  locallyProcessed: boolean;
}

export default function PrivataIntegration() {
  const [activeTab, setActiveTab] = useState<'overview' | 'submit' | 'security' | 'settings'>('overview');
  const [privataConnection, setPrivataConnection] = useState<PrivataConnection>({
    status: 'disconnected',
    lastSync: null,
    encryptionLevel: 'AES-256',
    localProcessing: true,
    dataResidency: 'device'
  });
  const [submissions, setSubmissions] = useState<DataSubmission[]>([]);
  const [isProcessingLocally, setIsProcessingLocally] = useState(true);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);

  // Mock Privata.site connection
  useEffect(() => {
    // Simulate connection establishment
    const timer = setTimeout(() => {
      setPrivataConnection(prev => ({
        ...prev,
        status: 'connected',
        lastSync: new Date()
      }));
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Mock data submissions
  useEffect(() => {
    const mockSubmissions: DataSubmission[] = [
      {
        id: '1',
        type: 'survey_response',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'processed',
        size: 2048,
        locallyProcessed: true
      },
      {
        id: '2',
        type: 'sentiment',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        status: 'encrypted',
        size: 1024,
        locallyProcessed: true
      },
      {
        id: '3',
        type: 'feedback',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        status: 'submitted',
        size: 3072,
        locallyProcessed: true
      }
    ];
    setSubmissions(mockSubmissions);
  }, []);

  const handleConnect = () => {
    setPrivataConnection(prev => ({ ...prev, status: 'connecting' }));
    setTimeout(() => {
      setPrivataConnection(prev => ({
        ...prev,
        status: 'connected',
        lastSync: new Date()
      }));
    }, 3000);
  };

  const handleDisconnect = () => {
    setPrivataConnection(prev => ({
      ...prev,
      status: 'disconnected',
      lastSync: null
    }));
  };

  const handleSubmitData = (formData: any) => {
    const newSubmission: DataSubmission = {
      id: Date.now().toString(),
      type: formData.type,
      timestamp: new Date(),
      status: 'pending',
      size: Math.floor(Math.random() * 4096) + 512,
      locallyProcessed: isProcessingLocally
    };

    setSubmissions(prev => [newSubmission, ...prev]);
    
    // Simulate processing pipeline
    setTimeout(() => {
      setSubmissions(prev => prev.map(sub => 
        sub.id === newSubmission.id ? { ...sub, status: 'processed' } : sub
      ));
    }, 2000);

    setTimeout(() => {
      setSubmissions(prev => prev.map(sub => 
        sub.id === newSubmission.id ? { ...sub, status: 'encrypted' } : sub
      ));
    }, 4000);

    setTimeout(() => {
      setSubmissions(prev => prev.map(sub => 
        sub.id === newSubmission.id ? { ...sub, status: 'submitted' } : sub
      ));
    }, 6000);

    setShowSubmissionForm(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-100';
      case 'connecting': return 'text-yellow-600 bg-yellow-100';
      case 'disconnected': return 'text-gray-600 bg-gray-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDataStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'text-green-600 bg-green-100';
      case 'encrypted': return 'text-blue-600 bg-blue-100';
      case 'processed': return 'text-purple-600 bg-purple-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'survey_response': return <BarChart3 className="h-4 w-4" />;
      case 'feedback': return <MessageSquare className="h-4 w-4" />;
      case 'sentiment': return <User className="h-4 w-4" />;
      case 'preference': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <Shield className="mr-2 h-6 w-6 text-purple-600" />
            Privata.site Integration
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Privacy-first one-way data input with local AI processing
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(privataConnection.status)}`}>
            {privataConnection.status === 'connecting' && <div className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1"></div>}
            {privataConnection.status.charAt(0).toUpperCase() + privataConnection.status.slice(1)}
          </div>
          {privataConnection.status === 'connected' ? (
            <button
              onClick={handleDisconnect}
              className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition-colors text-sm"
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={handleConnect}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm"
              disabled={privataConnection.status === 'connecting'}
            >
              {privataConnection.status === 'connecting' ? 'Connecting...' : 'Connect to Privata'}
            </button>
          )}
        </div>
      </div>

      {/* Connection Status Banner */}
      {privataConnection.status === 'connected' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
            <div className="flex-1">
              <h4 className="font-medium text-green-800">Securely Connected to Privata</h4>
              <p className="text-sm text-green-700 mt-1">
                Your data is processed locally on your device with AES-256 encryption. 
                Last sync: {privataConnection.lastSync?.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {privataConnection.status === 'disconnected' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-blue-600 mr-3" />
            <div className="flex-1">
              <h4 className="font-medium text-blue-800">Privacy-First Data Submission</h4>
              <p className="text-sm text-blue-700 mt-1">
                Connect to Privata.site to submit data with 100% privacy guarantee. 
                All processing happens on your device, nothing leaves without encryption.
              </p>
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
              { key: 'submit', label: 'Data Submission', icon: Upload },
              { key: 'security', label: 'Security Features', icon: Lock },
              { key: 'settings', label: 'Privacy Settings', icon: Key }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === key
                    ? 'border-purple-500 text-purple-600'
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
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <HardDrive className="h-6 w-6 text-purple-600 mr-2" />
                <h4 className="font-semibold text-purple-800">100% Local Processing</h4>
              </div>
              <p className="text-sm text-purple-700">
                All AI processing happens on your device. No cloud dependencies.
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <Lock className="h-6 w-6 text-blue-600 mr-2" />
                <h4 className="font-semibold text-blue-800">End-to-End Encrypted</h4>
              </div>
              <p className="text-sm text-blue-700">
                AES-256 encryption for all data and communications.
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <Zap className="h-6 w-6 text-green-600 mr-2" />
                <h4 className="font-semibent text-green-800">Lightning Fast</h4>
              </div>
              <p className="text-sm text-green-700">
                Optimized for speed with local processing and minimal latency.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-4">Privata.site Capabilities</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h5 className="font-medium text-gray-900">Data Processing</h5>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Local AI model processing (llama.cpp)
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Sentiment analysis without data sharing
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Real-time text analysis and categorization
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Secure data aggregation and reporting
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h5 className="font-medium text-gray-900">Privacy Features</h5>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Zero data collection by default
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    User-controlled data sharing preferences
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Automatic data anonymization
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Encrypted communication channels
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-3">System Status</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Connection Status</span>
                  <span className={`font-medium ${privataConnection.status === 'connected' ? 'text-green-600' : 'text-red-600'}`}>
                    {privataConnection.status === 'connected' ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Encryption Level</span>
                  <span className="font-medium text-green-600">{privataConnection.encryptionLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span>Data Residency</span>
                  <span className="font-medium text-blue-600 capitalize">{privataConnection.dataResidency}</span>
                </div>
                <div className="flex justify-between">
                  <span>Local Processing</span>
                  <span className={`font-medium ${privataConnection.localProcessing ? 'text-green-600' : 'text-orange-600'}`}>
                    {privataConnection.localProcessing ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-3">Usage Statistics</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Submissions</span>
                  <span className="font-medium">{submissions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Successfully Processed</span>
                  <span className="font-medium text-green-600">{submissions.filter(s => s.status === 'submitted').length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Data Encrypted</span>
                  <span className="font-medium text-blue-600">100%</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Size</span>
                  <span className="font-medium">{Math.round(submissions.reduce((acc, s) => acc + s.size, 0) / submissions.length || 0)} bytes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data Submission */}
      {activeTab === 'submit' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold text-gray-900">Secure Data Submissions</h4>
            <button
              onClick={() => setShowSubmissionForm(true)}
              disabled={privataConnection.status !== 'connected'}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <Upload className="mr-1 h-4 w-4" />
              Submit Data
            </button>
          </div>

          <div className="space-y-3">
            <div className="text-sm text-gray-600 mb-4">
              Recent submissions processed through Privata.site
            </div>
            {submissions.map((submission) => (
              <div key={submission.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(submission.type)}
                      <span className="font-medium text-gray-900 capitalize">
                        {submission.type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${getDataStatusColor(submission.status)}`}>
                      {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                    </div>
                    {submission.locallyProcessed && (
                      <div className="flex items-center text-xs text-green-600">
                        <Cpu className="h-3 w-3 mr-1" />
                        Local AI
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {submission.timestamp.toLocaleTimeString()}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div>Size: {(submission.size / 1024).toFixed(1)} KB</div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Lock className="h-3 w-3 mr-1" />
                      AES-256 Encrypted
                    </div>
                    <div className="flex items-center">
                      <HardDrive className="h-3 w-3 mr-1" />
                      Device Processed
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security Features */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-900 mb-2">Enterprise-Grade Security</h4>
            <p className="text-sm text-purple-700">
              Privata.site implements military-grade security measures to ensure your data never leaves your device unencrypted.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h5 className="font-medium text-gray-900">Encryption & Protection</h5>
              <div className="space-y-3">
                <div className="flex items-start">
                  <Key className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">AES-256 Encryption</div>
                    <div className="text-sm text-gray-600">Military-grade encryption for all data at rest and in transit</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <Shield className="h-5 w-5 text-green-600 mt-0.5 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">Zero-Trust Architecture</div>
                    <div className="text-sm text-gray-600">Never trust, always verify every data transmission</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <Cpu className="h-5 w-5 text-purple-600 mt-0.5 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">Hardware Security</div>
                    <div className="text-sm text-gray-600">Utilizes device-level security features and secure enclaves</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h5 className="font-medium text-gray-900">Privacy Guarantees</h5>
              <div className="space-y-3">
                <div className="flex items-start">
                  <EyeOff className="h-5 w-5 text-orange-600 mt-0.5 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">No Data Mining</div>
                    <div className="text-sm text-gray-600">Your data is never analyzed or used for profiling</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <WifiOff className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">Offline Capability</div>
                    <div className="text-sm text-gray-600">Core features work without internet connection</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <Server className="h-5 w-5 text-gray-600 mt-0.5 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">No Cloud Dependencies</div>
                    <div className="text-sm text-gray-600">Everything processes locally on your device</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h5 className="font-medium text-gray-900 mb-3">Security Audit Trail</h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Last Security Scan</span>
                <span className="text-green-600">2 minutes ago ✓</span>
              </div>
              <div className="flex justify-between">
                <span>Encryption Status</span>
                <span className="text-green-600">Active (AES-256) ✓</span>
              </div>
              <div className="flex justify-between">
                <span>Data Leakage Check</span>
                <span className="text-green-600">Clean ✓</span>
              </div>
              <div className="flex justify-between">
                <span>Network Isolation</span>
                <span className="text-green-600">Enabled ✓</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Settings */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Privacy Configuration</h4>
            <p className="text-sm text-blue-700">
              Configure how your data is processed and shared through the Privata.site integration.
            </p>
          </div>

          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-gray-900">Local AI Processing</h5>
                  <p className="text-sm text-gray-600">Process all data locally on your device</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isProcessingLocally}
                    onChange={(e) => setIsProcessingLocally(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-11 h-6 rounded-full ${isProcessingLocally ? 'bg-purple-600' : 'bg-gray-300'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full mt-1 transition-transform ${
                      isProcessingLocally ? 'translate-x-6' : 'translate-x-1'
                    }`}></div>
                  </div>
                </label>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-gray-900">Automatic Encryption</h5>
                  <p className="text-sm text-gray-600">Encrypt all data before any processing</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked disabled className="sr-only" />
                  <div className="w-11 h-6 bg-purple-600 rounded-full">
                    <div className="w-4 h-4 bg-white rounded-full mt-1 translate-x-6"></div>
                  </div>
                </label>
              </div>
              <div className="mt-2 text-xs text-gray-500">This setting cannot be disabled for security reasons</div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-gray-900">Data Retention</h5>
                  <p className="text-sm text-gray-600">How long to keep processed data locally</p>
                </div>
                <select className="border border-gray-300 rounded-md px-3 py-1 text-sm">
                  <option>1 hour</option>
                  <option>1 day</option>
                  <option>1 week</option>
                  <option selected>Until manually deleted</option>
                </select>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-gray-900">Network Isolation</h5>
                  <p className="text-sm text-gray-600">Block unnecessary network requests</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked className="sr-only" />
                  <div className="w-11 h-6 bg-green-600 rounded-full">
                    <div className="w-4 h-4 bg-white rounded-full mt-1 translate-x-6"></div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
              Reset to Defaults
            </button>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
              Save Settings
            </button>
          </div>
        </div>
      )}

      {/* Data Submission Modal */}
      {showSubmissionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h4 className="text-lg font-semibold mb-4">Secure Data Submission</h4>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleSubmitData({
                type: formData.get('type'),
                content: formData.get('content')
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Type</label>
                  <select name="type" required className="w-full border border-gray-300 rounded-md px-3 py-2">
                    <option value="">Select Type</option>
                    <option value="survey_response">Survey Response</option>
                    <option value="feedback">Feedback</option>
                    <option value="sentiment">Sentiment Data</option>
                    <option value="preference">Political Preference</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea 
                    name="content" 
                    rows={4} 
                    required 
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Enter your data (will be encrypted automatically)"
                  ></textarea>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="flex items-center text-sm text-green-800">
                    <Lock className="h-4 w-4 mr-2" />
                    This data will be processed locally and encrypted before transmission
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowSubmissionForm(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  Submit Securely
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}