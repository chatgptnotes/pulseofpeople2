/**
 * Voter Calls Service
 * Handles database operations for voter calls, campaigns, and analytics
 */

import { supabase } from './supabase';
import type {
  VoterCall,
  CallCampaign,
  CallSentimentAnalysis,
  CallAnalytics,
  SentimentStats,
  CallListFilters,
} from '../types';

class VoterCallsService {
  /**
   * Create a new call record
   */
  async createCall(call: Partial<VoterCall>): Promise<VoterCall | null> {
    try {
      const { data, error } = await supabase
        .from('voter_calls')
        .insert(call)
        .select()
        .single();

      if (error) {
        console.error('Error creating call:', error);
        return null;
      }

      return data as VoterCall;
    } catch (error) {
      console.error('Error creating call:', error);
      return null;
    }
  }

  /**
   * Update call record
   */
  async updateCall(callId: string, updates: Partial<VoterCall>): Promise<VoterCall | null> {
    try {
      const { data, error } = await supabase
        .from('voter_calls')
        .update(updates)
        .eq('id', callId)
        .select()
        .single();

      if (error) {
        console.error('Error updating call:', error);
        return null;
      }

      return data as VoterCall;
    } catch (error) {
      console.error('Error updating call:', error);
      return null;
    }
  }

  /**
   * Get call by ID
   */
  async getCallById(callId: string): Promise<VoterCall | null> {
    try {
      const { data, error } = await supabase
        .from('voter_calls')
        .select(`
          *,
          sentiment_analysis:call_sentiment_analysis(*)
        `)
        .eq('id', callId)
        .single();

      if (error) {
        console.error('Error fetching call:', error);
        return null;
      }

      return data as VoterCall;
    } catch (error) {
      console.error('Error fetching call:', error);
      return null;
    }
  }

  /**
   * Get call by ElevenLabs call ID
   */
  async getCallByElevenLabsId(elevenLabsCallId: string): Promise<VoterCall | null> {
    try {
      const { data, error } = await supabase
        .from('voter_calls')
        .select('*')
        .eq('call_id', elevenLabsCallId)
        .single();

      if (error) {
        console.error('Error fetching call by ElevenLabs ID:', error);
        return null;
      }

      return data as VoterCall;
    } catch (error) {
      console.error('Error fetching call by ElevenLabs ID:', error);
      return null;
    }
  }

  /**
   * Get all calls with filters
   */
  async getCalls(
    organizationId: string,
    filters?: CallListFilters,
    limit: number = 50,
    offset: number = 0
  ): Promise<VoterCall[]> {
    try {
      let query = supabase
        .from('voter_calls')
        .select(`
          *,
          sentiment_analysis:call_sentiment_analysis(*),
          campaign:call_campaigns(name, status)
        `)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Apply filters
      if (filters?.status && filters.status.length > 0) {
        query = query.in('status', filters.status);
      }

      if (filters?.campaign_id) {
        query = query.eq('campaign_id', filters.campaign_id);
      }

      if (filters?.date_from) {
        query = query.gte('created_at', filters.date_from.toISOString());
      }

      if (filters?.date_to) {
        query = query.lte('created_at', filters.date_to.toISOString());
      }

      if (filters?.search) {
        query = query.or(`phone_number.ilike.%${filters.search}%,voter_name.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching calls:', error);
        return [];
      }

      return data as VoterCall[];
    } catch (error) {
      console.error('Error fetching calls:', error);
      return [];
    }
  }

  /**
   * Create campaign
   */
  async createCampaign(campaign: Partial<CallCampaign>): Promise<CallCampaign | null> {
    try {
      const { data, error } = await supabase
        .from('call_campaigns')
        .insert(campaign)
        .select()
        .single();

      if (error) {
        console.error('Error creating campaign:', error);
        return null;
      }

      return data as CallCampaign;
    } catch (error) {
      console.error('Error creating campaign:', error);
      return null;
    }
  }

  /**
   * Update campaign
   */
  async updateCampaign(
    campaignId: string,
    updates: Partial<CallCampaign>
  ): Promise<CallCampaign | null> {
    try {
      const { data, error } = await supabase
        .from('call_campaigns')
        .update(updates)
        .eq('id', campaignId)
        .select()
        .single();

      if (error) {
        console.error('Error updating campaign:', error);
        return null;
      }

      return data as CallCampaign;
    } catch (error) {
      console.error('Error updating campaign:', error);
      return null;
    }
  }

  /**
   * Get campaigns
   */
  async getCampaigns(organizationId: string): Promise<CallCampaign[]> {
    try {
      const { data, error } = await supabase
        .from('call_campaigns')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching campaigns:', error);
        return [];
      }

      return data as CallCampaign[];
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      return [];
    }
  }

  /**
   * Get sentiment stats for analytics
   */
  async getSentimentStats(organizationId: string, campaignId?: string): Promise<SentimentStats> {
    try {
      let query = supabase
        .from('voter_calls')
        .select(`
          *,
          sentiment_analysis:call_sentiment_analysis(*)
        `)
        .eq('organization_id', organizationId)
        .eq('status', 'completed');

      if (campaignId) {
        query = query.eq('campaign_id', campaignId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching sentiment stats:', error);
        return this.getEmptySentimentStats();
      }

      const calls = data as VoterCall[];
      const analyzedCalls = calls.filter(c => c.sentiment_analysis);

      // Calculate stats
      const stats: SentimentStats = {
        total_calls: calls.length,
        analyzed_calls: analyzedCalls.length,

        previous_govt: {
          positive: 0,
          negative: 0,
          neutral: 0,
          not_mentioned: 0,
        },

        tvk: {
          support: 0,
          against: 0,
          undecided: 0,
          not_mentioned: 0,
        },

        voting_intention: {},
        top_issues: [],
      };

      analyzedCalls.forEach(call => {
        const sentiment = Array.isArray(call.sentiment_analysis)
          ? call.sentiment_analysis[0]
          : call.sentiment_analysis;

        if (!sentiment) return;

        // Previous govt stats
        if (sentiment.previous_govt_sentiment) {
          stats.previous_govt[sentiment.previous_govt_sentiment]++;
        }

        // TVK stats
        if (sentiment.tvk_sentiment) {
          stats.tvk[sentiment.tvk_sentiment]++;
        }

        // Voting intention
        if (sentiment.voting_intention) {
          stats.voting_intention[sentiment.voting_intention] =
            (stats.voting_intention[sentiment.voting_intention] || 0) + 1;
        }

        // Collect issues
        if (sentiment.key_issues && Array.isArray(sentiment.key_issues)) {
          sentiment.key_issues.forEach((issue: any) => {
            const existing = stats.top_issues.find(i => i.issue === issue.issue);
            if (existing) {
              existing.count++;
              existing.avg_sentiment = (existing.avg_sentiment + (issue.sentiment === 'positive' ? 1 : issue.sentiment === 'negative' ? -1 : 0)) / 2;
            } else {
              stats.top_issues.push({
                issue: issue.issue,
                count: 1,
                avg_sentiment: issue.sentiment === 'positive' ? 1 : issue.sentiment === 'negative' ? -1 : 0,
              });
            }
          });
        }
      });

      // Sort top issues
      stats.top_issues.sort((a, b) => b.count - a.count);
      stats.top_issues = stats.top_issues.slice(0, 10);

      return stats;
    } catch (error) {
      console.error('Error calculating sentiment stats:', error);
      return this.getEmptySentimentStats();
    }
  }

  /**
   * Get call analytics
   */
  async getCallAnalytics(organizationId: string, campaignId?: string): Promise<CallAnalytics> {
    try {
      let query = supabase
        .from('voter_calls')
        .select('*')
        .eq('organization_id', organizationId);

      if (campaignId) {
        query = query.eq('campaign_id', campaignId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching call analytics:', error);
        return this.getEmptyAnalytics();
      }

      const calls = data as VoterCall[];

      const successfulCalls = calls.filter(c => c.status === 'completed');
      const failedCalls = calls.filter(c => ['failed', 'no_answer', 'busy', 'cancelled'].includes(c.status));

      const totalDuration = calls.reduce((sum, c) => sum + (c.duration_seconds || 0), 0);
      const avgDuration = calls.length > 0 ? totalDuration / calls.length : 0;

      // Group by date
      const byDate: Record<string, { calls: number; successful: number; failed: number }> = {};

      calls.forEach(call => {
        const date = new Date(call.created_at).toISOString().split('T')[0];
        if (!byDate[date]) {
          byDate[date] = { calls: 0, successful: 0, failed: 0 };
        }
        byDate[date].calls++;
        if (call.status === 'completed') byDate[date].successful++;
        if (['failed', 'no_answer', 'busy'].includes(call.status)) byDate[date].failed++;
      });

      const sentimentStats = await this.getSentimentStats(organizationId, campaignId);

      return {
        total_calls: calls.length,
        successful_calls: successfulCalls.length,
        failed_calls: failedCalls.length,
        avg_duration: Math.round(avgDuration),
        total_duration: totalDuration,
        sentiment_stats: sentimentStats,
        by_date: Object.entries(byDate)
          .map(([date, stats]) => ({ date, ...stats }))
          .sort((a, b) => a.date.localeCompare(b.date)),
      };
    } catch (error) {
      console.error('Error calculating call analytics:', error);
      return this.getEmptyAnalytics();
    }
  }

  /**
   * Delete call
   */
  async deleteCall(callId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('voter_calls')
        .delete()
        .eq('id', callId);

      if (error) {
        console.error('Error deleting call:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting call:', error);
      return false;
    }
  }

  /**
   * Subscribe to call updates
   */
  subscribeToCallUpdates(
    organizationId: string,
    callback: (payload: any) => void
  ) {
    return supabase
      .channel('voter_calls_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'voter_calls',
          filter: `organization_id=eq.${organizationId}`,
        },
        callback
      )
      .subscribe();
  }

  /**
   * Helper: Empty sentiment stats
   */
  private getEmptySentimentStats(): SentimentStats {
    return {
      total_calls: 0,
      analyzed_calls: 0,
      previous_govt: {
        positive: 0,
        negative: 0,
        neutral: 0,
        not_mentioned: 0,
      },
      tvk: {
        support: 0,
        against: 0,
        undecided: 0,
        not_mentioned: 0,
      },
      voting_intention: {},
      top_issues: [],
    };
  }

  /**
   * Helper: Empty analytics
   */
  private getEmptyAnalytics(): CallAnalytics {
    return {
      total_calls: 0,
      successful_calls: 0,
      failed_calls: 0,
      avg_duration: 0,
      total_duration: 0,
      sentiment_stats: this.getEmptySentimentStats(),
      by_date: [],
    };
  }
}

// Export singleton instance
export const voterCallsService = new VoterCallsService();

// Export class for testing
export default VoterCallsService;
