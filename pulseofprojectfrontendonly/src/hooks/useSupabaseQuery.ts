/**
 * React Hooks for Supabase Data Fetching
 * Provides easy-to-use hooks for querying and mutating data
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { SupabaseService, QueryOptions } from '../services/supabase/crud';
import { PaginatedResponse } from '../types/database';

// ============================================================================
// QUERY HOOK
// ============================================================================

export interface UseSupabaseQueryOptions<T> extends QueryOptions {
  enabled?: boolean; // Whether to automatically fetch data
  refetchInterval?: number; // Auto-refetch interval in milliseconds
  onSuccess?: (data: PaginatedResponse<T>) => void;
  onError?: (error: Error) => void;
}

export interface UseSupabaseQueryResult<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  isRefetching: boolean;
}

/**
 * Hook for querying data from Supabase
 * @example
 * const { data: users, loading } = useSupabaseQuery(userService, {
 *   filters: { organization_id: orgId },
 *   pagination: { page: 1, pageSize: 20 }
 * });
 */
export function useSupabaseQuery<T>(
  service: SupabaseService<T>,
  options: UseSupabaseQueryOptions<T> = {}
): UseSupabaseQueryResult<T> {
  const { enabled = true, refetchInterval, onSuccess, onError, ...queryOptions } = options;

  const [data, setData] = useState<T[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(queryOptions.pagination?.page || 1);
  const [pageSize, setPageSize] = useState(queryOptions.pagination?.pageSize || 20);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Use ref to track options to avoid infinite loops
  const optionsRef = useRef(queryOptions);
  useEffect(() => {
    optionsRef.current = queryOptions;
  }, [JSON.stringify(queryOptions)]);

  const fetchData = useCallback(async (isRefetch = false) => {
    if (!enabled) return;

    try {
      if (isRefetch) {
        setIsRefetching(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const result = await service.getAll(optionsRef.current);

      setData(result.data);
      setCount(result.count);
      setPage(result.page);
      setPageSize(result.pageSize);
      setTotalPages(result.totalPages);

      onSuccess?.(result);
    } catch (err) {
      const error = err as Error;
      setError(error);
      onError?.(error);
    } finally {
      setLoading(false);
      setIsRefetching(false);
    }
  }, [enabled, service, onSuccess, onError]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refetch interval
  useEffect(() => {
    if (!refetchInterval || !enabled) return;

    const interval = setInterval(() => {
      fetchData(true);
    }, refetchInterval);

    return () => clearInterval(interval);
  }, [refetchInterval, enabled, fetchData]);

  const refetch = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  return {
    data,
    count,
    page,
    pageSize,
    totalPages,
    loading,
    error,
    refetch,
    isRefetching,
  };
}

// ============================================================================
// MUTATION HOOK
// ============================================================================

export interface UseMutationOptions<TData, TVariables> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
  onSettled?: (data: TData | undefined, error: Error | null, variables: TVariables) => void;
}

export interface UseMutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData | undefined>;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  loading: boolean;
  error: Error | null;
  data: TData | undefined;
  reset: () => void;
}

/**
 * Hook for mutating data (create, update, delete)
 * @example
 * const { mutate: createUser, loading } = useMutation(
 *   (userData) => userService.create(userData),
 *   {
 *     onSuccess: () => queryClient.invalidateQueries('users')
 *   }
 * );
 */
export function useMutation<TData = any, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: UseMutationOptions<TData, TVariables> = {}
): UseMutationResult<TData, TVariables> {
  const { onSuccess, onError, onSettled } = options;

  const [data, setData] = useState<TData | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutateAsync = useCallback(
    async (variables: TVariables): Promise<TData> => {
      setLoading(true);
      setError(null);

      try {
        const result = await mutationFn(variables);
        setData(result);
        onSuccess?.(result, variables);
        onSettled?.(result, null, variables);
        return result;
      } catch (err) {
        const error = err as Error;
        setError(error);
        onError?.(error, variables);
        onSettled?.(undefined, error, variables);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [mutationFn, onSuccess, onError, onSettled]
  );

  const mutate = useCallback(
    async (variables: TVariables): Promise<TData | undefined> => {
      try {
        return await mutateAsync(variables);
      } catch {
        return undefined;
      }
    },
    [mutateAsync]
  );

  const reset = useCallback(() => {
    setData(undefined);
    setError(null);
    setLoading(false);
  }, []);

  return {
    mutate,
    mutateAsync,
    loading,
    error,
    data,
    reset,
  };
}

// ============================================================================
// OPTIMISTIC UPDATE HOOK
// ============================================================================

export interface UseOptimisticMutationOptions<TData, TVariables>
  extends UseMutationOptions<TData, TVariables> {
  optimisticUpdate?: (variables: TVariables) => TData;
}

/**
 * Hook for mutations with optimistic UI updates
 * @example
 * const { mutate: updateUser } = useOptimisticMutation(
 *   (userData) => userService.update(userData.id, userData),
 *   {
 *     optimisticUpdate: (userData) => userData,
 *     onSuccess: (data) => setUsers(prev => [...prev, data])
 *   }
 * );
 */
export function useOptimisticMutation<TData = any, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: UseOptimisticMutationOptions<TData, TVariables> = {}
): UseMutationResult<TData, TVariables> {
  const { optimisticUpdate, onSuccess, onError, ...restOptions } = options;

  const mutation = useMutation<TData, TVariables>(mutationFn, {
    ...restOptions,
    onSuccess: (data, variables) => {
      onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      // Rollback optimistic update
      onError?.(error, variables);
    },
  });

  const mutateWithOptimistic = useCallback(
    async (variables: TVariables): Promise<TData | undefined> => {
      // Apply optimistic update immediately
      if (optimisticUpdate) {
        const optimisticData = optimisticUpdate(variables);
        onSuccess?.(optimisticData, variables);
      }

      // Perform actual mutation
      return mutation.mutate(variables);
    },
    [mutation, optimisticUpdate, onSuccess]
  );

  return {
    ...mutation,
    mutate: mutateWithOptimistic,
  };
}

// ============================================================================
// REAL-TIME SUBSCRIPTION HOOK
// ============================================================================

export interface UseSubscriptionOptions<T> {
  filter?: { column: string; value: any };
  onInsert?: (record: T) => void;
  onUpdate?: (record: T) => void;
  onDelete?: (record: T) => void;
}

/**
 * Hook for subscribing to real-time database changes
 * @example
 * useSubscription(userService, {
 *   filter: { column: 'organization_id', value: orgId },
 *   onInsert: (user) => setUsers(prev => [...prev, user])
 * });
 */
export function useSubscription<T>(
  service: SupabaseService<T>,
  options: UseSubscriptionOptions<T> = {}
): void {
  const { filter, onInsert, onUpdate, onDelete } = options;

  useEffect(() => {
    const unsubscribe = service.subscribe((payload) => {
      switch (payload.eventType) {
        case 'INSERT':
          onInsert?.(payload.new as T);
          break;
        case 'UPDATE':
          onUpdate?.(payload.new as T);
          break;
        case 'DELETE':
          onDelete?.(payload.old as T);
          break;
      }
    }, filter);

    return unsubscribe;
  }, [service, filter?.column, filter?.value, onInsert, onUpdate, onDelete]);
}

// ============================================================================
// PAGINATION HOOK
// ============================================================================

export interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  totalCount?: number;
}

export interface UsePaginationResult {
  page: number;
  pageSize: number;
  totalPages: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
}

/**
 * Hook for managing pagination state
 */
export function usePagination(
  options: UsePaginationOptions = {}
): UsePaginationResult {
  const { initialPage = 1, initialPageSize = 20, totalCount = 0 } = options;

  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = Math.ceil(totalCount / pageSize);

  const nextPage = useCallback(() => {
    setPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setPage((prev) => Math.max(prev - 1, 1));
  }, []);

  const goToFirstPage = useCallback(() => {
    setPage(1);
  }, []);

  const goToLastPage = useCallback(() => {
    setPage(totalPages);
  }, [totalPages]);

  const canGoNext = page < totalPages;
  const canGoPrev = page > 1;

  return {
    page,
    pageSize,
    totalPages,
    setPage,
    setPageSize,
    nextPage,
    prevPage,
    goToFirstPage,
    goToLastPage,
    canGoNext,
    canGoPrev,
  };
}
