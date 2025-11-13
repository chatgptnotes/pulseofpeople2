import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Users,
  MessageSquare,
  Calendar,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Phone,
  Mail,
  Globe,
  Camera,
  FileText,
  Send,
  Heart,
  Star,
  Clock,
  Filter,
  Plus,
  Share2,
  Download,
  Flag,
  Building,
  Zap,
  Shield,
  Target
} from 'lucide-react';

interface Issue {
  id: string;
  title: string;
  description: string;
  category: 'infrastructure' | 'healthcare' | 'education' | 'employment' | 'environment' | 'safety' | 'utilities' | 'transport';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'reported' | 'acknowledged' | 'in_progress' | 'resolved' | 'closed';
  location: string;
  coordinates?: { lat: number; lng: number };
  reportedBy: string;
  reportedAt: Date;
  supporters: number;
  comments: number;
  images?: string[];
  assignedTo?: string;
  estimatedResolution?: Date;
  updates?: Array<{
    id: string;
    message: string;
    timestamp: Date;
    author: string;
    type: 'update' | 'comment' | 'status_change';
  }>;
}

interface Representative {
  id: string;
  name: string;
  position: string;
  party: string;
  contact: {
    phone: string;
    email: string;
    office: string;
  };
  availability: {
    publicMeeting: string;
    onlineHours: string;
  };
  responsiveness: number; // 0-1 score
  issuesHandled: number;
  satisfactionRating: number; // 0-5 stars
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  organizer: string;
  category: 'town_hall' | 'public_meeting' | 'development_update' | 'community_event';
  attendees: number;
  maxCapacity?: number;
  isOnline: boolean;
  meetingLink?: string;
}

export default function MyConstituencyApp() {
  const [activeTab, setActiveTab] = useState<'issues' | 'representatives' | 'events' | 'insights' | 'report'>('issues');
  const [selectedConstituency] = useState('Thiruvananthapuram Central');
  const [showReportForm, setShowReportForm] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  // Mock data for Thiruvananthapuram Central constituency
  const [issues, setIssues] = useState<Issue[]>([
    {
      id: '1',
      title: 'Poor Street Lighting on MG Road',
      description: 'Several street lights have been non-functional for over 2 months, creating safety concerns for evening commuters and pedestrians.',
      category: 'infrastructure',
      priority: 'high',
      status: 'acknowledged',
      location: 'MG Road, Near Central Station',
      reportedBy: 'Rajesh Kumar',
      reportedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      supporters: 23,
      comments: 8,
      assignedTo: 'PWD Team',
      estimatedResolution: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      updates: [
        {
          id: '1',
          message: 'Issue acknowledged by PWD department. Survey team dispatched.',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          author: 'PWD Officer',
          type: 'status_change'
        }
      ]
    },
    {
      id: '2',
      title: 'Overcrowding at Government Hospital',
      description: 'Long waiting times at the OPD, insufficient seating arrangements, and need for additional consultation rooms.',
      category: 'healthcare',
      priority: 'urgent',
      status: 'in_progress',
      location: 'Government General Hospital',
      reportedBy: 'Dr. Priya Nair',
      reportedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      supporters: 67,
      comments: 15,
      assignedTo: 'Health Department',
      updates: [
        {
          id: '1',
          message: 'Additional temporary consultation rooms being set up. New appointment system under testing.',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          author: 'Health Secretary',
          type: 'update'
        }
      ]
    },
    {
      id: '3',
      title: 'Need for Children\'s Park in Residential Area',
      description: 'The Pattom residential area lacks recreational facilities for children. Request for establishing a small park with playground equipment.',
      category: 'environment',
      priority: 'medium',
      status: 'reported',
      location: 'Pattom Residential Complex',
      reportedBy: 'Residents Association',
      reportedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      supporters: 41,
      comments: 12
    },
    {
      id: '4',
      title: 'Irregular Water Supply',
      description: 'Water supply has been irregular for the past month. Many households receiving water only on alternate days.',
      category: 'utilities',
      priority: 'high',
      status: 'acknowledged',
      location: 'Vazhuthacaud Area',
      reportedBy: 'Multiple Citizens',
      reportedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      supporters: 89,
      comments: 23,
      assignedTo: 'Water Authority'
    }
  ]);

  const representatives: Representative[] = [
    {
      id: '1',
      name: 'Shashi Tharoor',
      position: 'Member of Parliament',
      party: 'Indian National Congress',
      contact: {
        phone: '+91-471-2345678',
        email: 'mp.thiruvananthapuram@parliament.gov.in',
        office: 'MP Office, Statue Junction'
      },
      availability: {
        publicMeeting: 'Every Saturday 10 AM - 12 PM',
        onlineHours: 'Monday & Wednesday 6 PM - 8 PM'
      },
      responsiveness: 0.87,
      issuesHandled: 142,
      satisfactionRating: 4.2
    },
    {
      id: '2',
      name: 'V.S. Sivakumar',
      position: 'MLA Thiruvananthapuram',
      party: 'Indian National Congress',
      contact: {
        phone: '+91-471-2456789',
        email: 'mla.tvpm@kerala.gov.in',
        office: 'MLA Office, Secretariat'
      },
      availability: {
        publicMeeting: 'Tuesday & Thursday 11 AM - 1 PM',
        onlineHours: 'Friday 5 PM - 7 PM'
      },
      responsiveness: 0.92,
      issuesHandled: 89,
      satisfactionRating: 4.5
    },
    {
      id: '3',
      name: 'Arya Rajendran',
      position: 'Mayor of Thiruvananthapuram',
      party: 'CPI(M)',
      contact: {
        phone: '+91-471-2567890',
        email: 'mayor@corporationtvm.kerala.gov.in',
        office: 'Mayor Office, Corporation Building'
      },
      availability: {
        publicMeeting: 'Every Wednesday 2 PM - 4 PM',
        onlineHours: 'Thursday 7 PM - 9 PM'
      },
      responsiveness: 0.89,
      issuesHandled: 156,
      satisfactionRating: 4.3
    }
  ];

  const events: Event[] = [
    {
      id: '1',
      title: 'Monthly Town Hall Meeting',
      description: 'Discuss ongoing development projects, citizen concerns, and upcoming initiatives for Thiruvananthapuram Central.',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      location: 'Community Hall, Statue Junction',
      organizer: 'MLA Office',
      category: 'town_hall',
      attendees: 0,
      maxCapacity: 200,
      isOnline: false
    },
    {
      id: '2',
      title: 'Smart City Project Updates',
      description: 'Presentation on progress of Smart City initiatives including digital infrastructure, traffic management, and e-governance.',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      location: 'Online Meeting',
      organizer: 'Smart City Mission',
      category: 'development_update',
      attendees: 0,
      maxCapacity: 500,
      isOnline: true,
      meetingLink: 'https://meet.google.com/xyz-abc-def'
    },
    {
      id: '3',
      title: 'Health Camp & Awareness Program',
      description: 'Free health checkups, vaccination drive, and awareness session on preventive healthcare measures.',
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      location: 'Government Higher Secondary School',
      organizer: 'Health Department',
      category: 'community_event',
      attendees: 0,
      maxCapacity: 300,
      isOnline: false
    }
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'infrastructure': return <Building className="h-4 w-4" />;
      case 'healthcare': return <Heart className="h-4 w-4" />;
      case 'education': return <FileText className="h-4 w-4" />;
      case 'employment': return <Users className="h-4 w-4" />;
      case 'environment': return <Shield className="h-4 w-4" />;
      case 'safety': return <AlertTriangle className="h-4 w-4" />;
      case 'utilities': return <Zap className="h-4 w-4" />;
      case 'transport': return <Globe className="h-4 w-4" />;
      default: return <Flag className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'infrastructure': return 'text-blue-600 bg-blue-100';
      case 'healthcare': return 'text-red-600 bg-red-100';
      case 'education': return 'text-green-600 bg-green-100';
      case 'employment': return 'text-purple-600 bg-purple-100';
      case 'environment': return 'text-emerald-600 bg-emerald-100';
      case 'safety': return 'text-orange-600 bg-orange-100';
      case 'utilities': return 'text-yellow-600 bg-yellow-100';
      case 'transport': return 'text-indigo-600 bg-indigo-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-700 bg-red-100 border-red-300';
      case 'high': return 'text-red-600 bg-red-100 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reported': return 'text-blue-600 bg-blue-100';
      case 'acknowledged': return 'text-yellow-600 bg-yellow-100';
      case 'in_progress': return 'text-purple-600 bg-purple-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'closed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredIssues = issues.filter(issue => {
    if (filterCategory !== 'all' && issue.category !== filterCategory) return false;
    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return b.reportedAt.getTime() - a.reportedAt.getTime();
      case 'priority':
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case 'supporters':
        return b.supporters - a.supporters;
      default:
        return 0;
    }
  });

  const handleSupportIssue = (issueId: string) => {
    setIssues(prev => prev.map(issue => 
      issue.id === issueId 
        ? { ...issue, supporters: issue.supporters + 1 }
        : issue
    ));
  };

  const handleReportIssue = (formData: any) => {
    const newIssue: Issue = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      category: formData.category,
      priority: formData.priority,
      status: 'reported',
      location: formData.location,
      reportedBy: 'Current User', // Would come from auth context
      reportedAt: new Date(),
      supporters: 1,
      comments: 0
    };
    setIssues(prev => [newIssue, ...prev]);
    setShowReportForm(false);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <MapPin className="mr-2 h-6 w-6 text-green-600" />
            My Constituency: {selectedConstituency}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Citizen engagement platform for local issues and community participation
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowReportForm(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center text-sm"
          >
            <Plus className="mr-1 h-4 w-4" />
            Report Issue
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Flag className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-blue-900">{issues.length}</div>
              <div className="text-sm text-blue-700">Active Issues</div>
            </div>
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-green-900">
                {issues.filter(i => i.status === 'resolved').length}
              </div>
              <div className="text-sm text-green-700">Resolved</div>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-purple-900">
                {issues.reduce((sum, issue) => sum + issue.supporters, 0)}
              </div>
              <div className="text-sm text-purple-700">Total Support</div>
            </div>
          </div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-orange-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-orange-900">{events.length}</div>
              <div className="text-sm text-orange-700">Upcoming Events</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'issues', label: 'Local Issues', icon: Flag },
              { key: 'representatives', label: 'Representatives', icon: Users },
              { key: 'events', label: 'Events', icon: Calendar },
              { key: 'insights', label: 'Insights', icon: TrendingUp },
              { key: 'report', label: 'Report', icon: FileText }
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

      {/* Issues Tab */}
      {activeTab === 'issues' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select 
                value={filterCategory} 
                onChange={(e) => setFilterCategory(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                <option value="all">All Categories</option>
                <option value="infrastructure">Infrastructure</option>
                <option value="healthcare">Healthcare</option>
                <option value="education">Education</option>
                <option value="environment">Environment</option>
                <option value="utilities">Utilities</option>
                <option value="transport">Transport</option>
                <option value="safety">Safety</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                <option value="recent">Most Recent</option>
                <option value="priority">Priority</option>
                <option value="supporters">Most Supported</option>
              </select>
            </div>
          </div>

          {/* Issues List */}
          <div className="space-y-4">
            {filteredIssues.map((issue) => (
              <div key={issue.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`flex items-center px-2 py-1 rounded text-xs font-medium ${getCategoryColor(issue.category)}`}>
                        {getCategoryIcon(issue.category)}
                        <span className="ml-1 capitalize">{issue.category}</span>
                      </div>
                      <div className={`px-2 py-1 rounded border text-xs font-medium ${getPriorityColor(issue.priority)}`}>
                        {issue.priority.toUpperCase()}
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(issue.status)}`}>
                        {issue.status.replace('_', ' ').toUpperCase()}
                      </div>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2">{issue.title}</h4>
                    <p className="text-sm text-gray-700 mb-3">{issue.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {issue.location}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {issue.reportedAt.toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        Reported by {issue.reportedBy}
                      </div>
                    </div>
                    {issue.assignedTo && (
                      <div className="mt-2 text-xs text-blue-600">
                        Assigned to: {issue.assignedTo}
                        {issue.estimatedResolution && (
                          <span className="ml-2">• Expected resolution: {issue.estimatedResolution.toLocaleDateString()}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="ml-4 flex flex-col items-end space-y-2">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleSupportIssue(issue.id)}
                        className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm"
                      >
                        <Heart className="h-3 w-3 mr-1" />
                        {issue.supporters}
                      </button>
                      <button className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        {issue.comments}
                      </button>
                    </div>
                    <button
                      onClick={() => setSelectedIssue(issue)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
                {issue.updates && issue.updates.length > 0 && (
                  <div className="bg-blue-50 p-3 rounded border border-blue-200">
                    <div className="text-xs text-blue-800 font-medium mb-1">Latest Update:</div>
                    <div className="text-sm text-blue-700">{issue.updates[issue.updates.length - 1].message}</div>
                    <div className="text-xs text-blue-600 mt-1">
                      {issue.updates[issue.updates.length - 1].timestamp.toLocaleDateString()} - {issue.updates[issue.updates.length - 1].author}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Representatives Tab */}
      {activeTab === 'representatives' && (
        <div className="space-y-4">
          {representatives.map((rep) => (
            <div key={rep.id} className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">{rep.name}</h4>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">{rep.party}</span>
                  </div>
                  <p className="text-gray-700 mb-3">{rep.position}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{rep.issuesHandled}</div>
                    <div className="text-xs text-gray-500">Issues Handled</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < rep.satisfactionRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{rep.satisfactionRating}/5</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-gray-900 mb-3">Contact Information</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-gray-700">{rep.contact.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-gray-700">{rep.contact.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Building className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-gray-700">{rep.contact.office}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h5 className="font-medium text-gray-900 mb-3">Availability</h5>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Public Meetings:</span>
                      <div className="text-gray-800">{rep.availability.publicMeeting}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Online Hours:</span>
                      <div className="text-gray-800">{rep.availability.onlineHours}</div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Responsiveness</span>
                      <span className="text-sm font-medium">{Math.round(rep.responsiveness * 100)}%</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2 relative">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${rep.responsiveness * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium text-gray-900">{event.title}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      event.category === 'town_hall' ? 'bg-blue-100 text-blue-700' :
                      event.category === 'development_update' ? 'bg-green-100 text-green-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {event.category.replace('_', ' ').toUpperCase()}
                    </span>
                    {event.isOnline && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                        ONLINE
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mb-3">{event.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {event.date.toLocaleString()}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {event.location}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {event.organizer}
                    </div>
                  </div>
                </div>
                <div className="ml-4 text-right">
                  {event.maxCapacity && (
                    <div className="text-sm text-gray-600 mb-2">
                      {event.attendees}/{event.maxCapacity} attending
                    </div>
                  )}
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm">
                    {event.isOnline ? 'Join Online' : 'Register'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Insights Tab */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Issue Categories</h4>
              <div className="space-y-3">
                {['infrastructure', 'healthcare', 'utilities', 'environment'].map(category => {
                  const count = issues.filter(i => i.category === category).length;
                  const percentage = Math.round((count / issues.length) * 100);
                  return (
                    <div key={category} className="flex items-center justify-between">
                      <div className="flex items-center">
                        {getCategoryIcon(category)}
                        <span className="ml-2 text-sm capitalize">{category}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="bg-blue-200 rounded-full h-2 w-20 relative">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Response Times</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Average Response Time</span>
                  <span className="font-medium">2.3 days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Resolution Rate</span>
                  <span className="font-medium text-green-600">78%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Citizen Satisfaction</span>
                  <span className="font-medium text-blue-600">4.2/5</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">Trending Issues</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Street Lighting & Safety</span>
                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">↑ 23%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Water Supply Issues</span>
                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">↑ 18%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Healthcare Access</span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">↓ 12%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Tab */}
      {activeTab === 'report' && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-4">Constituency Report</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <button className="p-4 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
              <Download className="h-6 w-6 mx-auto mb-2" />
              <div className="text-sm font-medium">Monthly Report</div>
            </button>
            <button className="p-4 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
              <Share2 className="h-6 w-6 mx-auto mb-2" />
              <div className="text-sm font-medium">Share Insights</div>
            </button>
            <button className="p-4 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors">
              <Target className="h-6 w-6 mx-auto mb-2" />
              <div className="text-sm font-medium">Action Plan</div>
            </button>
          </div>
          <p className="text-sm text-gray-600">
            Generate comprehensive reports on constituency performance, issue resolution rates, citizen engagement metrics, and representative responsiveness.
          </p>
        </div>
      )}

      {/* Report Issue Modal */}
      {showReportForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-96 overflow-y-auto">
            <h4 className="text-lg font-semibold mb-4">Report New Issue</h4>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleReportIssue({
                title: formData.get('title'),
                description: formData.get('description'),
                category: formData.get('category'),
                priority: formData.get('priority'),
                location: formData.get('location')
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issue Title</label>
                  <input name="title" type="text" required className="w-full border border-gray-300 rounded-md px-3 py-2" placeholder="Brief description of the issue" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select name="category" required className="w-full border border-gray-300 rounded-md px-3 py-2">
                    <option value="">Select Category</option>
                    <option value="infrastructure">Infrastructure</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="education">Education</option>
                    <option value="utilities">Utilities</option>
                    <option value="environment">Environment</option>
                    <option value="transport">Transport</option>
                    <option value="safety">Safety</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select name="priority" required className="w-full border border-gray-300 rounded-md px-3 py-2">
                    <option value="">Select Priority</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input name="location" type="text" required className="w-full border border-gray-300 rounded-md px-3 py-2" placeholder="Specific location or area" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea name="description" rows={4} required className="w-full border border-gray-300 rounded-md px-3 py-2" placeholder="Detailed description of the issue"></textarea>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowReportForm(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Submit Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}