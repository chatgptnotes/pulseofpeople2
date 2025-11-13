import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Filter, 
  Download, 
  Upload,
  Edit3,
  MapPin,
  Phone,
  Mail,
  Calendar,
  User,
  Tag,
  BarChart3,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Clock,
  Target,
  FileText,
  Camera
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function VoterDatabase() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showAddVoter, setShowAddVoter] = useState(false);

  // Mock voter database
  const voterDatabase = [
    {
      id: 'VTR001',
      name: 'Rajesh Kumar',
      age: 42,
      gender: 'Male',
      phone: '+91-9876543210',
      email: 'rajesh.kumar@email.com',
      address: 'Plot 45, Sector 12, Gurgaon',
      constituency: 'Gurgaon Rural',
      booth: 'GR-045',
      voterIdCard: 'ABC123456789',
      demographics: {
        caste: 'General',
        religion: 'Hindu',
        education: 'Graduate',
        occupation: 'Engineer',
        income: '5-10 Lakhs'
      },
      interests: ['Infrastructure', 'Technology', 'Education'],
      contactHistory: [
        { date: '2024-01-15', type: 'Door-to-door', worker: 'Amit Singh', notes: 'Positive response to education policies' },
        { date: '2024-01-10', type: 'Phone Call', worker: 'Priya Sharma', notes: 'Interested in infrastructure development' }
      ],
      engagement: {
        ralliesAttended: 2,
        lastContact: '2024-01-15',
        supportLevel: 'Strong',
        likelihood: 95
      },
      status: 'Active',
      addedBy: 'Field Worker 001',
      addedDate: '2024-01-01'
    },
    {
      id: 'VTR002',
      name: 'Sunita Devi',
      age: 38,
      gender: 'Female',
      phone: '+91-9876543211',
      email: 'sunita.devi@email.com',
      address: 'House 23, Block C, Noida',
      constituency: 'Noida',
      booth: 'ND-023',
      voterIdCard: 'DEF987654321',
      demographics: {
        caste: 'OBC',
        religion: 'Hindu',
        education: 'Post Graduate',
        occupation: 'Teacher',
        income: '3-5 Lakhs'
      },
      interests: ['Education', 'Women Safety', 'Healthcare'],
      contactHistory: [
        { date: '2024-01-12', type: 'Rally', worker: 'Meera Gupta', notes: 'Very enthusiastic about education reforms' }
      ],
      engagement: {
        ralliesAttended: 3,
        lastContact: '2024-01-12',
        supportLevel: 'Strong',
        likelihood: 90
      },
      status: 'Active',
      addedBy: 'Field Worker 002',
      addedDate: '2024-01-02'
    },
    {
      id: 'VTR003',
      name: 'Mohammed Ali',
      age: 35,
      gender: 'Male',
      phone: '+91-9876543212',
      email: 'mohammed.ali@email.com',
      address: 'Lane 5, Old Delhi',
      constituency: 'Chandni Chowk',
      booth: 'CC-012',
      voterIdCard: 'GHI456789123',
      demographics: {
        caste: 'Muslim',
        religion: 'Islam',
        education: 'Graduate',
        occupation: 'Business',
        income: '2-3 Lakhs'
      },
      interests: ['Economic Policy', 'Small Business', 'Healthcare'],
      contactHistory: [
        { date: '2024-01-14', type: 'WhatsApp', worker: 'Arjun Patel', notes: 'Concerned about economic policies' }
      ],
      engagement: {
        ralliesAttended: 1,
        lastContact: '2024-01-14',
        supportLevel: 'Moderate',
        likelihood: 70
      },
      status: 'Active',
      addedBy: 'Field Worker 003',
      addedDate: '2024-01-03'
    }
  ];

  // Mock analytics data
  const databaseStats = {
    totalVoters: 125420,
    newRegistrations: 1240,
    activeVoters: 118650,
    strongSupport: 89320,
    moderateSupport: 24180,
    weakSupport: 11920
  };

  const demographicBreakdown = [
    { category: 'General', count: 45230, percentage: 36.1, color: '#3B82F6' },
    { category: 'OBC', count: 38140, percentage: 30.4, color: '#10B981' },
    { category: 'SC', count: 25680, percentage: 20.5, color: '#F59E0B' },
    { category: 'ST', count: 16370, percentage: 13.0, color: '#EF4444' }
  ];

  const supportLevelData = [
    { level: 'Strong Support', count: 89320, color: '#10B981' },
    { level: 'Moderate Support', count: 24180, color: '#F59E0B' },
    { level: 'Weak Support', count: 11920, color: '#EF4444' }
  ];

  const boothWiseData = [
    { booth: 'GR-001', voters: 1240, contacted: 980, support: 78 },
    { booth: 'GR-002', voters: 1180, contacted: 920, support: 82 },
    { booth: 'ND-001', voters: 1320, contacted: 1100, support: 75 },
    { booth: 'ND-002', voters: 1150, contacted: 950, support: 85 },
    { booth: 'CC-001', voters: 1080, contacted: 850, support: 68 }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'database', label: 'Voter Database', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'registration', label: 'Registration', icon: Plus }
  ];

  const filteredVoters = voterDatabase.filter(voter => {
    const matchesSearch = voter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         voter.constituency.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         voter.voterIdCard.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || 
                         voter.engagement.supportLevel.toLowerCase() === selectedFilter.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center">
            <Users className="w-8 h-8 mr-3 text-blue-600" />
            Voter Database Management
          </h2>
          <p className="text-gray-600">Comprehensive voter registration and engagement tracking system</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
            <Upload className="w-4 h-4" />
            <span>Import Data</span>
          </button>
          <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export Database</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{databaseStats.totalVoters.toLocaleString()}</div>
              <div className="text-xs text-gray-600">Total Voters</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
              <Plus className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">+{databaseStats.newRegistrations.toLocaleString()}</div>
              <div className="text-xs text-gray-600">New This Month</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
              <CheckCircle className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{databaseStats.activeVoters.toLocaleString()}</div>
              <div className="text-xs text-gray-600">Active Voters</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
              <Target className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{databaseStats.strongSupport.toLocaleString()}</div>
              <div className="text-xs text-gray-600">Strong Support</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{databaseStats.moderateSupport.toLocaleString()}</div>
              <div className="text-xs text-gray-600">Moderate Support</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
              <Clock className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">94.5%</div>
              <div className="text-xs text-gray-600">Contact Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-5 h-5 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Demographic Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Demographic Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={demographicBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percentage }) => `${category} ${percentage}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {demographicBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [value.toLocaleString(), 'Voters']} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Support Level Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={supportLevelData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="level" type="category" width={100} />
                  <Tooltip formatter={(value: any) => [value.toLocaleString(), 'Voters']} />
                  <Bar dataKey="count" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Booth-wise Performance */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Booth-wise Coverage Analysis</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Booth</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">Total Voters</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">Contacted</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">Contact Rate</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">Support %</th>
                  </tr>
                </thead>
                <tbody>
                  {boothWiseData.map((booth) => (
                    <tr key={booth.booth} className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium text-gray-900">{booth.booth}</td>
                      <td className="py-3 px-4 text-right">{booth.voters.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right">{booth.contacted.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end">
                          <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                            <div 
                              className="h-2 bg-blue-500 rounded-full"
                              style={{ width: `${(booth.contacted / booth.voters) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">
                            {Math.round((booth.contacted / booth.voters) * 100)}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          booth.support >= 80 ? 'bg-green-100 text-green-800' :
                          booth.support >= 70 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {booth.support}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'database' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, voter ID, or constituency..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select 
                value={selectedFilter} 
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Support Levels</option>
                <option value="strong">Strong Support</option>
                <option value="moderate">Moderate Support</option>
                <option value="weak">Weak Support</option>
              </select>
              <button 
                onClick={() => setShowAddVoter(true)}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Voter</span>
              </button>
            </div>
          </div>

          {/* Voter List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Voter Details</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Demographics</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Contact Info</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Engagement</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVoters.map((voter) => (
                    <tr key={voter.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-gray-900">{voter.name}</div>
                          <div className="text-sm text-gray-600">{voter.voterIdCard}</div>
                          <div className="text-sm text-gray-600">{voter.constituency} - {voter.booth}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          <div>{voter.age}y, {voter.gender}</div>
                          <div className="text-gray-600">{voter.demographics.caste}</div>
                          <div className="text-gray-600">{voter.demographics.occupation}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          <div className="flex items-center">
                            <Phone className="w-3 h-3 mr-1 text-gray-400" />
                            {voter.phone}
                          </div>
                          <div className="flex items-center mt-1">
                            <Mail className="w-3 h-3 mr-1 text-gray-400" />
                            {voter.email}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            voter.engagement.supportLevel === 'Strong' ? 'bg-green-100 text-green-800' :
                            voter.engagement.supportLevel === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {voter.engagement.supportLevel}
                          </span>
                          <div className="text-gray-600 mt-1">
                            {voter.engagement.ralliesAttended} rallies attended
                          </div>
                          <div className="text-gray-600">
                            Last: {voter.engagement.lastContact}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                            <Phone className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-purple-600 transition-colors">
                            <FileText className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Interest Analysis */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Voter Interests</h3>
              <div className="space-y-3">
                {[
                  { interest: 'Infrastructure', count: 45280, percentage: 78 },
                  { interest: 'Education', count: 38940, percentage: 67 },
                  { interest: 'Healthcare', count: 32150, percentage: 55 },
                  { interest: 'Employment', count: 28760, percentage: 49 },
                  { interest: 'Women Safety', count: 24830, percentage: 43 }
                ].map((item) => (
                  <div key={item.interest} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{item.interest}</span>
                    <div className="flex items-center">
                      <div className="w-20 h-2 bg-gray-200 rounded-full mr-2">
                        <div 
                          className="h-2 bg-blue-500 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600 w-12">{item.count.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Method Effectiveness */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Method Success</h3>
              <div className="space-y-4">
                {[
                  { method: 'Door-to-door', success: 89, attempts: 12450 },
                  { method: 'Phone Call', success: 67, attempts: 8920 },
                  { method: 'WhatsApp', success: 78, attempts: 15680 },
                  { method: 'Rally', success: 95, attempts: 3240 },
                  { method: 'SMS', success: 45, attempts: 18920 }
                ].map((method) => (
                  <div key={method.method} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{method.method}</div>
                      <div className="text-xs text-gray-600">{method.attempts.toLocaleString()} attempts</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">{method.success}%</div>
                      <div className="text-xs text-gray-600">Success Rate</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Geographic Coverage */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Geographic Coverage</h3>
              <div className="space-y-3">
                {[
                  { area: 'Urban Areas', coverage: 92, voters: 45230 },
                  { area: 'Semi-Urban', coverage: 78, voters: 38140 },
                  { area: 'Rural Areas', coverage: 65, voters: 42050 }
                ].map((area) => (
                  <div key={area.area} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{area.area}</span>
                      <span className="text-sm font-medium text-gray-700">{area.coverage}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-blue-500 rounded-full"
                        style={{ width: `${area.coverage}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {area.voters.toLocaleString()} voters
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'registration' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Add New Voter</h3>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 border-b pb-2">Personal Information</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input type="text" className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
                      <input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                      <select className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Voter ID Card *</label>
                    <input type="text" className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                    <input type="tel" className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>

                {/* Demographics & Location */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 border-b pb-2">Demographics & Location</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Caste</label>
                      <select className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Select Caste</option>
                        <option value="General">General</option>
                        <option value="OBC">OBC</option>
                        <option value="SC">SC</option>
                        <option value="ST">ST</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Religion</label>
                      <select className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Select Religion</option>
                        <option value="Hindu">Hindu</option>
                        <option value="Muslim">Muslim</option>
                        <option value="Christian">Christian</option>
                        <option value="Sikh">Sikh</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
                    <select className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select Education</option>
                      <option value="Illiterate">Illiterate</option>
                      <option value="Primary">Primary</option>
                      <option value="Secondary">Secondary</option>
                      <option value="Graduate">Graduate</option>
                      <option value="Post Graduate">Post Graduate</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                    <input type="text" className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Constituency *</label>
                      <select className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Select Constituency</option>
                        <option value="Gurgaon Rural">Gurgaon Rural</option>
                        <option value="Noida">Noida</option>
                        <option value="Chandni Chowk">Chandni Chowk</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Booth *</label>
                      <input type="text" className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                  </div>
                </div>
              </div>

              {/* Interests */}
              <div>
                <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Political Interests</h4>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {['Infrastructure', 'Education', 'Healthcare', 'Employment', 'Women Safety', 'Economic Policy', 'Environment', 'Technology'].map((interest) => (
                    <label key={interest} className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="ml-2 text-sm text-gray-700">{interest}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                <button type="button" className="px-6 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Add Voter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

