/**
 * Voters Service
 * Handles all voter-related database operations including sentiment tracking
 */

import { SupabaseService } from './crud';
import { supabase } from './index';
import type {
  Voter,
  VoterInsert,
  VoterUpdate,
  VoterFilters,
  VoterWithBooth,
  VoterSentiment,
  VoterCategory,
  VoterGender,
  PaginatedResponse,
} from '../../types/database';

class VotersService extends SupabaseService<Voter, VoterInsert, VoterUpdate> {
  constructor() {
    super('voters');
  }

  /**
   * Get voters by polling booth
   */
  async getByBooth(boothId: string, filters?: VoterFilters): Promise<PaginatedResponse<Voter>> {
    return this.getAll({
      filters: { ...filters, polling_booth_id: boothId },
    });
  }

  /**
   * Get voters by sentiment
   */
  async getBySentiment(sentiment: VoterSentiment | VoterSentiment[]): Promise<Voter[]> {
    const sentiments = Array.isArray(sentiment) ? sentiment : [sentiment];
    const { data } = await this.getAll({
      filters: { sentiment: sentiments },
    });
    return data;
  }

  /**
   * Get voters by category
   */
  async getByCategory(category: VoterCategory | VoterCategory[]): Promise<Voter[]> {
    const categories = Array.isArray(category) ? category : [category];
    const { data } = await this.getAll({
      filters: { voter_category: categories },
    });
    return data;
  }

  /**
   * Get voter with polling booth details
   */
  async getWithBooth(voterId: string): Promise<VoterWithBooth | null> {
    const { data, error } = await supabase
      .from('voters')
      .select('*, polling_booth:polling_booths(*)')
      .eq('id', voterId)
      .single();

    if (error) throw error;
    return data as unknown as VoterWithBooth;
  }

  /**
   * Search voters by name, voter ID, EPIC, or phone
   */
  async searchVoters(searchTerm: string): Promise<Voter[]> {
    const { data } = await this.search(
      ['full_name', 'voter_id_number', 'epic_number', 'phone'],
      searchTerm
    );
    return data;
  }

  /**
   * Get voters by age range
   */
  async getByAgeRange(minAge: number, maxAge: number): Promise<Voter[]> {
    const { data, error } = await supabase
      .from('voters')
      .select('*')
      .gte('age', minAge)
      .lte('age', maxAge)
      .order('age');

    if (error) throw error;
    return data || [];
  }

  /**
   * Get verified voters only
   */
  async getVerified(filters?: VoterFilters): Promise<PaginatedResponse<Voter>> {
    return this.getAll({
      filters: { ...filters, verified: true },
    });
  }

  /**
   * Get voters by tags
   */
  async getByTags(tags: string[]): Promise<Voter[]> {
    const { data, error } = await supabase
      .from('voters')
      .select('*')
      .overlaps('tags', tags);

    if (error) throw error;
    return data || [];
  }

  /**
   * Get first-time voters
   */
  async getFirstTimeVoters(boothId?: string): Promise<Voter[]> {
    let query = supabase
      .from('voters')
      .select('*')
      .eq('first_time_voter', true)
      .order('age');

    if (boothId) {
      query = query.eq('polling_booth_id', boothId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  /**
   * Get swing voters (undecided sentiment)
   */
  async getSwingVoters(boothId?: string): Promise<Voter[]> {
    let query = supabase
      .from('voters')
      .select('*')
      .in('sentiment', ['undecided', 'neutral'])
      .eq('voter_category', 'swing_voter')
      .order('influencer_score', { ascending: false });

    if (boothId) {
      query = query.eq('polling_booth_id', boothId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  /**
   * Get influencers (high influencer score)
   */
  async getInfluencers(minScore: number = 70): Promise<Voter[]> {
    const { data, error } = await supabase
      .from('voters')
      .select('*')
      .gte('influencer_score', minScore)
      .order('influencer_score', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Update voter sentiment
   */
  async updateSentiment(
    voterId: string,
    sentiment: VoterSentiment,
    sentimentScore: number
  ): Promise<Voter> {
    return this.update(voterId, {
      sentiment,
      sentiment_score: sentimentScore,
      sentiment_last_updated: new Date().toISOString(),
    });
  }

  /**
   * Update voter category
   */
  async updateCategory(voterId: string, category: VoterCategory): Promise<Voter> {
    return this.update(voterId, { voter_category: category });
  }

  /**
   * Mark voter as contacted
   */
  async markAsContacted(
    voterId: string,
    method: string,
    notes?: string
  ): Promise<Voter> {
    return this.update(voterId, {
      contacted_by_party: true,
      last_contact_date: new Date().toISOString().split('T')[0],
      contact_method: method,
      notes: notes || undefined,
    });
  }

  /**
   * Add tags to voter
   */
  async addTags(voterId: string, newTags: string[]): Promise<Voter> {
    const voter = await this.getById(voterId);
    if (!voter) throw new Error('Voter not found');

    const existingTags = voter.tags || [];
    const updatedTags = Array.from(new Set([...existingTags, ...newTags]));

    return this.update(voterId, { tags: updatedTags });
  }

  /**
   * Remove tags from voter
   */
  async removeTags(voterId: string, tagsToRemove: string[]): Promise<Voter> {
    const voter = await this.getById(voterId);
    if (!voter) throw new Error('Voter not found');

    const updatedTags = (voter.tags || []).filter((tag) => !tagsToRemove.includes(tag));

    return this.update(voterId, { tags: updatedTags });
  }

  /**
   * Get voter statistics for a booth/constituency
   */
  async getStatistics(
    organizationId: string,
    boothId?: string
  ): Promise<{
    total_voters: number;
    by_gender: Record<string, number>;
    by_sentiment: Record<string, number>;
    by_category: Record<string, number>;
    avg_age: number;
    first_time_voters: number;
    verified: number;
    consented: number;
    avg_influencer_score: number;
  }> {
    let query = supabase.from('voters').select('*').eq('organization_id', organizationId);

    if (boothId) {
      query = query.eq('polling_booth_id', boothId);
    }

    const { data, error } = await query;
    if (error) throw error;

    const voters = data || [];

    return {
      total_voters: voters.length,
      by_gender: voters.reduce(
        (acc, v) => {
          if (v.gender) {
            acc[v.gender] = (acc[v.gender] || 0) + 1;
          }
          return acc;
        },
        {} as Record<string, number>
      ),
      by_sentiment: voters.reduce(
        (acc, v) => {
          if (v.sentiment) {
            acc[v.sentiment] = (acc[v.sentiment] || 0) + 1;
          }
          return acc;
        },
        {} as Record<string, number>
      ),
      by_category: voters.reduce(
        (acc, v) => {
          if (v.voter_category) {
            acc[v.voter_category] = (acc[v.voter_category] || 0) + 1;
          }
          return acc;
        },
        {} as Record<string, number>
      ),
      avg_age:
        voters.reduce((sum, v) => sum + (v.age || 0), 0) / (voters.length || 1),
      first_time_voters: voters.filter((v) => v.first_time_voter).length,
      verified: voters.filter((v) => v.verified).length,
      consented: voters.filter((v) => v.consent_given).length,
      avg_influencer_score:
        voters.reduce((sum, v) => sum + v.influencer_score, 0) / (voters.length || 1),
    };
  }

  /**
   * Bulk update voter sentiments
   */
  async bulkUpdateSentiment(
    voterIds: string[],
    sentiment: VoterSentiment,
    sentimentScore: number
  ): Promise<void> {
    const { error } = await supabase
      .from('voters')
      .update({
        sentiment,
        sentiment_score: sentimentScore,
        sentiment_last_updated: new Date().toISOString(),
      })
      .in('id', voterIds);

    if (error) throw error;
  }

  /**
   * Bulk verify voters
   */
  async bulkVerify(voterIds: string[], verifiedBy: string): Promise<void> {
    const { error } = await supabase
      .from('voters')
      .update({
        verified: true,
        verified_by: verifiedBy,
        verified_at: new Date().toISOString(),
      })
      .in('id', voterIds);

    if (error) throw error;
  }

  /**
   * Get filtered voters with all options
   */
  async getFiltered(filters: VoterFilters): Promise<PaginatedResponse<Voter>> {
    return this.getAll({ filters });
  }
}

// Export singleton instance
export const votersService = new VotersService();

// Export class for testing
export { VotersService };
