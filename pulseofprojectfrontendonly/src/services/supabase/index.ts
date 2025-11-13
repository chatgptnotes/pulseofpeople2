/**
 * Supabase Client Configuration
 * Centralized Supabase client with type safety
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../types/database';

// Environment variables with hardcoded fallback
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://eepwbydlfecosaqdysho.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlcHdieWRsZmVjb3NhcWR5c2hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NDA3ODQsImV4cCI6MjA3ODQxNjc4NH0.Z83AOOAFPGK-xKio6fYTXwAUJEHdIlsdCxPleDtE53c';

console.log('[Supabase Service] Initializing client...');
console.log('[Supabase Service] URL:', supabaseUrl);
console.log('[Supabase Service] Key exists:', !!supabaseAnonKey);

/**
 * Type-safe Supabase client instance
 */
export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: localStorage,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
    global: {
      headers: {
        'x-application-name': 'pulse-of-people',
      },
    },
  }
);

/**
 * Type-safe table references
 * Usage: tables.users().select('*')
 */
export const tables = {
  organizations: () => supabase.from('organizations'),
  users: () => supabase.from('users'),
  userPermissions: () => supabase.from('user_permissions'),
  auditLogs: () => supabase.from('audit_logs'),
} as const;

/**
 * Auth helpers
 */
export const auth = {
  /**
   * Get current user ID
   */
  getUserId: async (): Promise<string | null> => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    return data.user.id;
  },

  /**
   * Get current session
   */
  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  /**
   * Sign in with email/password
   */
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  /**
   * Sign out
   */
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: async (): Promise<boolean> => {
    const { data } = await supabase.auth.getSession();
    return !!data.session;
  },
};

/**
 * Real-time subscription helpers
 */
export const realtime = {
  /**
   * Subscribe to table changes
   */
  subscribeToTable: <T>(
    tableName: string,
    callback: (payload: {
      eventType: 'INSERT' | 'UPDATE' | 'DELETE';
      new: T;
      old: T;
    }) => void,
    filter?: { column: string; value: any }
  ) => {
    const channel = supabase
      .channel(`${tableName}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName,
          filter: filter ? `${filter.column}=eq.${filter.value}` : undefined,
        },
        (payload: any) => callback(payload)
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  },

  /**
   * Subscribe to specific record changes
   */
  subscribeToRecord: <T>(
    tableName: string,
    recordId: string,
    callback: (payload: {
      eventType: 'INSERT' | 'UPDATE' | 'DELETE';
      new: T;
      old: T;
    }) => void
  ) => {
    return realtime.subscribeToTable(tableName, callback, {
      column: 'id',
      value: recordId,
    });
  },
};

/**
 * Storage helpers
 */
export const storage = {
  /**
   * Upload file to Supabase Storage
   */
  uploadFile: async (
    bucket: string,
    path: string,
    file: File
  ): Promise<string> => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  },

  /**
   * Delete file from Supabase Storage
   */
  deleteFile: async (bucket: string, path: string): Promise<void> => {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw error;
  },

  /**
   * Get public URL for file
   */
  getPublicUrl: (bucket: string, path: string): string => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },
};

/**
 * Error handling helper
 */
export class SupabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'SupabaseError';
  }
}

export function handleSupabaseError(error: any): never {
  // PostgreSQL error codes
  if (error.code === 'PGRST116') {
    throw new SupabaseError('No data found', error.code, error.details);
  } else if (error.code === '23505') {
    throw new SupabaseError('Duplicate entry - this record already exists', error.code, error.details);
  } else if (error.code === '23503') {
    throw new SupabaseError('Referenced record not found', error.code, error.details);
  } else if (error.code === '42501') {
    throw new SupabaseError('Permission denied - you do not have access to this resource', error.code, error.details);
  } else if (error.message?.includes('JWT')) {
    throw new SupabaseError('Authentication failed - please sign in again', 'AUTH_ERROR', error);
  } else if (error.message?.includes('violates row-level security')) {
    throw new SupabaseError('Access denied - this data belongs to another organization', 'RLS_ERROR', error);
  } else {
    throw new SupabaseError(
      error.message || 'An unexpected error occurred',
      error.code,
      error
    );
  }
}

/**
 * Utility: Execute RPC function
 */
export async function callFunction<T>(
  functionName: string,
  params?: Record<string, any>
): Promise<T> {
  const { data, error } = await supabase.rpc(functionName as any, params as any);
  if (error) handleSupabaseError(error);
  return data as T;
}

// Export everything for convenience
export default supabase;
