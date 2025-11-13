import { Users, TrendingUp, MessageCircle } from 'lucide-react'
import { mockInfluencerData } from '../data/mockData'

export default function InfluencerTracking() {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'positive': return 'bg-green-100 text-green-800'
      case 'critical': return 'bg-red-100 text-red-800'
      case 'neutral': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'positive': return '👍'
      case 'critical': return '⚠️'
      case 'neutral': return '➖'
      default: return '➖'
    }
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Key Influencers</h3>
        <Users className="w-5 h-5 text-gray-500" />
      </div>
      
      <div className="space-y-4">
        {mockInfluencerData.map(influencer => (
          <div key={influencer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                {influencer.name.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-gray-900">{influencer.name}</p>
                <p className="text-sm text-gray-600">{influencer.platform}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>{influencer.reach.toLocaleString()}</span>
                </div>
                <p className="text-xs text-gray-500">Reach</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <MessageCircle className="w-4 h-4" />
                  <span>{influencer.engagement}%</span>
                </div>
                <p className="text-xs text-gray-500">Engagement</p>
              </div>
              
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(influencer.type)}`}>
                {getTypeIcon(influencer.type)} {influencer.type}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Engagement Strategy</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Focus on positive influencers for campaign amplification</li>
          <li>• Monitor critical voices for early issue detection</li>
          <li>• Engage neutral influencers with targeted content</li>
        </ul>
      </div>
    </div>
  )
}