/**
 * Constituencies Service
 * Handles all constituency-related database operations
 */

import { SupabaseService } from './crud';
import { supabase, callFunction } from './index';
import type {
  Constituency,
  ConstituencyInsert,
  ConstituencyUpdate,
  ConstituencyFilters,
  ConstituencyWithStats,
  ConstituencyType,
  PaginatedResponse,
} from '../../types/database';

class ConstituenciesService extends SupabaseService<
  Constituency,
  ConstituencyInsert,
  ConstituencyUpdate
> {
  constructor() {
    super('constituencies');
  }

  /**
   * Get constituencies by type
   */
  async getByType(type: ConstituencyType | ConstituencyType[]): Promise<Constituency[]> {
    const types = Array.isArray(type) ? type : [type];
    const { data } = await this.getAll({
      filters: { type: types },
    });
    return data;
  }

  /**
   * Get constituencies by state
   */
  async getByState(state: string): Promise<Constituency[]> {
    const { data } = await this.getAll({
      filters: { state },
    });
    return data;
  }

  /**
   * Get constituencies by district
   */
  async getByDistrict(state: string, district: string): Promise<Constituency[]> {
    const { data, error } = await supabase
      .from('constituencies')
      .select('*')
      .eq('state', state)
      .eq('district', district)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  /**
   * Get constituency with statistics
   */
  async getWithStats(constituencyId: string): Promise<ConstituencyWithStats | null> {
    // Get constituency
    const constituency = await this.getById(constituencyId);
    if (!constituency) return null;

    // Get stats using database function
    const stats = await callFunction<{
      total_voters: number;
      male_voters: number;
      female_voters: number;
      support_count: number;
      oppose_count: number;
      undecided_count: number;
      avg_sentiment: number;
    }>('get_constituency_stats', { p_constituency_id: constituencyId });

    return {
      ...constituency,
      stats: stats || undefined,
    };
  }

  /**
   * Get all constituencies with stats
   */
  async getAllWithStats(
    filters?: ConstituencyFilters
  ): Promise<PaginatedResponse<ConstituencyWithStats>> {
    const { data, count, page, pageSize, totalPages } = await this.getAll({ filters });

    // Fetch stats for all constituencies in parallel
    const withStats = await Promise.all(
      data.map(async (constituency) => {
        try {
          const stats = await callFunction<{
            total_voters: number;
            male_voters: number;
            female_voters: number;
            support_count: number;
            oppose_count: number;
            undecided_count: number;
            avg_sentiment: number;
          }>('get_constituency_stats', { p_constituency_id: constituency.id });

          return {
            ...constituency,
            stats: stats || undefined,
          };
        } catch {
          return { ...constituency };
        }
      })
    );

    return {
      data: withStats,
      count,
      page,
      pageSize,
      totalPages,
    };
  }

  /**
   * Search constituencies by name or code
   */
  async searchConstituencies(searchTerm: string): Promise<Constituency[]> {
    const { data } = await this.search(['name', 'code'], searchTerm);
    return data;
  }

  /**
   * Get constituencies summary for an organization
   */
  async getOrganizationSummary(organizationId: string): Promise<{
    total_constituencies: number;
    total_population: number;
    total_voters: number;
    total_booths: number;
    by_type: Record<string, number>;
    by_state: Record<string, number>;
  }> {
    const { data, error } = await supabase
      .from('constituencies')
      .select('*')
      .eq('organization_id', organizationId);

    if (error) throw error;

    const constituencies = data || [];

    return {
      total_constituencies: constituencies.length,
      total_population: constituencies.reduce((sum, c) => sum + (c.population || 0), 0),
      total_voters: constituencies.reduce((sum, c) => sum + c.voter_count, 0),
      total_booths: constituencies.reduce((sum, c) => sum + c.total_booths, 0),
      by_type: constituencies.reduce(
        (acc, c) => {
          acc[c.type] = (acc[c.type] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
      by_state: constituencies.reduce(
        (acc, c) => {
          if (c.state) {
            acc[c.state] = (acc[c.state] || 0) + 1;
          }
          return acc;
        },
        {} as Record<string, number>
      ),
    };
  }

  /**
   * Update constituency voter counts (triggered automatically by database)
   */
  async refreshStats(constituencyId: string): Promise<void> {
    // This is handled by database triggers, but we can manually refresh if needed
    const { error } = await supabase.rpc('update_constituency_voter_count', {
      p_constituency_id: constituencyId,
    });

    if (error) throw error;
  }

  /**
   * Get constituencies by multiple filters
   */
  async getFiltered(filters: ConstituencyFilters): Promise<PaginatedResponse<Constituency>> {
    return this.getAll({ filters });
  }
}

// Export singleton instance
export const constituenciesService = new ConstituenciesService();

// Export class for testing
export { ConstituenciesService };
