import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { djangoApi } from '../../services/djangoApi';
import {
  MapPin, Users, MessageSquare, TrendingUp, CheckCircle,
  AlertCircle, BarChart3, FileText, UserCheck, Map
} from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Analyst Dashboard - Constituency Level
 *
 * Geographic Scope: Assigned Constituency ONLY (e.g., Perambur)
 * - Constituency sentiment overview
 * - Wards/Booths within constituency (200-300 booths)
 * - Booth performance tracking
 * - Manage booth agents
 * - Issue tracking for constituency
 * - Field reports from booths
 */
export default function AnalystConstituencyDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [constituencyName, setConstituencyName] = useState('Perambur'); // TODO: Get from user profile
  const [districtName, setDistrictName] = useState('Chennai');
  const [stats, setStats] = useState({
    constituencySentiment: 0,
    totalFeedback: 0,
    boothsActive: 0,
    totalBooths: 250,
    activeBoothAgents: 0,
    coveragePercentage: 0,
    pendingReports: 0,
  });

  const [booths, setBooths] = useState<any[]>([]);
  const [topIssues, setTopIssues] = useState<any[]>([]);

  useEffect(() => {
    loadConstituencyDashboard();
  }, []);

  const loadConstituencyDashboard = async () => {
    try {
      setLoading(true);

      // TODO: Get constituency code from user profile
      const constituencyCode = 'TN001'; // Placeholder

      // Load constituency analytics from Django
      const constituencyAnalytics = await djangoApi.getConstituencyAnalytics(constituencyCode);

      // Load issues
      const issuesData = await djangoApi.getIssues();

      setStats({
        constituencySentiment: constituencyAnalytics.sentiment_score || 0.71,
        totalFeedback: constituencyAnalytics.total_feedback || 0,
        boothsActive: 187,
        totalBooths: 250,
        activeBoothAgents: 187,
        coveragePercentage: 75,
        pendingReports: 23,
      });

      // Mock booth data
      setBooths([
        { id: 1, number: 'B-001', ward: 'Ward 1', sentiment: 0.75, feedback: 45, agent: 'Ravi Kumar', status: 'active' },
        { id: 2, number: 'B-002', ward: 'Ward 1', sentiment: 0.68, feedback: 38, agent: 'Priya M', status: 'active' },
        { id: 3, number: 'B-003', ward: 'Ward 2', sentiment: 0.82, feedback: 52, agent: 'Kumar S', status: 'active' },
        { id: 4, number: 'B-004', ward: 'Ward 2', sentiment: 0.45, feedback: 12, agent: 'Lakshmi R', status: 'inactive' },
        { id: 5, number: 'B-005', ward: 'Ward 3', sentiment: 0.71, feedback: 41, agent: 'Murugan V', status: 'active' },
      ]);

      setTopIssues(issuesData.slice(0, 5));

      setLoading(false);
    } catch (error) {
      console.error('Error loading constituency dashboard:', error);
      setLoading(false);
    }
  };

  const getSentimentColor = (score: number) => {
    if (score >= 0.7) return 'bg-green-100 text-green-800';
    if (score >= 0.5) return 'bg-yellow-100 text-yellow-800';
    if (score >= 0.3) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getStatusBadge = (status: string) => {
    return status === 'active'
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading constituency dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header with Breadcrumb */}
      <div className="mb-8">
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <MapPin className="h-4 w-4 mr-1" />
          <span>Tamil Nadu</span>
          <span className="mx-2">→</span>
          <span>{districtName} District</span>
          <span className="mx-2">→</span>
          <span className="font-medium text-gray-900">{constituencyName} Constituency</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">{constituencyName} Constituency Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back, {user?.name}. Managing {constituencyName} constituency operations.
        </p>
      </div>

      {/* Constituency Sentiment Overview */}
      <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-lg shadow-lg p-6 mb-8 text-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-medium text-green-100 mb-2">Constituency Sentiment</h3>
            <p className="text-3xl font-bold">{(stats.constituencySentiment * 100).toFixed(1)}%</p>
            <p className="text-sm text-green-100 mt-1">Strong Positive</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-green-100 mb-2">Total Feedback</h3>
            <p className="text-3xl font-bold">{stats.totalFeedback.toLocaleString()}</p>
            <p className="text-sm text-green-100 mt-1">+12% this week</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-green-100 mb-2">Booth Coverage</h3>
            <p className="text-3xl font-bold">{stats.coveragePercentage}%</p>
            <p className="text-sm text-green-100 mt-1">{stats.boothsActive} of {stats.totalBooths} booths</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Booths</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {stats.boothsActive} / {stats.totalBooths}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Booth Agents</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.activeBoothAgents}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Feedback</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalFeedback}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Reports</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.pendingReports}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link
          to="/tamil-nadu-map"
          className="bg-white rounded-lg shadow-sm border-2 border-gray-200 p-6 hover:border-green-500 hover:shadow-md transition-all"
        >
          <div className="flex items-center">
            <Map className="h-10 w-10 text-green-500 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Constituency Map</h3>
              <p className="text-sm text-gray-600 mt-1">
                View wards → booths in {constituencyName}
              </p>
            </div>
          </div>
        </Link>

        <Link
          to="/field-workers"
          className="bg-white rounded-lg shadow-sm border-2 border-gray-200 p-6 hover:border-blue-500 hover:shadow-md transition-all"
        >
          <div className="flex items-center">
            <UserCheck className="h-10 w-10 text-blue-500 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Manage Booth Agents</h3>
              <p className="text-sm text-gray-600 mt-1">
                Assign tasks and track performance
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Booth Performance Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Booth Performance</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booth
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ward
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sentiment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Feedback
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {booths.map((booth) => (
                <tr key={booth.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{booth.number}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{booth.ward}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{booth.agent}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getSentimentColor(booth.sentiment)}`}>
                      {(booth.sentiment * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {booth.feedback}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(booth.status)}`}>
                      {booth.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Issues in Constituency */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Issues in {constituencyName}</h2>
        <div className="space-y-4">
          {topIssues.map((issue, index) => (
            <div key={issue.id} className="flex items-center justify-between">
              <div className="flex items-center flex-1">
                <span className="text-lg font-bold text-gray-400 mr-4">#{index + 1}</span>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{issue.name}</p>
                  <div className="mt-2 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-green-500 h-full"
                      style={{ width: `${70 - index * 10}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <span className="ml-4 text-sm font-medium text-gray-600">
                {70 - index * 10}% mentions
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Last updated: {new Date().toLocaleString()}</p>
        <p className="mt-1">Geographic Scope: {constituencyName} Constituency • {stats.totalBooths} Polling Booths</p>
      </div>
    </div>
  );
}
