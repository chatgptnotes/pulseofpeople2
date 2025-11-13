import { useState } from 'react';
import { 
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  Upload,
  Plus,
  X,
  FileText,
  Clock,
  Send
} from 'lucide-react';
// import { useAuth } from '../contexts/AuthContext';

interface SentimentEntry {
  id: string;
  type: 'positive' | 'negative';
  quote: string;
  location: string;
  source: string;
  verified: boolean;
}

interface SubmissionData {
  submissionType: 'daily' | 'weekly' | 'monthly';
  workerRole: 'ward-coordinator' | 'social-media' | 'survey-team' | 'truth-team';
  location: {
    ward: string;
    area: string;
    coordinates?: string;
  };
  sentimentEntries: SentimentEntry[];
  viralContent: {
    description: string;
    link: string;
    platform: string;
    reach?: number;
  }[];
  issues: {
    description: string;
    severity: 'low' | 'medium' | 'high';
    location: string;
    category: string;
  }[];
  additionalNotes: string;
  verifiedBy: string;
  attachments: File[];
}

export default function DataSubmission() {
  // const { user } = useAuth();
  const [formData, setFormData] = useState<SubmissionData>({
    submissionType: 'daily',
    workerRole: 'ward-coordinator',
    location: {
      ward: '',
      area: '',
      coordinates: ''
    },
    sentimentEntries: [],
    viralContent: [],
    issues: [],
    additionalNotes: '',
    verifiedBy: '',
    attachments: []
  });
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = [
    { id: 1, title: 'Basic Info', icon: FileText },
    { id: 2, title: 'Sentiment Data', icon: MessageSquare },
    { id: 3, title: 'Issues & Content', icon: AlertTriangle },
    { id: 4, title: 'Verification', icon: CheckCircle },
    { id: 5, title: 'Review & Submit', icon: Send }
  ];

  const addSentimentEntry = () => {
    const newEntry: SentimentEntry = {
      id: Date.now().toString(),
      type: 'positive',
      quote: '',
      location: '',
      source: '',
      verified: false
    };
    setFormData(prev => ({
      ...prev,
      sentimentEntries: [...prev.sentimentEntries, newEntry]
    }));
  };

  const updateSentimentEntry = (id: string, field: keyof SentimentEntry, value: any) => {
    setFormData(prev => ({
      ...prev,
      sentimentEntries: prev.sentimentEntries.map(entry =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    }));
  };

  const removeSentimentEntry = (id: string) => {
    setFormData(prev => ({
      ...prev,
      sentimentEntries: prev.sentimentEntries.filter(entry => entry.id !== id)
    }));
  };

  const addViralContent = () => {
    setFormData(prev => ({
      ...prev,
      viralContent: [...prev.viralContent, {
        description: '',
        link: '',
        platform: '',
        reach: undefined
      }]
    }));
  };

  const addIssue = () => {
    setFormData(prev => ({
      ...prev,
      issues: [...prev.issues, {
        description: '',
        severity: 'medium',
        location: '',
        category: ''
      }]
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate API submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Reset form or show success message
    alert('Data submitted successfully!');
    setIsSubmitting(false);
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (step === 1) {
      if (!formData.location.ward) newErrors.ward = 'Ward is required';
      if (!formData.location.area) newErrors.area = 'Area is required';
    }
    
    if (step === 2) {
      if (formData.sentimentEntries.length === 0) {
        newErrors.sentimentEntries = 'At least one sentiment entry is required';
      }
    }
    
    if (step === 4) {
      if (!formData.verifiedBy) newErrors.verifiedBy = 'Verification by another team member is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Submission</h1>
          <p className="text-gray-600">Submit ground intelligence data to Animal-I dashboard</p>
        </div>
        <div className="text-sm text-gray-500">
          <Clock className="w-4 h-4 inline mr-1" />
          Step {currentStep} of {steps.length}
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep >= step.id 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                <step.icon className="w-5 h-5" />
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${
                  currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {step.title}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-1 mx-4 ${
                  currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="space-y-6">
          
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Submission Type
                  </label>
                  <select
                    value={formData.submissionType}
                    onChange={(e) => setFormData(prev => ({ ...prev, submissionType: e.target.value as any }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="daily">Daily Report</option>
                    <option value="weekly">Weekly Summary</option>
                    <option value="monthly">Monthly Analysis</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Role
                  </label>
                  <select
                    value={formData.workerRole}
                    onChange={(e) => setFormData(prev => ({ ...prev, workerRole: e.target.value as any }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ward-coordinator">Ward Coordinator</option>
                    <option value="social-media">Social Media Volunteer</option>
                    <option value="survey-team">Survey Team Member</option>
                    <option value="truth-team">Truth Team Member</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ward *
                  </label>
                  <input
                    type="text"
                    value={formData.location.ward}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      location: { ...prev.location, ward: e.target.value }
                    }))}
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 ${
                      errors.ward ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter ward number or name"
                  />
                  {errors.ward && <p className="text-red-600 text-sm mt-1">{errors.ward}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Area/Locality *
                  </label>
                  <input
                    type="text"
                    value={formData.location.area}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      location: { ...prev.location, area: e.target.value }
                    }))}
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 ${
                      errors.area ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter specific area or locality"
                  />
                  {errors.area && <p className="text-red-600 text-sm mt-1">{errors.area}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GPS Coordinates (Optional)
                </label>
                <input
                  type="text"
                  value={formData.location.coordinates}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    location: { ...prev.location, coordinates: e.target.value }
                  }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  placeholder="Latitude, Longitude (e.g., 12.9716, 77.5946)"
                />
              </div>
            </div>
          )}

          {/* Step 2: Sentiment Data */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Sentiment Entries</h2>
                <button
                  onClick={addSentimentEntry}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Entry
                </button>
              </div>

              {errors.sentimentEntries && (
                <p className="text-red-600 text-sm">{errors.sentimentEntries}</p>
              )}

              <div className="space-y-4">
                {formData.sentimentEntries.map((entry, index) => (
                  <div key={entry.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-gray-900">Entry #{index + 1}</h3>
                      <button
                        onClick={() => removeSentimentEntry(entry.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sentiment Type
                        </label>
                        <select
                          value={entry.type}
                          onChange={(e) => updateSentimentEntry(entry.id, 'type', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="positive">Positive</option>
                          <option value="negative">Negative</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Location
                        </label>
                        <input
                          type="text"
                          value={entry.location}
                          onChange={(e) => updateSentimentEntry(entry.id, 'location', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                          placeholder="Specific location where heard"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quote/Reaction
                        </label>
                        <textarea
                          value={entry.quote}
                          onChange={(e) => updateSentimentEntry(entry.id, 'quote', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                          rows={3}
                          placeholder="Exact quote or description of voter reaction"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Source
                        </label>
                        <input
                          type="text"
                          value={entry.source}
                          onChange={(e) => updateSentimentEntry(entry.id, 'source', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                          placeholder="Source of information"
                        />
                      </div>

                      <div className="flex items-center">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={entry.verified}
                            onChange={(e) => updateSentimentEntry(entry.id, 'verified', e.target.checked)}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">Verified by second source</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {formData.sentimentEntries.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No sentiment entries added yet</p>
                  <button
                    onClick={addSentimentEntry}
                    className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Add your first entry
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Issues & Content */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Viral Content</h2>
                  <button
                    onClick={addViralContent}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Content
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.viralContent.map((content, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Platform
                          </label>
                          <select
                            value={content.platform}
                            onChange={(e) => {
                              const newContent = [...formData.viralContent];
                              newContent[index].platform = e.target.value;
                              setFormData(prev => ({ ...prev, viralContent: newContent }));
                            }}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select platform</option>
                            <option value="facebook">Facebook</option>
                            <option value="twitter">Twitter</option>
                            <option value="instagram">Instagram</option>
                            <option value="whatsapp">WhatsApp</option>
                            <option value="youtube">YouTube</option>
                            <option value="other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Link/URL
                          </label>
                          <input
                            type="text"
                            value={content.link}
                            onChange={(e) => {
                              const newContent = [...formData.viralContent];
                              newContent[index].link = e.target.value;
                              setFormData(prev => ({ ...prev, viralContent: newContent }));
                            }}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                            placeholder="Content URL or link"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                          </label>
                          <textarea
                            value={content.description}
                            onChange={(e) => {
                              const newContent = [...formData.viralContent];
                              newContent[index].description = e.target.value;
                              setFormData(prev => ({ ...prev, viralContent: newContent }));
                            }}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            placeholder="Describe the viral content and its impact"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Emerging Issues</h2>
                  <button
                    onClick={addIssue}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Issue
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.issues.map((issue, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Severity
                          </label>
                          <select
                            value={issue.severity}
                            onChange={(e) => {
                              const newIssues = [...formData.issues];
                              newIssues[index].severity = e.target.value as any;
                              setFormData(prev => ({ ...prev, issues: newIssues }));
                            }}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category
                          </label>
                          <select
                            value={issue.category}
                            onChange={(e) => {
                              const newIssues = [...formData.issues];
                              newIssues[index].category = e.target.value;
                              setFormData(prev => ({ ...prev, issues: newIssues }));
                            }}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select category</option>
                            <option value="infrastructure">Infrastructure</option>
                            <option value="healthcare">Healthcare</option>
                            <option value="education">Education</option>
                            <option value="employment">Employment</option>
                            <option value="security">Security</option>
                            <option value="other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Location
                          </label>
                          <input
                            type="text"
                            value={issue.location}
                            onChange={(e) => {
                              const newIssues = [...formData.issues];
                              newIssues[index].location = e.target.value;
                              setFormData(prev => ({ ...prev, issues: newIssues }));
                            }}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                            placeholder="Specific location"
                          />
                        </div>

                        <div className="md:col-span-3">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Issue Description
                          </label>
                          <textarea
                            value={issue.description}
                            onChange={(e) => {
                              const newIssues = [...formData.issues];
                              newIssues[index].description = e.target.value;
                              setFormData(prev => ({ ...prev, issues: newIssues }));
                            }}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            placeholder="Detailed description of the emerging issue"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Verification */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Verification & Quality Control</h2>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                  <h4 className="font-semibold text-yellow-900">Verification Required</h4>
                </div>
                <p className="text-yellow-800 text-sm">
                  All data must be verified by at least one other team member before submission.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verified By (Name of Team Member) *
                </label>
                <input
                  type="text"
                  value={formData.verifiedBy}
                  onChange={(e) => setFormData(prev => ({ ...prev, verifiedBy: e.target.value }))}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 ${
                    errors.verifiedBy ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter name of team member who verified this data"
                />
                {errors.verifiedBy && <p className="text-red-600 text-sm mt-1">{errors.verifiedBy}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={formData.additionalNotes}
                  onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Any additional context, observations, or notes about this submission"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attachments (Photos, Documents, Audio)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">Click to upload files or drag and drop</p>
                  <p className="text-sm text-gray-400">Images, PDFs, Audio files up to 10MB each</p>
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,audio/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) {
                        setFormData(prev => ({
                          ...prev,
                          attachments: Array.from(e.target.files || [])
                        }));
                      }
                    }}
                  />
                </div>
                {formData.attachments.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">
                      {formData.attachments.length} file(s) selected
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Review & Submit */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Review & Submit</h2>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Submission Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Type:</span>
                    <span className="ml-2 text-gray-900 capitalize">{formData.submissionType}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Role:</span>
                    <span className="ml-2 text-gray-900 capitalize">{formData.workerRole.replace('-', ' ')}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Location:</span>
                    <span className="ml-2 text-gray-900">{formData.location.ward}, {formData.location.area}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Verified by:</span>
                    <span className="ml-2 text-gray-900">{formData.verifiedBy}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Sentiment Entries:</span>
                    <span className="ml-2 text-gray-900">{formData.sentimentEntries.length}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Issues Reported:</span>
                    <span className="ml-2 text-gray-900">{formData.issues.length}</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
                  <h4 className="font-semibold text-blue-900">Ready to Submit</h4>
                </div>
                <p className="text-blue-800 text-sm">
                  Your data will be processed and integrated into the Animal-I dashboard. 
                  You'll receive a confirmation once the submission is complete.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t border-gray-200">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {currentStep < 5 ? (
            <button
              onClick={nextStep}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Data
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}