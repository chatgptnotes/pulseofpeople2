import { useApi } from './useApi';
import { apiService } from '../services/api';

export function useSentimentData() {
  return useApi(() => apiService.getSentimentData(), {
    immediate: true,
    refreshInterval: 300000 // 5 minutes
  });
}

export function useTrendData(timeRange?: string) {
  return useApi(() => apiService.getTrendData(timeRange), {
    immediate: true,
    refreshInterval: 300000
  });
}

export function useCompetitorData() {
  return useApi(() => apiService.getCompetitorData(), {
    immediate: true,
    refreshInterval: 600000 // 10 minutes
  });
}

export function useHeatmapData(issue?: string) {
  return useApi(() => apiService.getHeatmapData(issue), {
    immediate: true,
    refreshInterval: 300000
  });
}

export function useInfluencerData() {
  return useApi(() => apiService.getInfluencerData(), {
    immediate: true,
    refreshInterval: 600000
  });
}

export function useAlertData() {
  return useApi(() => apiService.getAlertData(), {
    immediate: true,
    refreshInterval: 60000 // 1 minute
  });
}

export function useSentimentDistribution() {
  return useApi(() => apiService.getSentimentDistribution(), {
    immediate: true,
    refreshInterval: 300000
  });
}

export function useIssueImportance() {
  return useApi(() => apiService.getIssueImportance(), {
    immediate: true,
    refreshInterval: 300000
  });
}

export function useDashboardConfig() {
  return useApi(() => apiService.getDashboardConfig(), {
    immediate: true
  });
}