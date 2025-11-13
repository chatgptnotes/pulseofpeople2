import { Wifi, WifiOff, Clock } from 'lucide-react';
import { useRealTime } from '../contexts/RealTimeContext';

export default function RealTimeIndicator() {
  const { isConnected, lastUpdate, reconnect } = useRealTime();

  const formatLastUpdate = (date: Date | null) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    return date.toLocaleTimeString();
  };

  return (
    <div className="flex items-center space-x-2 text-sm">
      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${
        isConnected 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {isConnected ? (
          <Wifi className="w-3 h-3" />
        ) : (
          <WifiOff className="w-3 h-3" />
        )}
        <span className="text-xs font-medium">
          {isConnected ? 'Live' : 'Offline'}
        </span>
      </div>
      
      {lastUpdate && (
        <div className="flex items-center space-x-1 text-gray-600">
          <Clock className="w-3 h-3" />
          <span className="text-xs">
            {formatLastUpdate(lastUpdate)}
          </span>
        </div>
      )}
      
      {!isConnected && (
        <button
          onClick={reconnect}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          Reconnect
        </button>
      )}
    </div>
  );
}