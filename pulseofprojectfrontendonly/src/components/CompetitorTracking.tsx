import React from 'react';
import { TrendingUp, TrendingDown, Users, MessageCircle, Eye, Target } from 'lucide-react';

export default function CompetitorTracking() {
  const competitors = [
    {
      name: 'Party A',
      sentiment: 0.72,
      mentions: 2150,
      reach: 125000,
      engagement: 4.2,
      trend: 'up',
      change: 5.3
    },
    {
      name: 'Party B',
      sentiment: 0.58,
      mentions: 1890,
      reach: 98000,
      engagement: 3.8,
      trend: 'down',
      change: -2.1
    },
    {
      name: 'Party C',
      sentiment: 0.65,
      mentions: 1650,
      reach: 87000,
      engagement: 3.5,
      trend: 'up',
      change: 1.8
    },
    {
      name: 'Independent Candidate',
      sentiment: 0.61,
      mentions: 890,
      reach: 45000,
      engagement: 5.1,
      trend: 'up',
      change: 8.2
    }
  ];

  const competitorIssues = [
    { issue: 'Education', party: 'Party A', sentiment: 0.78, volume: 450 },
    { issue: 'Healthcare', party: 'Party B', sentiment: 0.65, volume: 380 },
    { issue: 'Jobs', party: 'Party A', sentiment: 0.72, volume: 520 },
    { issue: 'Infrastructure', party: 'Party C', sentiment: 0.68, volume: 290 },
    { issue: 'Environment', party: 'Independent', sentiment: 0.75, volume: 180 },
  ];

  const campaigns = [
    {
      competitor: 'Party A',
      campaign: 'Digital Education Initiative',
      reach: 85000,
      engagement: 6.2,
      sentiment: 0.74,
      status: 'active'
    },
    {
      competitor: 'Party B',
      campaign: 'Healthcare Access Program',
      reach: 62000,
      engagement: 4.8,
      sentiment: 0.61,
      status: 'active'
    },
    {
      competitor: 'Party C',
      campaign: 'Green Infrastructure Plan',
      reach: 45000,
      engagement: 5.5,
      sentiment: 0.69,
      status: 'paused'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Competitor Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {competitors.map((competitor, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{competitor.name}</h3>
              <div className={`flex items-center ${
                competitor.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {competitor.trend === 'up' ? 
                  <TrendingUp className="w-5 h-5" /> : 
                  <TrendingDown className="w-5 h-5" />
                }
                <span className="ml-1 text-sm font-medium">
                  {competitor.change > 0 ? '+' : ''}{competitor.change}%
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Sentiment</span>
                <span className={`font-medium ${
                  competitor.sentiment > 0.6 ? 'text-green-600' : 
                  competitor.sentiment > 0.4 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {Math.round(competitor.sentiment * 100)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Mentions</span>
                <span className="font-medium">{competitor.mentions.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Reach</span>
                <span className="font-medium">{(competitor.reach / 1000).toFixed(0)}K</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Engagement</span>
                <span className="font-medium">{competitor.engagement}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Issue Comparison */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Issue Performance Comparison</h3>
          <div className="space-y-4">
            {competitorIssues.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{item.issue}</div>
                  <div className="text-sm text-gray-600">{item.party} • {item.volume} mentions</div>
                </div>
                <div className={`text-lg font-bold ${
                  item.sentiment > 0.6 ? 'text-green-600' : 
                  item.sentiment > 0.4 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {Math.round(item.sentiment * 100)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Campaigns */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Competitor Campaigns</h3>
          <div className="space-y-4">
            {campaigns.map((campaign, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{campaign.campaign}</h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    campaign.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {campaign.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-3">{campaign.competitor}</div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Reach</div>
                    <div className="font-medium">{(campaign.reach / 1000).toFixed(0)}K</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Engagement</div>
                    <div className="font-medium">{campaign.engagement}%</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Sentiment</div>
                    <div className={`font-medium ${
                      campaign.sentiment > 0.6 ? 'text-green-600' : 
                      campaign.sentiment > 0.4 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {Math.round(campaign.sentiment * 100)}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Competitive Intelligence */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Competitive Intelligence Alerts</h3>
        <div className="space-y-3">
          {[
            {
              type: 'campaign',
              message: 'Party A launched new education campaign with 25% engagement spike',
              time: '2 hours ago',
              severity: 'high'
            },
            {
              type: 'sentiment',
              message: 'Party B sentiment dropped 5% after recent policy announcement',
              time: '4 hours ago',
              severity: 'medium'
            },
            {
              type: 'reach',
              message: 'Independent candidate gained 10K new followers this week',
              time: '1 day ago',
              severity: 'low'
            },
            {
              type: 'issue',
              message: 'Healthcare becoming trending topic for Party B supporters',
              time: '2 days ago',
              severity: 'medium'
            },
          ].map((alert, index) => (
            <div key={index} className={`flex items-start p-3 rounded-lg border-l-4 ${
              alert.severity === 'high' ? 'bg-red-50 border-red-400' :
              alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-400' :
              'bg-blue-50 border-blue-400'
            }`}>
              <div className={`w-2 h-2 rounded-full mt-2 mr-3 ${
                alert.severity === 'high' ? 'bg-red-400' :
                alert.severity === 'medium' ? 'bg-yellow-400' :
                'bg-blue-400'
              }`}></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">{alert.message}</p>
                <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
