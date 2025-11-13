import React, { useState, useEffect } from 'react';
import {
  Users,
  Star,
  Phone,
  MapPin,
  Calendar,
  TrendingUp,
  TrendingDown,
  Target,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Activity,
  Award,
  BarChart3,
  MessageCircle,
  Eye,
  Plus,
  Edit3,
  Search,
  Filter,
  Download,
  X,
  UserPlus,
  Upload,
  Edit,
  Trash2
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { djangoApi } from '../services/djangoApi';
import BulkUserImport from './BulkUserImport';
import PageHeader from './PageHeader';
import CascadingLocationDropdown from './CascadingLocationDropdown';

// Role hierarchy - matches backend
const ROLE_HIERARCHY: Record<string, string[]> = {
  'superadmin': ['admin', 'manager', 'analyst', 'user', 'volunteer', 'viewer'],
  'admin': ['manager', 'analyst', 'user', 'volunteer', 'viewer'],
  'manager': ['analyst', 'user', 'volunteer', 'viewer'],
  'analyst': ['user', 'volunteer', 'viewer'],
  'user': [],
  'volunteer': [],
  'viewer': [],
};

interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
  city?: string;
  constituency?: string;
  created_at: string;
  permissions: string[];
}

export default function FieldWorkerManagement() {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);

  // Create user form
  const [newUser, setNewUser] = useState({
    email: '',
    username: '',
    name: '',
    password: '',
    role: 'user',
    phone: '',
    city: '',
    district: '',
    constituency: '',
    polling_booth: ''
  });
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  const allowedRoles = ROLE_HIERARCHY[currentUser?.role || 'user'] || [];

  useEffect(() => {
    loadUsers();
  }, []);

  // Clear polling_booth when role changes to non-eligible role
  useEffect(() => {
    if (newUser.role !== 'user' && newUser.role !== 'volunteer' && newUser.polling_booth) {
      setNewUser(prev => ({ ...prev, polling_booth: '' }));
    }
  }, [newUser.role]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const usersData = await djangoApi.getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setCreateSuccess('');

    try {
      const response = await djangoApi.register({
        email: newUser.email,
        password: newUser.password,
        name: newUser.name,
        role: newUser.role,
        phone: newUser.phone,
        city: newUser.city,
        constituency: newUser.constituency,
      });

      setCreateSuccess(`User ${newUser.name} created successfully!`);
      setNewUser({ email: '', username: '', name: '', password: '', role: 'user', phone: '', city: '', constituency: '' });

      // Refresh user list
      await loadUsers();

      // Close modal after 2 seconds
      setTimeout(() => {
        setShowCreateModal(false);
        setCreateSuccess('');
      }, 2000);

    } catch (error: any) {
      setCreateError(error.message || 'Failed to create user');
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check if current user can create users
  const canCreateUsers = allowedRoles.length > 0;

  // Mock field worker data for analytics/graphs
  const fieldWorkers = [
    {
      id: 'FW001',
      name: 'Amit Singh',
      phone: '+91-9876543210',
      email: 'amit.singh@campaign.com',
      level: 'Senior',
      constituency: 'Gurgaon Rural',
      booths: ['GR-001', 'GR-002', 'GR-003'],
      joinDate: '2024-01-01',
      avatar: '👨‍💼',
      performance: {
        monthlyTarget: 500,
        achieved: 478,
        votersRegistered: 234,
        contactsMade: 1240,
        ralliesOrganized: 8,
        eventAttendance: 2340,
        rating: 4.8,
        efficiency: 96
      },
      weeklyData: [
        { week: 'Week 1', contacts: 280, registrations: 45, events: 2 },
        { week: 'Week 2', contacts: 320, registrations: 62, events: 3 },
        { week: 'Week 3', contacts: 350, registrations: 58, events: 2 },
        { week: 'Week 4', contacts: 290, registrations: 69, events: 1 }
      ],
      recentActivities: [
        { date: '2024-01-15', activity: 'Door-to-door campaign', area: 'Sector 12', contacts: 45, notes: 'Positive response to infrastructure policies' },
        { date: '2024-01-14', activity: 'Voter registration drive', area: 'Sector 11', contacts: 38, notes: 'Registered 12 new voters' },
        { date: '2024-01-13', activity: 'Rally organization', area: 'Community Center', contacts: 230, notes: 'Successful turnout, good engagement' }
      ],
      strengths: ['Excellent communication', 'Strong local network', 'High voter registration rate'],
      improvements: ['Digital outreach', 'Data entry speed'],
      assignments: [
        { task: 'Booth coverage analysis', deadline: '2024-01-20', status: 'In Progress' },
        { task: 'Youth voter registration', deadline: '2024-01-25', status: 'Pending' }
      ]
    },
    {
      id: 'FW002',
      name: 'Priya Sharma',
      phone: '+91-9876543211',
      email: 'priya.sharma@campaign.com',
      level: 'Mid-Level',
      constituency: 'Noida',
      booths: ['ND-001', 'ND-002'],
      joinDate: '2024-01-05',
      avatar: '👩‍💼',
      performance: {
        monthlyTarget: 400,
        achieved: 392,
        votersRegistered: 186,
        contactsMade: 980,
        ralliesOrganized: 5,
        eventAttendance: 1820,
        rating: 4.6,
        efficiency: 98
      },
      weeklyData: [
        { week: 'Week 1', contacts: 240, registrations: 38, events: 1 },
        { week: 'Week 2', contacts: 260, registrations: 52, events: 2 },
        { week: 'Week 3', contacts: 280, registrations: 46, events: 1 },
        { week: 'Week 4', contacts: 200, registrations: 50, events: 1 }
      ],
      recentActivities: [
        { date: '2024-01-15', activity: 'WhatsApp outreach', area: 'Sector 15', contacts: 120, notes: 'Shared policy updates and event information' },
        { date: '2024-01-14', activity: 'Women\'s meeting', area: 'Community Hall', contacts: 65, notes: 'Discussed women safety initiatives' }
      ],
      strengths: ['Digital savvy', 'Women\'s issues expert', 'Good data management'],
      improvements: ['Public speaking', 'Event organization'],
      assignments: [
        { task: 'Women voter outreach', deadline: '2024-01-22', status: 'Completed' },
        { task: 'Social media campaign', deadline: '2024-01-28', status: 'In Progress' }
      ]
    },
    {
      id: 'FW003',
      name: 'Rajesh Kumar',
      phone: '+91-9876543212',
      email: 'rajesh.kumar@campaign.com',
      level: 'Junior',
      constituency: 'Chandni Chowk',
      booths: ['CC-001'],
      joinDate: '2024-01-10',
      avatar: '👨‍🎓',
      performance: {
        monthlyTarget: 300,
        achieved: 245,
        votersRegistered: 98,
        contactsMade: 650,
        ralliesOrganized: 2,
        eventAttendance: 580,
        rating: 4.2,
        efficiency: 82
      },
      weeklyData: [
        { week: 'Week 1', contacts: 150, registrations: 20, events: 1 },
        { week: 'Week 2', contacts: 180, registrations: 28, events: 0 },
        { week: 'Week 3', contacts: 160, registrations: 25, events: 1 },
        { week: 'Week 4', contacts: 160, registrations: 25, events: 0 }
      ],
      recentActivities: [
        { date: '2024-01-15', activity: 'Market outreach', area: 'Chandni Chowk Market', contacts: 85, notes: 'Engaged with local traders' },
        { date: '2024-01-13', activity: 'House visits', area: 'Old Delhi', contacts: 42, notes: 'Mixed responses, need follow-up' }
      ],
      strengths: ['Local knowledge', 'Persistent', 'Good rapport with traders'],
      improvements: ['Time management', 'Report writing', 'Technology usage'],
      assignments: [
        { task: 'Market vendor outreach', deadline: '2024-01-24', status: 'In Progress' },
        { task: 'Basic training completion', deadline: '2024-01-30', status: 'Pending' }
      ]
    }
  ];

  // Performance metrics
  const overallStats = {
    totalWorkers: users.length || 45,
    activeWorkers: users.filter(u => u.role !== 'viewer').length || 42,
    totalTargets: 18500,
    achieved: 16780,
    averageRating: 4.5,
    topPerformers: 8
  };

  const performanceDistribution = [
    { level: 'Excellent (4.5+)', count: 15, color: '#10B981' },
    { level: 'Good (4.0-4.4)', count: 20, color: '#3B82F6' },
    { level: 'Average (3.5-3.9)', count: 8, color: '#F59E0B' },
    { level: 'Needs Improvement (<3.5)', count: 2, color: '#EF4444' }
  ];

  const monthlyTrends = [
    { month: 'Oct', contacts: 12450, registrations: 1240, events: 45 },
    { month: 'Nov', contacts: 14200, registrations: 1580, events: 52 },
    { month: 'Dec', contacts: 16800, registrations: 1920, events: 48 },
    { month: 'Jan', contacts: 18900, registrations: 2180, events: 58 }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'workers', label: 'Field Workers', icon: Users },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
    { id: 'management', label: 'User Management', icon: UserPlus }
  ];

  const getPerformanceColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600 bg-green-100';
    if (rating >= 4.0) return 'text-blue-600 bg-blue-100';
    if (rating >= 3.5) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 95) return 'bg-green-500';
    if (efficiency >= 85) return 'bg-blue-500';
    if (efficiency >= 75) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Create and manage users, assign roles, and track team performance"
        showBackButton={true}
        highlightBackButton={true}
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{overallStats.totalWorkers}</div>
              <div className="text-xs text-gray-600">Total Workers</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{overallStats.activeWorkers}</div>
              <div className="text-xs text-gray-600">Active Today</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{Math.round((overallStats.achieved / overallStats.totalTargets) * 100)}%</div>
              <div className="text-xs text-gray-600">Target Achievement</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
              <Star className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{overallStats.averageRating}</div>
              <div className="text-xs text-gray-600">Avg Rating</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
              <Award className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{overallStats.topPerformers}</div>
              <div className="text-xs text-gray-600">Top Performers</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
              <Activity className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">2.4K</div>
              <div className="text-xs text-gray-600">Daily Contacts</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-t-lg">
        <nav className="-mb-px flex space-x-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center py-3 px-4 border-b-2 font-semibold text-sm transition-all ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg shadow-md'
                  : 'border-transparent text-gray-600 hover:text-blue-600 hover:bg-white/50 hover:border-blue-300 rounded-t-lg'
              }`}
            >
              <tab.icon className={`w-5 h-5 mr-2 ${
                activeTab === tab.id ? 'text-blue-600' : 'text-gray-500'
              }`} />
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Performance Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Performance Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="contacts" stroke="#3B82F6" strokeWidth={2} name="Contacts" />
                  <Line type="monotone" dataKey="registrations" stroke="#10B981" strokeWidth={2} name="Registrations" />
                  <Line type="monotone" dataKey="events" stroke="#F59E0B" strokeWidth={2} name="Events" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={performanceDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ level, count }) => `${count} workers`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {performanceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Performers */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers This Month</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {fieldWorkers.slice(0, 3).map((worker, index) => (
                <div key={worker.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <div className="text-2xl mr-3">{worker.avatar}</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{worker.name}</h4>
                      <p className="text-sm text-gray-600">{worker.constituency}</p>
                    </div>
                    <div className="ml-auto">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-yellow-600'
                      }`}>
                        {index + 1}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Achievement</span>
                      <span className="font-medium">{Math.round((worker.performance.achieved / worker.performance.monthlyTarget) * 100)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rating</span>
                      <span className="font-medium flex items-center">
                        <Star className="w-3 h-3 text-yellow-500 mr-1" />
                        {worker.performance.rating}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Contacts</span>
                      <span className="font-medium">{worker.performance.contactsMade.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'workers' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search workers by name or constituency..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Levels</option>
                <option value="senior">Senior</option>
                <option value="mid-level">Mid-Level</option>
                <option value="junior">Junior</option>
              </select>
            </div>
          </div>

          {/* Worker Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {fieldWorkers.map((worker) => (
              <div key={worker.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="text-3xl mr-3">{worker.avatar}</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{worker.name}</h3>
                      <p className="text-sm text-gray-600">{worker.level} • {worker.constituency}</p>
                      <p className="text-xs text-gray-500">{worker.booths.length} booths assigned</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${getPerformanceColor(worker.performance.rating)}`}>
                    <Star className="w-3 h-3 inline mr-1" />
                    {worker.performance.rating}
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Monthly Progress</span>
                    <span className="text-sm font-medium">
                      {worker.performance.achieved}/{worker.performance.monthlyTarget}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div
                      className={`h-2 rounded-full ${getEfficiencyColor(worker.performance.efficiency)}`}
                      style={{ width: `${(worker.performance.achieved / worker.performance.monthlyTarget) * 100}%` }}
                    ></div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Contacts</div>
                      <div className="font-medium">{worker.performance.contactsMade.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Registrations</div>
                      <div className="font-medium">{worker.performance.votersRegistered}</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    Active today
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                      <Phone className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-green-600 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setSelectedWorker(worker)}
                      className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="space-y-6">
          {/* Performance Comparison */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Performance Comparison</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={[
                { metric: 'Contacts Made', amit: 1240, priya: 980, rajesh: 650 },
                { metric: 'Voters Registered', amit: 234, priya: 186, rajesh: 98 },
                { metric: 'Events Organized', amit: 8, priya: 5, rajesh: 2 },
                { metric: 'Efficiency %', amit: 96, priya: 98, rajesh: 82 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metric" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amit" fill="#3B82F6" name="Amit Singh" />
                <Bar dataKey="priya" fill="#10B981" name="Priya Sharma" />
                <Bar dataKey="rajesh" fill="#F59E0B" name="Rajesh Kumar" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Individual Performance Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {fieldWorkers.map((worker) => (
              <div key={worker.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <div className="text-2xl mr-3">{worker.avatar}</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{worker.name}</h4>
                    <p className="text-sm text-gray-600">{worker.constituency}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Efficiency</span>
                    <div className="flex items-center">
                      <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                        <div
                          className={`h-2 rounded-full ${getEfficiencyColor(worker.performance.efficiency)}`}
                          style={{ width: `${worker.performance.efficiency}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{worker.performance.efficiency}%</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Contacts/Day</span>
                      <span className="font-medium">{Math.round(worker.performance.contactsMade / 30)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Registration Rate</span>
                      <span className="font-medium">{Math.round((worker.performance.votersRegistered / worker.performance.contactsMade) * 100)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Event Attendance</span>
                      <span className="font-medium">{worker.performance.eventAttendance.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h5 className="font-medium text-gray-900 mb-2">Strengths</h5>
                  <div className="space-y-1">
                    {worker.strengths.slice(0, 2).map((strength, index) => (
                      <div key={index} className="text-xs text-green-600 flex items-center">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {strength}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Management Tab */}
      {activeTab === 'management' && (
        <div className="space-y-6">
          {/* No Permission Message */}
          {!canCreateUsers && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Users className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Your role ({currentUser?.role}) does not have permission to create users.
                    Contact your administrator if you need access.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {canCreateUsers && (
            <div className="flex gap-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="relative flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg border-2 border-blue-300 font-semibold"
              >
                <UserPlus className="h-5 w-5" />
                Create User
                <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold shadow-md">NEW</span>
              </button>

              <button
                onClick={() => setShowBulkUploadModal(true)}
                className="relative flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg border-2 border-green-300 font-semibold"
              >
                <Upload className="h-5 w-5" />
                Bulk Import Users
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold shadow-md">NEW</span>
              </button>
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      Loading users...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      {searchTerm ? 'No users found matching your search' : 'No users yet. Create your first user!'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-start">
                          <MapPin className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.city || '-'}</div>
                            <div className="text-xs text-gray-500">{user.constituency || '-'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.phone || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Worker Detail Modal */}
      {selectedWorker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="text-3xl mr-4">{selectedWorker.avatar}</div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedWorker.name}</h2>
                  <p className="text-gray-600">{selectedWorker.level} • {selectedWorker.constituency}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedWorker(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Chart */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Performance</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={selectedWorker.weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="contacts" stroke="#3B82F6" name="Contacts" />
                    <Line type="monotone" dataKey="registrations" stroke="#10B981" name="Registrations" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Recent Activities */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {selectedWorker.recentActivities.map((activity, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4">
                      <div className="font-medium text-gray-900">{activity.activity}</div>
                      <div className="text-sm text-gray-600">{activity.area} • {activity.date}</div>
                      <div className="text-sm text-gray-500">{activity.contacts} contacts</div>
                      <div className="text-xs text-gray-500 mt-1">{activity.notes}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-md w-full my-8 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 sticky top-0 bg-white pb-2 border-b">Create User Account</h2>

            {createError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-red-700 text-sm">{createError}</p>
              </div>
            )}

            {createSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <p className="text-green-700 text-sm">{createSuccess}</p>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Minimum 6 characters"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {allowedRoles.map(role => (
                    <option key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  You can only create users with these roles based on your permissions
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+91 9876543210"
                />
              </div>

              {/* Cascading Location Dropdown - District and Constituency */}
              <CascadingLocationDropdown
                selectedDistrict={newUser.district}
                selectedConstituency={newUser.constituency}
                selectedPollingBooth={newUser.polling_booth}
                onDistrictChange={(district) => setNewUser({ ...newUser, district })}
                onConstituencyChange={(constituency) => setNewUser({ ...newUser, constituency })}
                onPollingBoothChange={(polling_booth) => setNewUser({ ...newUser, polling_booth })}
                userRole={newUser.role}
                required={true}
              />

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create User
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreateError('');
                    setCreateSuccess('');
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkUploadModal && (
        <BulkUserImport
          onClose={() => setShowBulkUploadModal(false)}
          onComplete={() => {
            loadUsers();
            setShowBulkUploadModal(false);
          }}
        />
      )}
    </div>
  );
}
