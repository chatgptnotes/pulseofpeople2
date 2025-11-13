import React from 'react';
import BoothsMapComponent from '../components/BoothsMap';

export default function BoothsMapPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Polling Booths Map</h1>
        <p className="text-gray-600">Interactive map showing all polling booths with GPS coordinates</p>
      </div>

      <BoothsMapComponent height="700px" />
    </div>
  );
}
