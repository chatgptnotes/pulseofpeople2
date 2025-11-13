import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { realTimeService } from '../services/realTimeService';

interface RealTimeContextType {
  isConnected: boolean;
  lastUpdate: Date | null;
  reconnect: () => void;
  subscribe: <T>(channel: string, callback: (data: T) => void) => () => void;
}

const RealTimeContext = createContext<RealTimeContextType | undefined>(undefined);

interface RealTimeProviderProps {
  children: ReactNode;
}

export function RealTimeProvider({ children }: RealTimeProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    const initializeConnection = async () => {
      try {
        await realTimeService.connect();
        setIsConnected(true);
      } catch (error) {
        console.error('Failed to connect to real-time service:', error);
        setIsConnected(false);
      }
    };

    initializeConnection();

    const statusCheckInterval = setInterval(() => {
      const status = realTimeService.getConnectionStatus();
      setIsConnected(status);
    }, 5000);

    return () => {
      clearInterval(statusCheckInterval);
      realTimeService.disconnect();
    };
  }, []);

  const reconnect = async () => {
    try {
      await realTimeService.connect();
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to reconnect:', error);
      setIsConnected(false);
    }
  };

  const subscribe = <T,>(channel: string, callback: (data: T) => void) => {
    const wrappedCallback = (data: T) => {
      setLastUpdate(new Date());
      callback(data);
    };

    return realTimeService.subscribe(channel, wrappedCallback);
  };

  const value: RealTimeContextType = {
    isConnected,
    lastUpdate,
    reconnect,
    subscribe
  };

  return (
    <RealTimeContext.Provider value={value}>
      {children}
    </RealTimeContext.Provider>
  );
}

export function useRealTime(): RealTimeContextType {
  const context = useContext(RealTimeContext);
  if (context === undefined) {
    throw new Error('useRealTime must be used within a RealTimeProvider');
  }
  return context;
}