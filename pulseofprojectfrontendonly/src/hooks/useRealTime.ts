import { useState, useEffect, useCallback } from 'react';

interface RealTimeConfig {
  enabled: boolean;
  interval: number;
}

export function useRealTime<T>(
  dataFetcher: () => Promise<T>,
  config: RealTimeConfig = { enabled: true, interval: 30000 }
) {
  const [data, setData] = useState<T | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const newData = await dataFetcher();
      setData(newData);
      setLastUpdate(new Date());
      setIsConnected(true);
    } catch (error) {
      console.error('Real-time data fetch error:', error);
      setIsConnected(false);
    }
  }, [dataFetcher]);

  useEffect(() => {
    if (!config.enabled) return;

    fetchData();
    const interval = setInterval(fetchData, config.interval);

    return () => clearInterval(interval);
  }, [fetchData, config.enabled, config.interval]);

  const reconnect = useCallback(() => {
    if (config.enabled) {
      fetchData();
    }
  }, [fetchData, config.enabled]);

  return {
    data,
    isConnected,
    lastUpdate,
    reconnect
  };
}