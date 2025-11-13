export const crisisDetection = {
  startMonitoring() {
    console.log('Crisis detection monitoring started');
  },

  stopMonitoring() {
    console.log('Crisis detection monitoring stopped');
  },

  getCurrentAlerts() {
    return [];
  },

  getActiveEvents() {
    return [];
  },

  subscribe(callback: (event: any) => void) {
    console.log('Crisis detection subscription added');
    return () => console.log('Crisis detection subscription removed');
  },

  analyzeTrend() {
    return {
      riskLevel: 'low' as const,
      confidence: 0.8,
      recommendations: []
    };
  }
};
