import { supabase } from '../lib/supabase';
import type { DemoRequest, CreateDemoRequest, UpdateDemoRequest, DemoRequestStatus } from '../types/demo';

export class DemoService {
  /**
   * Create a new demo request
   */
  static async createDemoRequest(data: CreateDemoRequest): Promise<DemoRequest> {
    const { data: demoRequest, error } = await supabase
      .from('demo_requests')
      .insert([data])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create demo request: ${error.message}`);
    }

    return demoRequest;
  }

  /**
   * Get all demo requests with optional filtering and pagination
   */
  static async getDemoRequests(options?: {
    status?: DemoRequestStatus;
    limit?: number;
    offset?: number;
    orderBy?: 'created_at' | 'name' | 'email';
    orderDirection?: 'asc' | 'desc';
  }): Promise<DemoRequest[]> {
    let query = supabase.from('demo_requests').select('*');

    // Apply status filter if provided
    if (options?.status) {
      query = query.eq('status', options.status);
    }

    // Apply ordering
    const orderBy = options?.orderBy || 'created_at';
    const orderDirection = options?.orderDirection || 'desc';
    query = query.order(orderBy, { ascending: orderDirection === 'asc' });

    // Apply pagination
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch demo requests: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get a single demo request by ID
   */
  static async getDemoRequestById(id: number): Promise<DemoRequest | null> {
    const { data, error } = await supabase
      .from('demo_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Record not found
      }
      throw new Error(`Failed to fetch demo request: ${error.message}`);
    }

    return data;
  }

  /**
   * Update a demo request
   */
  static async updateDemoRequest(id: number, updates: UpdateDemoRequest): Promise<DemoRequest> {
    const { data, error } = await supabase
      .from('demo_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update demo request: ${error.message}`);
    }

    return data;
  }

  /**
   * Update demo request status
   */
  static async updateDemoRequestStatus(id: number, status: DemoRequestStatus): Promise<DemoRequest> {
    return this.updateDemoRequest(id, { status });
  }

  /**
   * Delete a demo request
   */
  static async deleteDemoRequest(id: number): Promise<void> {
    const { error } = await supabase
      .from('demo_requests')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete demo request: ${error.message}`);
    }
  }

  /**
   * Get demo requests count by status
   */
  static async getDemoRequestsStats(): Promise<Record<DemoRequestStatus, number>> {
    const { data, error } = await supabase
      .from('demo_requests')
      .select('status');

    if (error) {
      throw new Error(`Failed to fetch demo requests stats: ${error.message}`);
    }

    const stats: Record<DemoRequestStatus, number> = {
      pending: 0,
      contacted: 0,
      completed: 0,
    };

    data?.forEach((request) => {
      if (request.status in stats) {
        stats[request.status as DemoRequestStatus]++;
      }
    });

    return stats;
  }

  /**
   * Subscribe to real-time changes for demo requests
   */
  static subscribeToChanges(callback: (payload: any) => void) {
    return supabase
      .channel('demo_requests_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'demo_requests',
        },
        callback
      )
      .subscribe();
  }
}