import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { dashboardService } from '../services/dashboardService';

export default function SentimentByIssue() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const issueData = await dashboardService.getIssueSentiment();
      const formattedData = issueData.map((item) => ({
        issue: item.issue,
        sentiment: item.sentiment,
        color: item.sentiment > 0.6 ? '#22c55e' : item.sentiment > 0.5 ? '#3b82f6' : '#ef4444',
      }));
      setData(formattedData);
    } catch (error) {
      console.error('Failed to load issue sentiment:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Sentiment by Issue</h3>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Sentiment by Issue</h3>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis 
              dataKey="issue" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              domain={[0, 1]}
              tick={{ fontSize: 12 }}
              label={{ value: 'Sentiment Score', angle: -90, position: 'insideLeft' }}
            />
            <Bar 
              dataKey="sentiment" 
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}