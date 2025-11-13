import React from 'react';
import { MessageCircle, Users, TrendingUp, Eye, Heart, Share2 } from 'lucide-react';

export default function SocialMediaMonitoring() {
  const platforms = [
    { name: 'Twitter', followers: '125K', engagement: '4.2%', mentions: 1250, sentiment: 0.68 },
    { name: 'Facebook', followers: '89K', engagement: '3.8%', mentions: 890, sentiment: 0.54 },
    { name: 'Instagram', followers: '56K', engagement: '6.1%', mentions: 450, sentiment: 0.72 },
    { name: 'YouTube', followers: '34K', engagement: '2.9%', mentions: 180, sentiment: 0.58 },
  ];

  const recentMentions = [
    { platform: 'Twitter', user: '@voter_voice', content: 'Great initiative on education reform!', sentiment: 'positive', time: '2 min ago' },
    { platform: 'Facebook', user: 'John Doe', content: 'Need more transparency in government', sentiment: 'neutral', time: '5 min ago' },
    { platform: 'Instagram', user: '@young_voters', content: 'Love the new healthcare proposals', sentiment: 'positive', time: '8 min ago' },
    { platform: 'Twitter', user: '@concerned_citizen', content: 'Infrastructure needs immediate attention', sentiment: 'negative', time: '12 min ago' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {platforms.map((platform, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{platform.name}</h3>
              <MessageCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Followers</span>
                <span className="font-medium">{platform.followers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Engagement</span>
                <span className="font-medium">{platform.engagement}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Mentions</span>
                <span className="font-medium">{platform.mentions}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Sentiment</span>
                <span className={`font-medium ${
                  platform.sentiment > 0.6 ? 'text-green-600' : 
                  platform.sentiment > 0.4 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {Math.round(platform.sentiment * 100)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Mentions</h3>
          <div className="space-y-4">
            {recentMentions.map((mention, index) => (
              <div key={index} className="border-l-4 border-gray-200 pl-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">{mention.platform}</span>
                    <span className="text-sm text-gray-600">• {mention.user}</span>
                  </div>
                  <span className="text-xs text-gray-500">{mention.time}</span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{mention.content}</p>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  mention.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                  mention.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {mention.sentiment}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trending Topics</h3>
          <div className="space-y-3">
            {[
              { topic: '#EducationReform', mentions: 1250, trend: 'up' },
              { topic: '#HealthcareForAll', mentions: 980, trend: 'up' },
              { topic: '#JobCreation', mentions: 856, trend: 'down' },
              { topic: '#CleanEnvironment', mentions: 642, trend: 'up' },
              { topic: '#DigitalIndia', mentions: 534, trend: 'stable' },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{item.topic}</div>
                  <div className="text-sm text-gray-600">{item.mentions} mentions</div>
                </div>
                <div className={`flex items-center ${
                  item.trend === 'up' ? 'text-green-600' : 
                  item.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  <TrendingUp className={`w-4 h-4 ${
                    item.trend === 'down' ? 'transform rotate-180' : ''
                  }`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
