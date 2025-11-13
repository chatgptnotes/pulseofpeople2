import React from 'react';
import { MapPin, TrendingUp, TrendingDown } from 'lucide-react';

export default function RegionalMap() {
  // Sample data for states with sentiment scores
  const stateData = [
    { id: 'IN-KL', title: 'Tamil Nadu', value: 74, sentiment: 0.74 },
    { id: 'IN-TN', title: 'Tamil Nadu', value: 68, sentiment: 0.68 },
    { id: 'IN-KA', title: 'Karnataka', value: 71, sentiment: 0.71 },
    { id: 'IN-AP', title: 'Andhra Pradesh', value: 65, sentiment: 0.65 },
    { id: 'IN-TS', title: 'Telangana', value: 69, sentiment: 0.69 },
    { id: 'IN-MH', title: 'Maharashtra', value: 72, sentiment: 0.72 },
    { id: 'IN-GJ', title: 'Gujarat', value: 76, sentiment: 0.76 },
    { id: 'IN-RJ', title: 'Rajasthan', value: 63, sentiment: 0.63 },
    { id: 'IN-MP', title: 'Madhya Pradesh', value: 61, sentiment: 0.61 },
    { id: 'IN-UP', title: 'Uttar Pradesh', value: 58, sentiment: 0.58 },
    { id: 'IN-BR', title: 'Bihar', value: 55, sentiment: 0.55 },
    { id: 'IN-WB', title: 'West Bengal', value: 67, sentiment: 0.67 },
    { id: 'IN-OR', title: 'Odisha', value: 64, sentiment: 0.64 },
    { id: 'IN-JH', title: 'Jharkhand', value: 60, sentiment: 0.60 },
    { id: 'IN-CT', title: 'Chhattisgarh', value: 59, sentiment: 0.59 },
    { id: 'IN-AS', title: 'Assam', value: 62, sentiment: 0.62 },
    { id: 'IN-PB', title: 'Punjab', value: 70, sentiment: 0.70 },
    { id: 'IN-HR', title: 'Haryana', value: 66, sentiment: 0.66 },
    { id: 'IN-DL', title: 'Delhi', value: 73, sentiment: 0.73 },
    { id: 'IN-JK', title: 'Jammu and Kashmir', value: 57, sentiment: 0.57 },
    { id: 'IN-HP', title: 'Himachal Pradesh', value: 68, sentiment: 0.68 },
    { id: 'IN-UK', title: 'Uttarakhand', value: 65, sentiment: 0.65 },
    { id: 'IN-GA', title: 'Goa', value: 75, sentiment: 0.75 },
    { id: 'IN-MN', title: 'Manipur', value: 61, sentiment: 0.61 },
    { id: 'IN-TR', title: 'Tripura', value: 63, sentiment: 0.63 },
    { id: 'IN-MZ', title: 'Mizoram', value: 66, sentiment: 0.66 },
    { id: 'IN-NL', title: 'Nagaland', value: 58, sentiment: 0.58 },
    { id: 'IN-ML', title: 'Meghalaya', value: 60, sentiment: 0.60 },
    { id: 'IN-SK', title: 'Sikkim', value: 69, sentiment: 0.69 },
    { id: 'IN-AR', title: 'Arunachal Pradesh', value: 62, sentiment: 0.62 }
  ];

  const topPerformingStates = stateData
    .sort((a, b) => b.sentiment - a.sentiment)
    .slice(0, 5);

  const needAttentionStates = stateData
    .sort((a, b) => a.sentiment - b.sentiment)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Regional Sentiment Map</h1>
        <p className="text-gray-600">
          Interactive geographical visualization of voter sentiment across Indian states.
          Click on states to select them and view detailed sentiment information.
        </p>
      </div>

      {/* Interactive Map Placeholder */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Regional Sentiment Map
          </h3>
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded mr-1"></div>
              <span>Positive (70%+)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded mr-1"></div>
              <span>Neutral (50-70%)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-orange-500 rounded mr-1"></div>
              <span>Negative (30-50%)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded mr-1"></div>
              <span>Very Negative (&lt;30%)</span>
            </div>
          </div>
        </div>
        
        {/* Map Placeholder */}
        <div className="border border-gray-100 rounded bg-gray-50 flex items-center justify-center" style={{ height: '600px' }}>
          <div className="text-center">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h4 className="text-xl font-semibold text-gray-600 mb-2">Interactive India Map</h4>
            <p className="text-gray-500 max-w-md mx-auto">
              Geographic visualization showing state-wise sentiment analysis across India. 
              AmCharts integration required for full interactive map functionality.
            </p>
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 max-w-4xl mx-auto">
              {stateData.slice(0, 12).map((state) => (
                <div
                  key={state.id}
                  className={`p-2 rounded text-xs text-center border ${
                    state.sentiment >= 0.7 ? 'bg-green-100 border-green-300 text-green-800' :
                    state.sentiment >= 0.5 ? 'bg-yellow-100 border-yellow-300 text-yellow-800' :
                    state.sentiment >= 0.3 ? 'bg-orange-100 border-orange-300 text-orange-800' :
                    'bg-red-100 border-red-300 text-red-800'
                  }`}
                >
                  <div className="font-medium">{state.title}</div>
                  <div className="text-xs">{Math.round(state.sentiment * 100)}%</div>
                </div>
              ))}
              <div className="p-2 text-center text-gray-400 text-xs">
                +{stateData.length - 12} more states...
              </div>
            </div>
          </div>
        </div>
        
        <p className="text-xs text-gray-500 mt-2">
          Interactive map functionality requires AmCharts library. State data is displayed above as cards.
        </p>
      </div>

      {/* State Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Performing States */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            🏆 Top Performing States
          </h3>
          <div className="space-y-3">
            {topPerformingStates.map((state, index) => (
              <div key={state.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <span className="w-6 h-6 bg-green-100 text-green-800 rounded-full flex items-center justify-center text-xs font-medium mr-3">
                    {index + 1}
                  </span>
                  <span className="font-medium text-gray-900">{state.title}</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">
                    {Math.round(state.sentiment * 100)}%
                  </div>
                  <div className="text-xs text-gray-500">sentiment</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* States Needing Attention */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            ⚠️ States Needing Attention
          </h3>
          <div className="space-y-3">
            {needAttentionStates.map((state, index) => (
              <div key={state.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center">
                  <span className="w-6 h-6 bg-red-100 text-red-800 rounded-full flex items-center justify-center text-xs font-medium mr-3">
                    {index + 1}
                  </span>
                  <span className="font-medium text-gray-900">{state.title}</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-red-600">
                    {Math.round(state.sentiment * 100)}%
                  </div>
                  <div className="text-xs text-gray-500">sentiment</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-sm font-medium text-gray-600 mb-1">Average Sentiment</h4>
          <div className="text-2xl font-bold text-blue-600">
            {Math.round((stateData.reduce((sum, state) => sum + state.sentiment, 0) / stateData.length) * 100)}%
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-sm font-medium text-gray-600 mb-1">Positive States</h4>
          <div className="text-2xl font-bold text-green-600">
            {stateData.filter(state => state.sentiment >= 0.7).length}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-sm font-medium text-gray-600 mb-1">Neutral States</h4>
          <div className="text-2xl font-bold text-yellow-600">
            {stateData.filter(state => state.sentiment >= 0.5 && state.sentiment < 0.7).length}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-sm font-medium text-gray-600 mb-1">Critical States</h4>
          <div className="text-2xl font-bold text-red-600">
            {stateData.filter(state => state.sentiment < 0.5).length}
          </div>
        </div>
      </div>

      {/* Map Features */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Map Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h4 className="font-medium mb-2">Interactive Features:</h4>
            <ul className="space-y-1">
              <li>• Click states to select/deselect</li>
              <li>• Hover for detailed information</li>
              <li>• Pan and zoom controls</li>
              <li>• Export map as image</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Color Coding:</h4>
            <ul className="space-y-1">
              <li>• <span className="inline-block w-3 h-3 bg-green-500 rounded mr-1"></span>Green: Positive sentiment (70%+)</li>
              <li>• <span className="inline-block w-3 h-3 bg-yellow-500 rounded mr-1"></span>Yellow: Neutral sentiment (50-70%)</li>
              <li>• <span className="inline-block w-3 h-3 bg-orange-500 rounded mr-1"></span>Orange: Negative sentiment (30-50%)</li>
              <li>• <span className="inline-block w-3 h-3 bg-red-500 rounded mr-1"></span>Red: Critical sentiment (&lt;30%)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}