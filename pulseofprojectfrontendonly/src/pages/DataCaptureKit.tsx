import { useState } from 'react';
import { 
  Users, 
  MessageSquare, 
  CheckCircle, 
  Upload, 
  Shield, 
  Phone, 
  Mail,
  Calendar,
  Camera,
  FileText,
  ExternalLink,
  Download,
  Eye
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import WhatsAppBot from '../components/WhatsAppBot';

export default function DataCaptureKit() {
  const [activeSection, setActiveSection] = useState('overview');
  const { user } = useAuth();

  const sections = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'roles', label: 'Roles & Responsibilities', icon: Users },
    { id: 'data-types', label: 'Data Types', icon: FileText },
    { id: 'formats', label: 'Formats & Tools', icon: Upload },
    { id: 'whatsapp-bot', label: 'WhatsApp Bot Demo', icon: MessageSquare },
    { id: 'verification', label: 'Verification Process', icon: CheckCircle },
    { id: 'submission', label: 'Submission Process', icon: MessageSquare },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'support', label: 'Support', icon: Phone }
  ];

  const roles = [
    {
      title: 'Ward Coordinators',
      description: 'Capture daily local sentiment and verify AI-generated insights',
      responsibilities: [
        'Monitor daily voter sentiment in assigned ward',
        'Verify AI-generated insights with ground reality',
        'Report emerging issues and trends',
        'Coordinate with survey teams and volunteers'
      ],
      icon: Users,
      color: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      title: 'Social Media Volunteers',
      description: 'Monitor and forward relevant public posts and comments',
      responsibilities: [
        'Track viral content in constituency',
        'Monitor social media sentiment',
        'Report trending hashtags and discussions',
        'Document opposition narratives'
      ],
      icon: MessageSquare,
      color: 'bg-green-50 text-green-700 border-green-200'
    },
    {
      title: 'Survey Teams',
      description: 'Conduct structured polls and submit digital results',
      responsibilities: [
        'Conduct voter sentiment surveys',
        'Collect demographic data',
        'Document issue priorities',
        'Submit structured poll results'
      ],
      icon: FileText,
      color: 'bg-purple-50 text-purple-700 border-purple-200'
    },
    {
      title: 'Truth Teams',
      description: 'Cross-check dashboard alerts with on-ground feedback',
      responsibilities: [
        'Verify dashboard alerts',
        'Fact-check emerging narratives',
        'Validate AI-generated insights',
        'Report misinformation trends'
      ],
      icon: CheckCircle,
      color: 'bg-orange-50 text-orange-700 border-orange-200'
    }
  ];

  const dataTypes = {
    daily: [
      'Top 3 positive voter reactions (with quotes if possible)',
      'Top 3 negative voter reactions (with quotes if possible)', 
      'Viral posts, images, or videos in constituency (links/screenshots)',
      'New complaints/issues with location and ward details'
    ],
    weekly: [
      'Ward-wise feedback summaries',
      'Opposition activity snapshots',
      'Event turnout numbers with photos',
      'Trending discussion topics'
    ],
    monthly: [
      'Complete survey results',
      'Updated influencer list with stance analysis',
      'Shifts in voter priorities and concerns',
      'Comprehensive sentiment analysis'
    ]
  };

  const formats = [
    {
      type: 'Text Updates',
      method: 'WhatsApp Bot / Google Form',
      description: 'Quick text-based updates for daily sentiment',
      icon: MessageSquare
    },
    {
      type: 'Visual Content',
      method: 'Photo/Video Upload with Geotags',
      description: 'Event photos, viral content, ground evidence',
      icon: Camera
    },
    {
      type: 'Structured Data',
      method: 'CSV/Excel Files',
      description: 'Survey results, voter data, demographic info',
      icon: FileText
    },
    {
      type: 'Audio Reports',
      method: 'Voice Messages (Auto-transcribed)',
      description: 'Field reports, interview clips, public opinions',
      icon: Phone
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Animal-I Party Worker Data Capture Kit
          </h1>
          <p className="text-gray-600">
            Structured ground intelligence collection system for campaign workers
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Download PDF Guide
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
            <ExternalLink className="w-4 h-4 mr-2" />
            Open Data Form
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Guide Sections</h3>
            <nav className="space-y-2">
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors text-left ${
                    activeSection === section.id
                      ? 'bg-blue-100 text-blue-900 border border-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <section.icon className="w-4 h-4 mr-3" />
                  {section.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            
            {activeSection === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Purpose & Overview</h2>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-blue-800">
                      This kit creates a consistent flow of reliable voter sentiment data from the ground to the Animal-I dashboard, 
                      ensuring campaign decisions are based on verified insights, not guesswork.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2">What You'll Achieve</h4>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• Structured data collection workflow</li>
                      <li>• Real-time ground intelligence</li>
                      <li>• Verified sentiment insights</li>
                      <li>• Campaign strategy optimization</li>
                    </ul>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-900 mb-2">Key Benefits</h4>
                    <ul className="text-sm text-yellow-800 space-y-1">
                      <li>• Data-driven decision making</li>
                      <li>• Early issue detection</li>
                      <li>• Coordinated response strategies</li>
                      <li>• Measurable impact tracking</li>
                    </ul>
                  </div>
                </div>

                {user && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Your Role: {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}</h4>
                    <p className="text-sm text-gray-700">
                      As a {user.role || 'user'}, you have access to {user.role === 'admin' ? 'all features and can manage data submissions' :
                      user.role === 'analyst' ? 'analytical tools and can verify data submissions' :
                      'viewing capabilities and can submit data reports'}.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'roles' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Roles in the Data Flow</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {roles.map((role, index) => (
                    <div key={index} className={`border rounded-lg p-6 ${role.color}`}>
                      <div className="flex items-center mb-4">
                        <role.icon className="w-6 h-6 mr-3" />
                        <h3 className="text-lg font-semibold">{role.title}</h3>
                      </div>
                      <p className="text-sm mb-4">{role.description}</p>
                      <div>
                        <h4 className="font-medium mb-2">Key Responsibilities:</h4>
                        <ul className="text-sm space-y-1">
                          {role.responsibilities.map((resp, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>{resp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'data-types' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Information to Capture</h2>
                
                <div className="space-y-6">
                  <div className="border border-green-200 rounded-lg p-6 bg-green-50">
                    <div className="flex items-center mb-4">
                      <Calendar className="w-5 h-5 text-green-600 mr-2" />
                      <h3 className="text-lg font-semibold text-green-900">Daily Collection</h3>
                    </div>
                    <ul className="space-y-2">
                      {dataTypes.daily.map((item, idx) => (
                        <li key={idx} className="flex items-start text-green-800">
                          <CheckCircle className="w-4 h-4 mt-0.5 mr-2 text-green-600" />
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border border-blue-200 rounded-lg p-6 bg-blue-50">
                    <div className="flex items-center mb-4">
                      <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                      <h3 className="text-lg font-semibold text-blue-900">Weekly Collection</h3>
                    </div>
                    <ul className="space-y-2">
                      {dataTypes.weekly.map((item, idx) => (
                        <li key={idx} className="flex items-start text-blue-800">
                          <CheckCircle className="w-4 h-4 mt-0.5 mr-2 text-blue-600" />
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border border-purple-200 rounded-lg p-6 bg-purple-50">
                    <div className="flex items-center mb-4">
                      <Calendar className="w-5 h-5 text-purple-600 mr-2" />
                      <h3 className="text-lg font-semibold text-purple-900">Monthly Collection</h3>
                    </div>
                    <ul className="space-y-2">
                      {dataTypes.monthly.map((item, idx) => (
                        <li key={idx} className="flex items-start text-purple-800">
                          <CheckCircle className="w-4 h-4 mt-0.5 mr-2 text-purple-600" />
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'formats' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Data Formats & Tools</h2>
                <p className="text-gray-600">
                  Use these standardized formats to ensure smooth integration into the dashboard:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {formats.map((format, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
                      <div className="flex items-center mb-3">
                        <format.icon className="w-6 h-6 text-blue-600 mr-3" />
                        <h3 className="text-lg font-semibold text-gray-900">{format.type}</h3>
                      </div>
                      <p className="text-sm text-blue-600 font-medium mb-2">{format.method}</p>
                      <p className="text-sm text-gray-600">{format.description}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-900 mb-2">Important Guidelines:</h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• Include geotags with photo/video uploads when possible</li>
                    <li>• Use CSV or Excel format for structured survey data</li>
                    <li>• Audio clips will be automatically transcribed</li>
                    <li>• Maintain consistent naming conventions for files</li>
                  </ul>
                </div>
              </div>
            )}

            {activeSection === 'whatsapp-bot' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">WhatsApp Bot Integration</h2>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center mb-2">
                    <MessageSquare className="w-5 h-5 text-green-600 mr-2" />
                    <h4 className="font-semibold text-green-900">Quick Data Submission</h4>
                  </div>
                  <p className="text-green-800 text-sm">
                    Use our WhatsApp bot for quick field data submission. Perfect for urgent updates and real-time reporting.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Bot Commands</h3>
                    <div className="space-y-3">
                      <div className="border border-gray-200 rounded-lg p-3">
                        <code className="text-blue-600 font-mono">/daily</code>
                        <p className="text-sm text-gray-600 mt-1">Submit daily sentiment report</p>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-3">
                        <code className="text-blue-600 font-mono">/weekly</code>
                        <p className="text-sm text-gray-600 mt-1">Submit weekly summary</p>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-3">
                        <code className="text-blue-600 font-mono">/survey</code>
                        <p className="text-sm text-gray-600 mt-1">Submit survey results</p>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-3">
                        <code className="text-blue-600 font-mono">/status</code>
                        <p className="text-sm text-gray-600 mt-1">Check submission status</p>
                      </div>
                    </div>

                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-2">How to Use:</h4>
                      <ol className="text-sm text-blue-800 space-y-1">
                        <li>1. Add Animal-I Bot to WhatsApp: +91-XXXXXXXXXX</li>
                        <li>2. Start with /help command to see options</li>
                        <li>3. Use /daily for quick sentiment updates</li>
                        <li>4. Follow bot prompts for structured data entry</li>
                        <li>5. Receive confirmation with submission ID</li>
                      </ol>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Interactive Demo</h3>
                    <WhatsAppBot />
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'verification' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Verification & Quality Control</h2>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center mb-2">
                    <Shield className="w-5 h-5 text-red-600 mr-2" />
                    <h4 className="font-semibold text-red-900">Critical Requirement</h4>
                  </div>
                  <p className="text-red-800 text-sm">
                    All data must be verified by at least one other team member before submission. 
                    Flag any unconfirmed rumors clearly so they are not treated as verified facts.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Verification Process:</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mr-4 mt-1">1</div>
                      <div>
                        <h4 className="font-medium text-gray-900">Initial Collection</h4>
                        <p className="text-sm text-gray-600">Gather information from reliable sources</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mr-4 mt-1">2</div>
                      <div>
                        <h4 className="font-medium text-gray-900">Cross-Verification</h4>
                        <p className="text-sm text-gray-600">Have another team member confirm the information</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mr-4 mt-1">3</div>
                      <div>
                        <h4 className="font-medium text-gray-900">Documentation</h4>
                        <p className="text-sm text-gray-600">Record source, time, location, and verification details</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mr-4 mt-1">4</div>
                      <div>
                        <h4 className="font-medium text-gray-900">Quality Check</h4>
                        <p className="text-sm text-gray-600">Ensure data format compliance and completeness</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'submission' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Submission Process</h2>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4">4-Step Submission Workflow</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-4">1</div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">Collect Information</h4>
                        <p className="text-sm text-gray-600">Use approved formats and tools</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-4">2</div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">Verify Data</h4>
                        <p className="text-sm text-gray-600">Cross-check with fellow worker or ward coordinator</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-4">3</div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">Submit Through Official Channel</h4>
                        <p className="text-sm text-gray-600">WhatsApp bot, Google Form, or Animal-I app</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-4">4</div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">Retain Local Copy</h4>
                        <p className="text-sm text-gray-600">Keep records for your reference and backup</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4 text-center">
                    <MessageSquare className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <h4 className="font-medium text-gray-900">WhatsApp Bot</h4>
                    <p className="text-sm text-gray-600">Quick daily updates</p>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4 text-center">
                    <ExternalLink className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <h4 className="font-medium text-gray-900">Google Form</h4>
                    <p className="text-sm text-gray-600">Structured submissions</p>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4 text-center">
                    <Upload className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <h4 className="font-medium text-gray-900">Animal-I App</h4>
                    <p className="text-sm text-gray-600">Complete data package</p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'privacy' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Data Privacy & Security</h2>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <Shield className="w-6 h-6 text-green-600 mr-3" />
                    <h3 className="text-lg font-semibold text-green-900">Our Commitment</h3>
                  </div>
                  <p className="text-green-800">
                    All collected data is stored securely and used only for campaign analysis purposes. 
                    Personal voter information will be anonymized before analysis to comply with legal and ethical standards.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Data Protection Measures:</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5" />
                        <span>End-to-end encryption for data transmission</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5" />
                        <span>Secure cloud storage with access controls</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5" />
                        <span>Automatic data anonymization</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5" />
                        <span>Regular security audits and updates</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Legal Compliance:</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-blue-600 mr-2 mt-0.5" />
                        <span>Electoral law compliance</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-blue-600 mr-2 mt-0.5" />
                        <span>Data protection regulations</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-blue-600 mr-2 mt-0.5" />
                        <span>Privacy policy adherence</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-blue-600 mr-2 mt-0.5" />
                        <span>Consent management</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'support' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Contact for Support</h2>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4">
                    Animal-I Dashboard Support Team
                  </h3>
                  <p className="text-blue-800 mb-4">
                    For help with submissions, technical issues, or training questions, 
                    contact our dedicated support team:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <div className="flex items-center mb-2">
                        <Mail className="w-5 h-5 text-blue-600 mr-2" />
                        <h4 className="font-medium text-gray-900">Email Support</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">For detailed queries and documentation</p>
                      <a href="mailto:support@bettroi.com" className="text-blue-600 font-medium text-sm">
                        support@bettroi.com
                      </a>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <div className="flex items-center mb-2">
                        <Phone className="w-5 h-5 text-blue-600 mr-2" />
                        <h4 className="font-medium text-gray-900">Phone Support</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">For urgent technical assistance</p>
                      <a href="tel:+91XXXXXXXXXX" className="text-blue-600 font-medium text-sm">
                        +91-XXXXXXXXXX
                      </a>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Quick Help Resources:</h4>
                  <div className="space-y-2">
                    <a href="#" className="flex items-center text-blue-600 hover:text-blue-700 text-sm">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Video Training Tutorials
                    </a>
                    <a href="#" className="flex items-center text-blue-600 hover:text-blue-700 text-sm">
                      <Download className="w-4 h-4 mr-2" />
                      Downloadable Quick Reference Card
                    </a>
                    <a href="#" className="flex items-center text-blue-600 hover:text-blue-700 text-sm">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      WhatsApp Support Group
                    </a>
                    <a href="#" className="flex items-center text-blue-600 hover:text-blue-700 text-sm">
                      <FileText className="w-4 h-4 mr-2" />
                      Frequently Asked Questions
                    </a>
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