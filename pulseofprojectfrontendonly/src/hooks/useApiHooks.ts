/**
 * React Query API Hooks
 * Reusable hooks for all API endpoints with automatic caching and refetching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { djangoApi } from '../services/djangoApi';
import { queryKeys } from '../lib/queryClient';

// =====================================================
// AUTHENTICATION HOOKS
// =====================================================

export const useUserProfile = () => {
  return useQuery({
    queryKey: queryKeys.auth.profile(),
    queryFn: () => djangoApi.getUserProfile(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useUsers = (filters?: any) => {
  return useQuery({
    queryKey: queryKeys.auth.users(filters),
    queryFn: () => djangoApi.getUsers(),
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      djangoApi.login(email, password),
    onSuccess: () => {
      // Invalidate and refetch user profile
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile() });
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { email: string; password: string; name: string; role?: string }) =>
      djangoApi.register(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.users() });
    },
  });
};

// =====================================================
// FEEDBACK HOOKS
// =====================================================

export const useFeedbackList = (filters?: { status?: string; search?: string; ordering?: string; district_id?: string; limit?: number }) => {
  return useQuery({
    queryKey: queryKeys.feedback.list(filters),
    queryFn: () => djangoApi.getFeedbackList(filters),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useFeedbackStats = () => {
  return useQuery({
    queryKey: queryKeys.feedback.stats(),
    queryFn: () => djangoApi.getFeedbackStats(),
    refetchInterval: 60000, // Refetch every minute
  });
};

export const useFeedbackDetail = (id: number) => {
  return useQuery({
    queryKey: queryKeys.feedback.detail(id),
    queryFn: () => djangoApi.getFeedbackDetail(id),
    enabled: !!id,
  });
};

export const useSubmitFeedback = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => djangoApi.submitFeedback(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.feedback.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.feedback.stats() });
    },
  });
};

export const useMarkFeedbackReviewed = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => djangoApi.markFeedbackReviewed(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.feedback.all });
    },
  });
};

// =====================================================
// FIELD REPORTS HOOKS
// =====================================================

export const useFieldReports = (myReportsOnly = false) => {
  return useQuery({
    queryKey: queryKeys.fieldReports.list(myReportsOnly),
    queryFn: () => djangoApi.getFieldReports(myReportsOnly),
    refetchInterval: 30000,
  });
};

export const useSubmitFieldReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => djangoApi.submitFieldReport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.fieldReports.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all });
    },
  });
};

export const useVerifyFieldReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: number; notes?: string }) =>
      djangoApi.verifyFieldReport(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.fieldReports.all });
    },
  });
};

// =====================================================
// ANALYTICS HOOKS
// =====================================================

export const useAnalyticsOverview = () => {
  return useQuery({
    queryKey: queryKeys.analytics.overview(),
    queryFn: () => djangoApi.getAnalyticsOverview(),
    refetchInterval: 60000, // Refetch every minute
  });
};

export const useStateAnalytics = (stateCode: string) => {
  return useQuery({
    queryKey: queryKeys.analytics.state(stateCode),
    queryFn: () => djangoApi.getStateAnalytics(stateCode),
    enabled: !!stateCode,
    refetchInterval: 60000,
  });
};

export const useDistrictAnalytics = (districtId: string) => {
  return useQuery({
    queryKey: queryKeys.analytics.district(districtId),
    queryFn: () => djangoApi.getDistrictAnalytics(parseInt(districtId)),
    enabled: !!districtId,
    refetchInterval: 60000,
  });
};

export const useConstituencyAnalytics = (constituencyCode: string) => {
  return useQuery({
    queryKey: queryKeys.analytics.constituency(constituencyCode),
    queryFn: () => djangoApi.getConstituencyAnalytics(constituencyCode),
    enabled: !!constituencyCode,
    refetchInterval: 60000,
  });
};

// =====================================================
// MASTER DATA HOOKS
// =====================================================

export const useStates = () => {
  return useQuery({
    queryKey: queryKeys.masterData.states(),
    queryFn: () => djangoApi.getStates(),
    staleTime: 60 * 60 * 1000, // 1 hour - master data changes rarely
  });
};

export const useDistricts = (stateCode?: string) => {
  return useQuery({
    queryKey: queryKeys.masterData.districts(stateCode),
    queryFn: () => djangoApi.getDistricts(stateCode),
    staleTime: 60 * 60 * 1000,
  });
};

export const useConstituencies = (stateCode?: string, type?: string) => {
  return useQuery({
    queryKey: queryKeys.masterData.constituencies(stateCode, type),
    queryFn: () => djangoApi.getConstituencies(stateCode, type),
    staleTime: 60 * 60 * 1000,
  });
};

export const usePollingBooths = (filters?: { constituency?: string; district?: string; state?: string }) => {
  return useQuery({
    queryKey: queryKeys.pollingBooths.list(filters),
    queryFn: () => djangoApi.getPollingBooths(filters?.constituency, filters?.district, filters?.state),
    staleTime: 60 * 60 * 1000,
  });
};

export const useIssues = () => {
  return useQuery({
    queryKey: queryKeys.masterData.issues(),
    queryFn: () => djangoApi.getIssues(),
    staleTime: 60 * 60 * 1000,
  });
};

export const useVoterSegments = () => {
  return useQuery({
    queryKey: queryKeys.masterData.voterSegments(),
    queryFn: () => djangoApi.getVoterSegments(),
    staleTime: 60 * 60 * 1000,
  });
};

export const usePoliticalParties = () => {
  return useQuery({
    queryKey: queryKeys.masterData.parties(),
    queryFn: () => djangoApi.getPoliticalParties(),
    staleTime: 60 * 60 * 1000,
  });
};

// =====================================================
// BULK UPLOAD HOOKS
// =====================================================

export const useUploadBulkUsers = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => djangoApi.uploadBulkUsers(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.users() });
    },
  });
};

export const useBulkUploadStatus = (jobId: string) => {
  return useQuery({
    queryKey: ['bulkUpload', 'status', jobId],
    queryFn: () => djangoApi.getBulkUploadStatus(jobId),
    enabled: !!jobId,
    refetchInterval: (data) => {
      // Stop refetching if job is completed or failed
      if (data?.status === 'completed' || data?.status === 'failed') {
        return false;
      }
      return 2000; // Refetch every 2 seconds while processing
    },
  });
};

export const useBulkUploadJobs = () => {
  return useQuery({
    queryKey: ['bulkUpload', 'jobs'],
    queryFn: () => djangoApi.getBulkUploadJobs(),
  });
};

// =====================================================
// UTILITY HOOKS
// =====================================================

export const useHealthCheck = () => {
  return useQuery({
    queryKey: queryKeys.platform.health(),
    queryFn: () => djangoApi.healthCheck(),
    refetchInterval: 60000,
  });
};
