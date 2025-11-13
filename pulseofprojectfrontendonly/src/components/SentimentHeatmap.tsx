import { Fragment } from 'react'
import { mockHeatmapData } from '../data/mockData'

export default function SentimentHeatmap() {
  const wards = [...new Set(mockHeatmapData.map(d => d.ward))].sort()
  const issues = [...new Set(mockHeatmapData.map(d => d.issue))]

  const getHeatmapValue = (ward: string, issue: string) => {
    const data = mockHeatmapData.find(d => d.ward === ward && d.issue === issue)
    return data ? data.sentiment : 0
  }

  const getHeatmapColor = (value: number) => {
    if (value >= 0.8) return 'bg-green-700'
    if (value >= 0.6) return 'bg-green-500'
    if (value >= 0.4) return 'bg-yellow-400'
    if (value >= 0.2) return 'bg-orange-400'
    return 'bg-red-500'
  }

  const getTextColor = (value: number) => {
    return value >= 0.5 ? 'text-white' : 'text-gray-900'
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Sentiment Heatmap</h3>
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="grid grid-cols-6 gap-1 text-xs">
            <div className="p-2 font-semibold text-center bg-gray-100"></div>
            {wards.map(ward => (
              <div key={ward} className="p-2 font-semibold text-center bg-gray-100">
                {ward}
              </div>
            ))}
            
            {issues.map(issue => (
              <Fragment key={issue}>
                <div className="p-2 font-semibold text-right bg-gray-100">
                  {issue}
                </div>
                {wards.map(ward => {
                  const value = getHeatmapValue(ward, issue)
                  return (
                    <div
                      key={`${ward}-${issue}`}
                      className={`p-2 text-center font-medium ${getHeatmapColor(value)} ${getTextColor(value)}`}
                      title={`${ward} - ${issue}: ${value.toFixed(2)}`}
                    >
                      {value.toFixed(1)}
                    </div>
                  )
                })}
              </Fragment>
            ))}
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sentiment Score:</span>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-xs">0.0</span>
                <div className="flex space-x-1">
                  <div className="w-4 h-4 bg-orange-400 rounded"></div>
                  <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <div className="w-4 h-4 bg-green-700 rounded"></div>
                </div>
                <span className="text-xs">1.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}