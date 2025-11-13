import { useState, useEffect, useCallback } from 'react';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  isStale: boolean;
}

interface UseApiOptions {
  immediate?: boolean;
  refreshInterval?: number;
  retryCount?: number;
  retryDelay?: number;
}

export function useApi<T>(
  apiCall: () => Promise<T>,
  options: UseApiOptions = {}
): UseApiState<T> & { refetch: () => Promise<void>; clearError: () => void } {
  const { immediate = true, refreshInterval, retryCount = 3, retryDelay = 1000 } = options;
  
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
    isStale: false
  });

  const fetchData = useCallback(async (attempt = 0) => {
    if (attempt === 0) {
      setState(prev => ({ ...prev, loading: true, error: null, isStale: false }));
    }
    
    try {
      const result = await apiCall();
      setState({ data: result, loading: false, error: null, isStale: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      
      if (attempt < retryCount) {
        console.warn(`API call failed, retrying... (${attempt + 1}/${retryCount})`);
        setTimeout(() => fetchData(attempt + 1), retryDelay * Math.pow(2, attempt));
      } else {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: errorMessage,
          isStale: prev.data !== null
        }));
      }
    }
  }, [apiCall, retryCount, retryDelay]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [fetchData, immediate]);

  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      const interval = setInterval(() => fetchData(), refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval]);

  return {
    ...state,
    refetch: () => fetchData(),
    clearError
  };
}