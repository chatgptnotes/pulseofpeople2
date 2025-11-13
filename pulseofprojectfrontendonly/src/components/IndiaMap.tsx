import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    AmCharts: any;
  }
}

interface IndiaMapProps {
  data?: Array<{
    id: string;
    title: string;
    value: number;
    sentiment?: number;
  }>;
  height?: number;
}

export default function IndiaMap({ data = [], height = 400 }: IndiaMapProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!chartRef.current || typeof window.AmCharts === 'undefined') {
      return;
    }

    // Clear any existing map
    if (mapRef.current) {
      mapRef.current.clear();
    }

    const map = new window.AmCharts.AmMap();
    map.panEventsEnabled = true;
    map.backgroundColor = "#f8fafc";
    map.backgroundAlpha = 1;

    map.zoomControl.panControlEnabled = true;
    map.zoomControl.zoomControlEnabled = true;

    const dataProvider = {
      map: "indiaLow",
      getAreasFromMap: true,
      areas: data.map(item => ({
        id: item.id,
        title: item.title,
        value: item.value,
        sentiment: item.sentiment || 0,
        color: getSentimentColor(item.sentiment || 0)
      }))
    };

    map.dataProvider = dataProvider;

    map.areasSettings = {
      autoZoom: false,
      color: "#e2e8f0",
      colorSolid: "#3b82f6",
      selectedColor: "#1d4ed8",
      outlineColor: "#64748b",
      rollOverColor: "#60a5fa",
      rollOverOutlineColor: "#1e40af",
      selectable: true,
      balloonText: "[[title]]: [[sentiment]]% sentiment"
    };

    map.addListener('clickMapObject', function(event: any) {
      map.selectedObject = map.dataProvider;
      event.mapObject.showAsSelected = !event.mapObject.showAsSelected;
      map.returnInitialColor(event.mapObject);

      const selectedStates = [];
      for (const area of map.dataProvider.areas || []) {
        if (area.showAsSelected) {
          selectedStates.push(area.title);
        }
      }
      
      console.log('Selected states:', selectedStates);
    });

    map.export = {
      enabled: true
    };

    map.write(chartRef.current);
    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.clear();
      }
    };
  }, [data]);

  const getSentimentColor = (sentiment: number): string => {
    if (sentiment >= 0.7) return "#10b981"; // green
    if (sentiment >= 0.5) return "#f59e0b"; // yellow
    if (sentiment >= 0.3) return "#f97316"; // orange
    return "#ef4444"; // red
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Regional Sentiment Map</h3>
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
      
      <div 
        ref={chartRef}
        style={{ width: '100%', height: `${height}px` }}
        className="border border-gray-100 rounded"
      />
      
      <p className="text-xs text-gray-500 mt-2">
        Click on states to select/deselect them. Hover for detailed sentiment information.
      </p>
    </div>
  );
}