/**
 * Polling Booths Service
 * Handles all polling booth-related database operations including geospatial queries
 */

import { SupabaseService } from './crud';
import { supabase, callFunction } from './index';
import type {
  PollingBooth,
  PollingBoothInsert,
  PollingBoothUpdate,
  PollingBoothFilters,
  PollingBoothWithConstituency,
  BoothType,
  SwingPotential,
  PaginatedResponse,
} from '../../types/database';

class PollingBoothsService extends SupabaseService<
  PollingBooth,
  PollingBoothInsert,
  PollingBoothUpdate
> {
  constructor() {
    super('polling_booths');
  }

  /**
   * Get polling booths by constituency
   */
  async getByConstituency(constituencyId: string): Promise<PollingBooth[]> {
    const { data } = await this.getAll({
      filters: { constituency_id: constituencyId },
      sort: { column: 'booth_number', direction: 'asc' },
    });
    return data;
  }

  /**
   * Get polling booths by ward
   */
  async getByWard(wardId: string): Promise<PollingBooth[]> {
    const { data } = await this.getAll({
      filters: { ward_id: wardId },
      sort: { column: 'booth_number', direction: 'asc' },
    });
    return data;
  }

  /**
   * Get active polling booths only
   */
  async getActive(filters?: PollingBoothFilters): Promise<PaginatedResponse<PollingBooth>> {
    return this.getAll({
      filters: { ...filters, is_active: true },
    });
  }

  /**
   * Get high-priority polling booths
   */
  async getHighPriority(
    constituencyId?: string,
    minPriority: number = 4
  ): Promise<PollingBooth[]> {
    const query = supabase
      .from('polling_booths')
      .select('*')
      .gte('priority_level', minPriority)
      .eq('is_active', true)
      .order('priority_level', { ascending: false });

    if (constituencyId) {
      query.eq('constituency_id', constituencyId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  /**
   * Get polling booth with constituency details
   */
  async getWithConstituency(boothId: string): Promise<PollingBoothWithConstituency | null> {
    const { data, error } = await supabase
      .from('polling_booths')
      .select('*, constituency:constituencies(*)')
      .eq('id', boothId)
      .single();

    if (error) throw error;
    return data as unknown as PollingBoothWithConstituency;
  }

  /**
   * Find polling booths near a location (using PostGIS)
   */
  async findNearby(
    latitude: number,
    longitude: number,
    radiusMeters: number = 5000
  ): Promise<
    Array<{
      booth: PollingBooth;
      distance_meters: number;
    }>
  > {
    // Use the database function for spatial queries
    const results = await callFunction<{
      booth_id: string;
      booth_name: string;
      distance_meters: number;
    }>('find_booths_near', {
      p_latitude: latitude,
      p_longitude: longitude,
      p_radius_meters: radiusMeters,
    });

    if (!results || !Array.isArray(results)) return [];

    // Fetch full booth details
    const boothIds = results.map((r) => r.booth_id);
    const { data: booths } = await supabase
      .from('polling_booths')
      .select('*')
      .in('id', boothIds);

    if (!booths) return [];

    // Combine booth data with distance
    return results.map((r) => {
      const booth = booths.find((b) => b.id === r.booth_id);
      return {
        booth: booth!,
        distance_meters: r.distance_meters,
      };
    });
  }

  /**
   * Get booths by swing potential
   */
  async getBySwingPotential(potential: SwingPotential): Promise<PollingBooth[]> {
    const { data, error } = await supabase
      .from('polling_booths')
      .select('*')
      .eq('swing_potential', potential)
      .eq('is_active', true)
      .order('priority_level', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get booths by booth type
   */
  async getByType(type: BoothType): Promise<PollingBooth[]> {
    const { data } = await this.getAll({
      filters: { booth_type: type },
    });
    return data;
  }

  /**
   * Search polling booths by name, number, or address
   */
  async searchBooths(searchTerm: string): Promise<PollingBooth[]> {
    const { data } = await this.search(['name', 'booth_number', 'address'], searchTerm);
    return data;
  }

  /**
   * Get polling booths summary for a constituency
   */
  async getConstituencySummary(constituencyId: string): Promise<{
    total_booths: number;
    active_booths: number;
    total_voters: number;
    male_voters: number;
    female_voters: number;
    transgender_voters: number;
    by_type: Record<string, number>;
    by_swing_potential: Record<string, number>;
    avg_priority: number;
  }> {
    const { data, error } = await supabase
      .from('polling_booths')
      .select('*')
      .eq('constituency_id', constituencyId);

    if (error) throw error;

    const booths = data || [];

    return {
      total_booths: booths.length,
      active_booths: booths.filter((b) => b.is_active).length,
      total_voters: booths.reduce((sum, b) => sum + b.total_voters, 0),
      male_voters: booths.reduce((sum, b) => sum + b.male_voters, 0),
      female_voters: booths.reduce((sum, b) => sum + b.female_voters, 0),
      transgender_voters: booths.reduce((sum, b) => sum + b.transgender_voters, 0),
      by_type: booths.reduce(
        (acc, b) => {
          acc[b.booth_type] = (acc[b.booth_type] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
      by_swing_potential: booths.reduce(
        (acc, b) => {
          if (b.swing_potential) {
            acc[b.swing_potential] = (acc[b.swing_potential] || 0) + 1;
          }
          return acc;
        },
        {} as Record<string, number>
      ),
      avg_priority:
        booths.reduce((sum, b) => sum + b.priority_level, 0) / (booths.length || 1),
    };
  }

  /**
   * Update booth priority level
   */
  async setPriority(boothId: string, priorityLevel: number): Promise<PollingBooth> {
    return this.update(boothId, { priority_level: priorityLevel });
  }

  /**
   * Update booth swing potential
   */
  async setSwingPotential(
    boothId: string,
    potential: SwingPotential
  ): Promise<PollingBooth> {
    return this.update(boothId, { swing_potential: potential });
  }

  /**
   * Bulk update booth priorities
   */
  async bulkSetPriority(boothIds: string[], priorityLevel: number): Promise<void> {
    const { error } = await supabase
      .from('polling_booths')
      .update({ priority_level: priorityLevel })
      .in('id', boothIds);

    if (error) throw error;
  }

  /**
   * Get geospatial data for mapping
   */
  async getMapData(constituencyId?: string): Promise<
    Array<{
      id: string;
      name: string;
      booth_number: string;
      latitude: number;
      longitude: number;
      total_voters: number;
      priority_level: number;
      swing_potential: string | null;
    }>
  > {
    let query = supabase
      .from('polling_booths')
      .select('id, name, booth_number, latitude, longitude, total_voters, priority_level, swing_potential')
      .eq('is_active', true)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

    if (constituencyId) {
      query = query.eq('constituency_id', constituencyId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as unknown as Array<{
      id: string;
      name: string;
      booth_number: string;
      latitude: number;
      longitude: number;
      total_voters: number;
      priority_level: number;
      swing_potential: string | null;
    }>;
  }
}

// Export singleton instance
export const pollingBoothsService = new PollingBoothsService();

// Export class for testing
export { PollingBoothsService };
