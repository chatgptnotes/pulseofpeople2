import { useState } from 'react';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Users, 
 
  MapPin,
  FileText,
  Search,
  Download,
  Eye,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Submission {
  id: string;
  submissionType: 'daily' | 'weekly' | 'monthly';
  workerRole: string;
  workerName: string;
  ward: string;
  area: string;
  status: 'pending' | 'verified' | 'rejected' | 'processing';
  submittedAt: Date;
  verifiedBy?: string;
  verifiedAt?: Date;
  sentimentEntries: number;
  issues: number;
  viralContent: number;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
}

const mockSubmissions: Submission[] = [
  {
    id: '1',
    submissionType: 'daily',
    workerRole: 'ward-coordinator',
    workerName: 'Priya Sharma',
    ward: 'Ward 15',
    area: 'Malviya Nagar',
    status: 'verified',
    submittedAt: new Date('2024-08-15T10:30:00'),
    verifiedBy: 'Jane Smith',
    verifiedAt: new Date('2024-08-15T11:15:00'),
    sentimentEntries: 6,
    issues: 2,
    viralContent: 1,
    priority: 'medium'
  },
  {
    id: '2',
    submissionType: 'daily',
    workerRole: 'social-media',
    workerName: 'Rahul Kumar',
    ward: 'Ward 8',
    area: 'Lajpat Nagar',
    status: 'pending',
    submittedAt: new Date('2024-08-15T14:20:00'),
    sentimentEntries: 4,
    issues: 0,
    viralContent: 3,
    priority: 'high'
  },
  {
    id: '3',
    submissionType: 'weekly',
    workerRole: 'survey-team',
    workerName: 'Anjali Patel',
    ward: 'Ward 22',
    area: 'Karol Bagh',
    status: 'processing',
    submittedAt: new Date('2024-08-14T16:45:00'),
    sentimentEntries: 15,
    issues: 5,
    viralContent: 2,
    priority: 'high'
  },
  {
    id: '4',
    submissionType: 'daily',
    workerRole: 'truth-team',
    workerName: 'Vikram Singh',
    ward: 'Ward 5',
    area: 'Connaught Place',
    status: 'rejected',
    submittedAt: new Date('2024-08-14T09:15:00'),
    sentimentEntries: 3,
    issues: 1,
    viralContent: 0,
    priority: 'low',
    notes: 'Insufficient verification data'
  }
];

export default function DataTracking() {
  const { user, hasPermission } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>(mockSubmissions);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = submission.workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.ward.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.area.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
    const matchesRole = roleFilter === 'all' || submission.workerRole === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'processing': return <AlertCircle className="w-4 h-4 text-blue-600" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleVerifySubmission = (id: string) => {
    if (!hasPermission('verify_submissions')) {
      alert('You do not have permission to verify submissions');
      return;
    }

    setSubmissions(prev => prev.map(sub => 
      sub.id === id ? {
        ...sub,
        status: 'verified',
        verifiedBy: user?.name || 'Unknown',
        verifiedAt: new Date()
      } : sub
    ));
  };

  const handleRejectSubmission = (id: string, reason: string) => {
    if (!hasPermission('verify_submissions')) {
      alert('You do not have permission to reject submissions');
      return;
    }

    setSubmissions(prev => prev.map(sub => 
      sub.id === id ? {
        ...sub,
        status: 'rejected',
        notes: reason
      } : sub
    ));
  };

  const stats = {
    total: submissions.length,
    pending: submissions.filter(s => s.status === 'pending').length,
    verified: submissions.filter(s => s.status === 'verified').length,
    rejected: submissions.filter(s => s.status === 'rejected').length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Submission Tracking</h1>
          <p className="text-gray-600">Monitor and manage ground intelligence submissions</p>
        </div>
        <div className="flex space-x-3">
          {hasPermission('export_data') && (
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Submissions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Verified</p>
              <p className="text-2xl font-bold text-green-600">{stats.verified}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by worker name, ward, or area..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="processing">Processing</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="ward-coordinator">Ward Coordinators</option>
              <option value="social-media">Social Media</option>
              <option value="survey-team">Survey Teams</option>
              <option value="truth-team">Truth Teams</option>
            </select>
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submission Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Worker & Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Summary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubmissions.map((submission) => (
                <tr key={submission.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {submission.submissionType.charAt(0).toUpperCase() + submission.submissionType.slice(1)} Report
                        </div>
                        <div className="text-sm text-gray-500">
                          {submission.submittedAt.toLocaleDateString()} at {submission.submittedAt.toLocaleTimeString()}
                        </div>
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(submission.priority)}`}>
                          {submission.priority.charAt(0).toUpperCase() + submission.priority.slice(1)} Priority
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{submission.workerName}</div>
                        <div className="text-sm text-gray-500 capitalize">{submission.workerRole.replace('-', ' ')}</div>
                      </div>
                    </div>
                    <div className="flex items-center mt-1">
                      <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                      <div className="text-sm text-gray-500">{submission.ward}, {submission.area}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div>Sentiment: {submission.sentimentEntries} entries</div>
                      <div>Issues: {submission.issues}</div>
                      <div>Viral Content: {submission.viralContent}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(submission.status)}`}>
                      {getStatusIcon(submission.status)}
                      <span className="ml-1 capitalize">{submission.status}</span>
                    </div>
                    {submission.verifiedBy && (
                      <div className="text-xs text-gray-500 mt-1">
                        by {submission.verifiedBy}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedSubmission(submission)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {hasPermission('verify_submissions') && submission.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleVerifySubmission(submission.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt('Reason for rejection:');
                              if (reason) handleRejectSubmission(submission.id, reason);
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSubmissions.length === 0 && (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No submissions found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Submission Details</h3>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Worker:</span>
                  <span className="ml-2 text-gray-900">{selectedSubmission.workerName}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Role:</span>
                  <span className="ml-2 text-gray-900 capitalize">{selectedSubmission.workerRole.replace('-', ' ')}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Location:</span>
                  <span className="ml-2 text-gray-900">{selectedSubmission.ward}, {selectedSubmission.area}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Submitted:</span>
                  <span className="ml-2 text-gray-900">{selectedSubmission.submittedAt.toLocaleString()}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Type:</span>
                  <span className="ml-2 text-gray-900 capitalize">{selectedSubmission.submissionType}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Priority:</span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${getPriorityColor(selectedSubmission.priority)}`}>
                    {selectedSubmission.priority.charAt(0).toUpperCase() + selectedSubmission.priority.slice(1)}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Data Summary</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{selectedSubmission.sentimentEntries}</div>
                    <div className="text-blue-800">Sentiment Entries</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{selectedSubmission.issues}</div>
                    <div className="text-red-800">Issues Reported</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{selectedSubmission.viralContent}</div>
                    <div className="text-green-800">Viral Content</div>
                  </div>
                </div>
              </div>

              {selectedSubmission.notes && (
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedSubmission.notes}</p>
                </div>
              )}

              {hasPermission('verify_submissions') && selectedSubmission.status === 'pending' && (
                <div className="border-t pt-4 flex space-x-3">
                  <button
                    onClick={() => {
                      handleVerifySubmission(selectedSubmission.id);
                      setSelectedSubmission(null);
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Verify Submission
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Reason for rejection:');
                      if (reason) {
                        handleRejectSubmission(selectedSubmission.id, reason);
                        setSelectedSubmission(null);
                      }
                    }}
                    className="flex-1 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Reject Submission
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}