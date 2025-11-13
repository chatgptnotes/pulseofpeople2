import { useState, useEffect, useCallback } from 'react';
import { DemoService } from '../services/demoService';
import type { DemoRequest, CreateDemoRequest, DemoRequestStatus } from '../types/demo';

export interface UseDemoRequestsOptions {
  status?: DemoRequestStatus;
  limit?: number;
  orderBy?: 'created_at' | 'name' | 'email';
  orderDirection?: 'asc' | 'desc';
  realtime?: boolean;
}

export interface UseDemoRequestsReturn {
  demoRequests: DemoRequest[];
  loading: boolean;
  error: string | null;
  createDemoRequest: (data: CreateDemoRequest) => Promise<DemoRequest>;
  updateDemoRequestStatus: (id: number, status: DemoRequestStatus) => Promise<void>;
  refreshDemoRequests: () => Promise<void>;
  stats: Record<DemoRequestStatus, number> | null;
}

export function useDemoRequests(options: UseDemoRequestsOptions = {}): UseDemoRequestsReturn {
  const [demoRequests, setDemoRequests] = useState<DemoRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Record<DemoRequestStatus, number> | null>(null);

  const fetchDemoRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const requests = await DemoService.getDemoRequests({
        status: options.status,
        limit: options.limit,
        orderBy: options.orderBy,
        orderDirection: options.orderDirection,
      });

      setDemoRequests(requests);

      // Fetch stats if no specific status filter is applied
      if (!options.status) {
        const requestStats = await DemoService.getDemoRequestsStats();
        setStats(requestStats);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch demo requests');
    } finally {
      setLoading(false);
    }
  }, [options.status, options.limit, options.orderBy, options.orderDirection]);

  const createDemoRequest = useCallback(async (data: CreateDemoRequest): Promise<DemoRequest> => {
    try {
      const newRequest = await DemoService.createDemoRequest(data);
      await fetchDemoRequests(); // Refresh the list
      return newRequest;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create demo request';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchDemoRequests]);

  const updateDemoRequestStatus = useCallback(async (id: number, status: DemoRequestStatus): Promise<void> => {
    try {
      await DemoService.updateDemoRequestStatus(id, status);
      await fetchDemoRequests(); // Refresh the list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update demo request status';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchDemoRequests]);

  const refreshDemoRequests = useCallback(async (): Promise<void> => {
    await fetchDemoRequests();
  }, [fetchDemoRequests]);

  useEffect(() => {
    fetchDemoRequests();
  }, [fetchDemoRequests]);

  // Set up real-time subscription if enabled
  useEffect(() => {
    if (!options.realtime) return;

    const subscription = DemoService.subscribeToChanges((payload) => {
      console.log('Demo request change detected:', payload);
      // Refresh data when changes occur
      fetchDemoRequests();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [options.realtime, fetchDemoRequests]);

  return {
    demoRequests,
    loading,
    error,
    createDemoRequest,
    updateDemoRequestStatus,
    refreshDemoRequests,
    stats,
  };
}