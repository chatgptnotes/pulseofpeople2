import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { djangoApi } from '../../services/djangoApi';
import {
  MapPin, Users, MessageSquare, TrendingUp, FileText,
  CheckCircle, Camera, ClipboardList, Award, Target
} from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * User Dashboard - Booth Level (Booth Agent/Field Worker)
 *
 * Geographic Scope: Assigned Booth(s) ONLY (e.g., Booth B-456)
 * - Booth-level metrics
 * - Collect feedback (primary function)
 * - Submit daily field reports
 * - Track assigned voters
 * - View performance metrics
 * - Simple, mobile-friendly interface
 */
export default function UserBoothDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [boothNumber, setBoothNumber] = useState('B-456'); // TODO: Get from user profile
  const [constituencyName, setConstituencyName] = useState('Perambur');
  const [districtName, setDistrictName] = useState('Chennai');
  const [stats, setStats] = useState({
    todayFeedback: 0,
    weekFeedback: 0,
    totalFeedback: 0,
    votersContacted: 0,
    totalVoters: 850,
    boothSentiment: 0,
    myPerformance: 0,
    tasksCompleted: 0,
    tasksPending: 0,
  });

  const [recentFeedback, setRecentFeedback] = useState<any[]>([]);
  const [todayTasks, setTodayTasks] = useState<any[]>([]);

  useEffect(() => {
    loadBoothDashboard();
  }, []);

  const loadBoothDashboard = async () => {
    try {
      setLoading(true);

      // TODO: Get booth ID from user profile
      // For now using mock data

      setStats({
        todayFeedback: 12,
        weekFeedback: 67,
        totalFeedback: 234,
        votersContacted: 520,
        totalVoters: 850,
        boothSentiment: 0.73,
        myPerformance: 85,
        tasksCompleted: 8,
        tasksPending: 3,
      });

      // Mock recent feedback
      setRecentFeedback([
        {
          id: 1,
          name: 'Rajesh Kumar',
          sentiment: 'positive',
          issue: 'Jobs',
          time: '10 mins ago',
        },
        {
          id: 2,
          name: 'Lakshmi S',
          sentiment: 'neutral',
          issue: 'Healthcare',
          time: '1 hour ago',
        },
        {
          id: 3,
          name: 'Murugan V',
          sentiment: 'positive',
          issue: 'Education',
          time: '2 hours ago',
        },
      ]);

      // Mock today's tasks
      setTodayTasks([
        { id: 1, task: 'Visit Ward 5 households', completed: true },
        { id: 2, task: 'Collect 15 feedback forms', completed: true },
        { id: 3, task: 'Submit daily field report', completed: false },
        { id: 4, task: 'Attend evening meeting', completed: false },
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Error loading booth dashboard:', error);
      setLoading(false);
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    if (sentiment === 'positive') return '😊';
    if (sentiment === 'neutral') return '😐';
    return '😟';
  };

  const getSentimentColor = (sentiment: string) => {
    if (sentiment === 'positive') return 'bg-green-100 text-green-800';
    if (sentiment === 'neutral') return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your booth dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{districtName}</span>
          <span className="mx-2">→</span>
          <span>{constituencyName}</span>
          <span className="mx-2">→</span>
          <span className="font-medium text-gray-900">Booth {boothNumber}</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Booth Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back, {user?.name}! Track your daily field work.
        </p>
      </div>

      {/* Performance Card */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-blue-100 mb-2">My Performance Score</h3>
            <p className="text-4xl font-bold">{stats.myPerformance}%</p>
            <p className="text-sm text-blue-100 mt-2">Keep up the great work!</p>
          </div>
          <Award className="h-16 w-16 opacity-50" />
        </div>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-600 mb-2">Today's Feedback</p>
          <p className="text-2xl font-bold text-gray-900">{stats.todayFeedback}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-600 mb-2">This Week</p>
          <p className="text-2xl font-bold text-gray-900">{stats.weekFeedback}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-600 mb-2">Total Feedback</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalFeedback}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-600 mb-2">Voters Met</p>
          <p className="text-2xl font-bold text-gray-900">{stats.votersContacted}</p>
          <p className="text-xs text-gray-500">of {stats.totalVoters}</p>
        </div>
      </div>

      {/* Quick Actions - MOST IMPORTANT */}
      <div className="bg-white rounded-lg shadow-md border-2 border-blue-500 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/submit-data"
            className="flex items-center p-4 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <MessageSquare className="h-8 w-8 text-blue-600 mr-4" />
            <div>
              <p className="font-semibold text-gray-900">Collect Feedback</p>
              <p className="text-sm text-gray-600">Submit voter feedback form</p>
            </div>
          </Link>

          <Link
            to="/data-tracking"
            className="flex items-center p-4 bg-green-50 border-2 border-green-200 rounded-lg hover:bg-green-100 transition-colors"
          >
            <FileText className="h-8 w-8 text-green-600 mr-4" />
            <div>
              <p className="font-semibold text-gray-900">Daily Report</p>
              <p className="text-sm text-gray-600">Submit field visit report</p>
            </div>
          </Link>

          <Link
            to="/voter-database"
            className="flex items-center p-4 bg-purple-50 border-2 border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <Users className="h-8 w-8 text-purple-600 mr-4" />
            <div>
              <p className="font-semibold text-gray-900">My Voters</p>
              <p className="text-sm text-gray-600">View assigned voters list</p>
            </div>
          </Link>

          <Link
            to="/submit-data"
            className="flex items-center p-4 bg-orange-50 border-2 border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
          >
            <Camera className="h-8 w-8 text-orange-600 mr-4" />
            <div>
              <p className="font-semibold text-gray-900">Upload Photo</p>
              <p className="text-sm text-gray-600">Add field photos</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Today's Tasks */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Today's Tasks</h2>
          <span className="text-sm text-gray-600">
            {stats.tasksCompleted} / {stats.tasksCompleted + stats.tasksPending} completed
          </span>
        </div>
        <div className="space-y-3">
          {todayTasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center p-3 rounded-lg ${
                task.completed ? 'bg-green-50' : 'bg-gray-50'
              }`}
            >
              {task.completed ? (
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
              ) : (
                <div className="h-5 w-5 border-2 border-gray-400 rounded-full mr-3"></div>
              )}
              <span
                className={`text-sm ${
                  task.completed ? 'text-gray-500 line-through' : 'text-gray-900 font-medium'
                }`}
              >
                {task.task}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Feedback Collected */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Feedback Collected</h2>
        <div className="space-y-4">
          {recentFeedback.map((feedback) => (
            <div key={feedback.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="text-2xl mr-3">{getSentimentIcon(feedback.sentiment)}</div>
                <div>
                  <p className="font-medium text-gray-900">{feedback.name}</p>
                  <p className="text-sm text-gray-500">Issue: {feedback.issue}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getSentimentColor(feedback.sentiment)}`}>
                  {feedback.sentiment}
                </span>
                <p className="text-xs text-gray-500 mt-1">{feedback.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Booth Metrics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">My Booth Metrics</h2>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Booth Sentiment</span>
              <span className="text-sm font-bold text-green-600">
                {(stats.boothSentiment * 100).toFixed(0)}% Positive
              </span>
            </div>
            <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-green-500 h-full"
                style={{ width: `${stats.boothSentiment * 100}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Voter Coverage</span>
              <span className="text-sm font-bold text-blue-600">
                {((stats.votersContacted / stats.totalVoters) * 100).toFixed(0)}%
              </span>
            </div>
            <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-500 h-full"
                style={{ width: `${(stats.votersContacted / stats.totalVoters) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Last updated: {new Date().toLocaleString()}</p>
        <p className="mt-1">Booth {boothNumber} • {constituencyName} Constituency • {districtName} District</p>
      </div>
    </div>
  );
}
