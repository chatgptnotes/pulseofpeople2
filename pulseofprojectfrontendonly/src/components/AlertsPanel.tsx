import { AlertTriangle, AlertCircle, Info, Clock } from 'lucide-react'
import { mockAlertData } from '../data/mockData'

export default function AlertsPanel() {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="w-5 h-5 text-red-500" />
      case 'medium': return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case 'low': return <Info className="w-5 h-5 text-blue-500" />
      default: return <Info className="w-5 h-5 text-gray-500" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-red-200 bg-red-50'
      case 'medium': return 'border-yellow-200 bg-yellow-50'
      case 'low': return 'border-blue-200 bg-blue-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Alerts</h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">Live</span>
        </div>
      </div>

      <div className="space-y-3">
        {mockAlertData.map(alert => (
          <div key={alert.id} className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}>
            <div className="flex items-start space-x-3">
              {getSeverityIcon(alert.severity)}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">{alert.title}</h4>
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{formatTimeAgo(alert.timestamp)}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                
                <div className="flex items-center space-x-4 mt-2">
                  {alert.ward && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      📍 {alert.ward}
                    </span>
                  )}
                  {alert.issue && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      🏷️ {alert.issue}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-indigo-50 rounded-lg">
        <h4 className="font-medium text-indigo-900 mb-2">AI Recommendations</h4>
        <ul className="text-sm text-indigo-800 space-y-1">
          <li>• Schedule youth-focused event in Ward 5 within 48 hours</li>
          <li>• Amplify infrastructure success stories on social media</li>
          <li>• Monitor healthcare discussions for emerging concerns</li>
        </ul>
      </div>
    </div>
  )
}