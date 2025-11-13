import React, { useState } from 'react';
import { MapPin, Camera, Mic, Users, Send } from 'lucide-react';

export default function FieldWorkerApp() {
  const [location, setLocation] = useState('');
  const [report, setReport] = useState('');

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Field Worker Data Collection</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter location"
              className="flex-1 p-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Field Report
          </label>
          <textarea
            value={report}
            onChange={(e) => setReport(e.target.value)}
            placeholder="Enter your observations..."
            rows={4}
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button className="flex items-center justify-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Camera className="w-5 h-5 text-gray-600" />
          </button>
          <button className="flex items-center justify-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Mic className="w-5 h-5 text-gray-600" />
          </button>
          <button className="flex items-center justify-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Users className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <button className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700">
          <Send className="w-4 h-4" />
          <span>Submit Report</span>
        </button>
      </div>
    </div>
  );
}

