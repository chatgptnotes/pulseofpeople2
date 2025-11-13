/**
 * Generic CRUD Service for Supabase Tables
 * Provides type-safe database operations with built-in error handling
 */

import { supabase, handleSupabaseError } from './index';
import { PaginationParams, PaginatedResponse, SortParams } from '../../types/database';

/**
 * Filter parameters for queries
 */
export interface FilterParams {
  [key: string]: any;
}

/**
 * Query options
 */
export interface QueryOptions {
  filters?: FilterParams;
  pagination?: PaginationParams;
  sort?: SortParams;
  select?: string; // Custom select query (e.g., "*, organization(*)")
}

/**
 * Generic CRUD service class
 * @template T - The row type from the database
 * @template TInsert - The insert type (optional fields)
 * @template TUpdate - The update type (partial fields)
 */
export class SupabaseService<T, TInsert = Partial<T>, TUpdate = Partial<T>> {
  constructor(protected tableName: string) {}

  /**
   * Get all records with optional filtering, pagination, and sorting
   */
  async getAll(options: QueryOptions = {}): Promise<PaginatedResponse<T>> {
    const { filters, pagination, sort, select = '*' } = options;

    let query = supabase.from(this.tableName).select(select, { count: 'exact' });

    // Apply filters
    if (filters) {
      query = this.applyFilters(query, filters);
    }

    // Apply sorting
    if (sort) {
      query = query.order(sort.column, { ascending: sort.direction === 'asc' });
    } else {
      // Default sort by created_at desc
      query = query.order('created_at', { ascending: false });
    }

    // Apply pagination
    if (pagination) {
      const { page, pageSize } = pagination;
      const start = (page - 1) * pageSize;
      const end = start + pageSize - 1;
      query = query.range(start, end);
    }

    const { data, error, count } = await query;

    if (error) handleSupabaseError(error);

    return {
      data: (data as T[]) || [],
      count: count || 0,
      page: pagination?.page || 1,
      pageSize: pagination?.pageSize || (data?.length || 0),
      totalPages: pagination
        ? Math.ceil((count || 0) / pagination.pageSize)
        : 1,
    };
  }

  /**
   * Get a single record by ID
   */
  async getById(id: string, select: string = '*'): Promise<T | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(select)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      handleSupabaseError(error);
    }

    return data as T;
  }

  /**
   * Get a single record by custom filter
   */
  async getOne(filters: FilterParams, select: string = '*'): Promise<T | null> {
    let query = supabase.from(this.tableName).select(select);

    query = this.applyFilters(query, filters);

    const { data, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      handleSupabaseError(error);
    }

    return data as T;
  }

  /**
   * Create a new record
   */
  async create(payload: TInsert): Promise<T> {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert(payload as any)
      .select()
      .single();

    if (error) handleSupabaseError(error);

    return data as T;
  }

  /**
   * Bulk create multiple records
   */
  async bulkCreate(items: TInsert[]): Promise<T[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert(items as any[])
      .select();

    if (error) handleSupabaseError(error);

    return (data as T[]) || [];
  }

  /**
   * Update a record by ID
   */
  async update(id: string, payload: TUpdate): Promise<T> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(payload as any)
      .eq('id', id)
      .select()
      .single();

    if (error) handleSupabaseError(error);

    return data as T;
  }

  /**
   * Update multiple records matching filters
   */
  async updateMany(filters: FilterParams, payload: TUpdate): Promise<T[]> {
    let query = supabase
      .from(this.tableName)
      .update(payload as any);

    query = this.applyFilters(query, filters);

    const { data, error } = await query.select();

    if (error) handleSupabaseError(error);

    return (data as T[]) || [];
  }

  /**
   * Delete a record by ID
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) handleSupabaseError(error);
  }

  /**
   * Delete multiple records matching filters
   */
  async deleteMany(filters: FilterParams): Promise<void> {
    let query = supabase.from(this.tableName).delete();

    query = this.applyFilters(query, filters);

    const { error } = await query;

    if (error) handleSupabaseError(error);
  }

  /**
   * Upsert (insert or update) a record
   */
  async upsert(payload: TInsert): Promise<T> {
    const { data, error } = await supabase
      .from(this.tableName)
      .upsert(payload as any)
      .select()
      .single();

    if (error) handleSupabaseError(error);

    return data as T;
  }

  /**
   * Count records matching filters
   */
  async count(filters?: FilterParams): Promise<number> {
    let query = supabase
      .from(this.tableName)
      .select('*', { count: 'exact', head: true });

    if (filters) {
      query = this.applyFilters(query, filters);
    }

    const { count, error } = await query;

    if (error) handleSupabaseError(error);

    return count || 0;
  }

  /**
   * Check if a record exists
   */
  async exists(filters: FilterParams): Promise<boolean> {
    const count = await this.count(filters);
    return count > 0;
  }

  /**
   * Subscribe to changes on this table
   */
  subscribe(
    callback: (payload: {
      eventType: 'INSERT' | 'UPDATE' | 'DELETE';
      new: T;
      old: T;
    }) => void,
    filter?: { column: string; value: any }
  ) {
    const channel = supabase
      .channel(`${this.tableName}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: this.tableName,
          filter: filter ? `${filter.column}=eq.${filter.value}` : undefined,
        },
        (payload: any) => callback(payload)
      )
      .subscribe();

    // Return unsubscribe function
    return () => supabase.removeChannel(channel);
  }

  /**
   * Apply filters to a query builder
   * @private
   */
  private applyFilters(query: any, filters: FilterParams): any {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          // IN query for arrays
          query = query.in(key, value);
        } else if (typeof value === 'object' && value.operator) {
          // Advanced operators: { operator: 'gte', value: 100 }
          const { operator, value: opValue } = value;
          query = query[operator](key, opValue);
        } else if (typeof value === 'string' && key.endsWith('_search')) {
          // Text search: { name_search: 'john' } => ILIKE '%john%'
          const actualKey = key.replace('_search', '');
          query = query.ilike(actualKey, `%${value}%`);
        } else {
          // Exact match
          query = query.eq(key, value);
        }
      }
    });

    return query;
  }

  /**
   * Search across multiple columns
   */
  async search(
    columns: string[],
    searchTerm: string,
    options: QueryOptions = {}
  ): Promise<PaginatedResponse<T>> {
    const { pagination, sort, select = '*' } = options;

    // Build OR query for text search across columns
    const orConditions = columns
      .map((col) => `${col}.ilike.%${searchTerm}%`)
      .join(',');

    let query = supabase
      .from(this.tableName)
      .select(select, { count: 'exact' })
      .or(orConditions);

    // Apply sorting
    if (sort) {
      query = query.order(sort.column, { ascending: sort.direction === 'asc' });
    }

    // Apply pagination
    if (pagination) {
      const { page, pageSize } = pagination;
      const start = (page - 1) * pageSize;
      const end = start + pageSize - 1;
      query = query.range(start, end);
    }

    const { data, error, count } = await query;

    if (error) handleSupabaseError(error);

    return {
      data: (data as T[]) || [],
      count: count || 0,
      page: pagination?.page || 1,
      pageSize: pagination?.pageSize || (data?.length || 0),
      totalPages: pagination
        ? Math.ceil((count || 0) / pagination.pageSize)
        : 1,
    };
  }
}

/**
 * Helper to create a service instance
 */
export function createService<T, TInsert = Partial<T>, TUpdate = Partial<T>>(
  tableName: string
): SupabaseService<T, TInsert, TUpdate> {
  return new SupabaseService<T, TInsert, TUpdate>(tableName);
}
