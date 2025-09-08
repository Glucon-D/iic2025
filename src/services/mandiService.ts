import { MandiAPIParams, MandiAPIResponse, MandiFilters, MandiRecord } from '@/utils/types/mandi.types';

// Updated to working resource ID
const MANDI_API_BASE_URL = 'https://api.data.gov.in/resource/35985678-0d79-46b4-9ed6-6f13308a1d24';
const API_KEY = '579b464db66ec23bdd000001cdc3b564546246a772a26393094f5645';

export class MandiService {
  static async fetchMarketPrices(params: MandiAPIParams = {}): Promise<MandiAPIResponse> {
    const {
      offset = 0,
      limit = 100,
      format = 'json',
      filters = {}
    } = params;

    try {
      const url = new URL(MANDI_API_BASE_URL);
      
      url.searchParams.append('api-key', API_KEY);
      url.searchParams.append('offset', offset.toString());
      url.searchParams.append('limit', limit.toString());
      url.searchParams.append('format', format);

      // Update filter parameters to match new API field names
      if (filters.state) {
        url.searchParams.append('filters[State]', filters.state);
      }
      if (filters.district) {
        url.searchParams.append('filters[District]', filters.district);
      }
      if (filters.market) {
        url.searchParams.append('filters[Market]', filters.market);
      }
      if (filters.commodity) {
        url.searchParams.append('filters[Commodity]', filters.commodity);
      }
      if (filters.variety) {
        url.searchParams.append('filters[Variety]', filters.variety);
      }
      if (filters.grade) {
        url.searchParams.append('filters[Grade]', filters.grade);
      }
      // Note: searchQuery is handled client-side since the API doesn't support text search

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching market prices:', error);
      throw error;
    }
  }

  static async getUniqueValues(field: keyof MandiFilters): Promise<string[]> {
    try {
      const response = await this.fetchMarketPrices({ limit: 'all' });
      
      if (response.status === 'ok' && response.records) {
        const uniqueValues = new Set<string>();
        
        response.records.forEach((record) => {
          const value = record[field as keyof typeof record];
          if (value && typeof value === 'string') {
            uniqueValues.add(value);
          }
        });
        
        return Array.from(uniqueValues).sort();
      }
      
      return [];
    } catch (error) {
      console.error(`Error fetching unique values for ${field}:`, error);
      return [];
    }
  }

  static filterRecords(records: MandiRecord[], searchQuery: string): MandiRecord[] {
    if (!searchQuery) return records;
    
    const query = searchQuery.toLowerCase().trim();
    
    return records.filter(record => {
      // Check all fields for the search query
      const state = (record.State || record.state || '').toLowerCase();
      const district = (record.District || record.district || '').toLowerCase();
      const market = (record.Market || record.market || '').toLowerCase();
      const commodity = (record.Commodity || record.commodity || '').toLowerCase();
      const variety = (record.Variety || record.variety || '').toLowerCase();
      const grade = (record.Grade || record.grade || '').toLowerCase();
      
      return (
        state.includes(query) ||
        district.includes(query) ||
        market.includes(query) ||
        commodity.includes(query) ||
        variety.includes(query) ||
        grade.includes(query)
      );
    });
  }
}