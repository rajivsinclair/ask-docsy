import { createClient } from '@supabase/supabase-js';

// Optimized Supabase client with better error handling and caching
export class OptimizedSupabaseClient {
  private supabase;
  private cache = new Map<string, { data: any; expires: number }>();
  private cacheDuration = 5 * 60 * 1000; // 5 minutes

  constructor() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      throw new Error('Supabase URL and anon key required');
    }

    this.supabase = createClient(url, key, {
      auth: {
        persistSession: false
      },
      global: {
        headers: {
          'x-client-info': 'ask-docsy@1.0.0'
        }
      }
    });
  }

  // Optimized search with caching
  async search(query: string, options?: {
    contentTypes?: string[];
    limit?: number;
    agencyId?: string;
  }) {
    const cacheKey = JSON.stringify({ query, options });
    
    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await this.supabase.rpc('search_all_content', {
        query_text: query,
        content_types: options?.contentTypes || ['document', 'meeting', 'assignment'],
        limit_count: options?.limit || 10,
        metadata_filter: options?.agencyId ? { agency_id: options.agencyId } : null
      });

      if (error) throw error;

      // Cache the results
      this.setCache(cacheKey, data);

      return data;
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }

  // Get programs with caching
  async getPrograms() {
    const cacheKey = 'programs';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await this.supabase
        .from('programs')
        .select('id, name, slug, active')
        .eq('active', true)
        .order('name');

      if (error) throw error;

      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Get programs error:', error);
      throw error;
    }
  }

  // Get agencies with caching
  async getAgencies() {
    const cacheKey = 'agencies';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await this.supabase
        .from('agencies')
        .select('id, name, slug, classification')
        .order('name');

      if (error) throw error;

      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Get agencies error:', error);
      throw error;
    }
  }

  // Get recent content
  async getRecentContent(limit = 10) {
    const cacheKey = `recent-${limit}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // Get recent documents
      const { data: documents } = await this.supabase
        .from('documents')
        .select('id, name, created_at, category')
        .order('created_at', { ascending: false })
        .limit(limit);

      // Get recent meetings
      const { data: meetings } = await this.supabase
        .from('meetings')
        .select('id, name, start_date, agency_id')
        .order('start_date', { ascending: false })
        .limit(limit);

      const combined = [
        ...(documents || []).map(d => ({ ...d, type: 'document' })),
        ...(meetings || []).map(m => ({ ...m, type: 'meeting' }))
      ].sort((a, b) => 
        new Date(b.created_at || b.start_date).getTime() - 
        new Date(a.created_at || a.start_date).getTime()
      ).slice(0, limit);

      this.setCache(cacheKey, combined);
      return combined;
    } catch (error) {
      console.error('Get recent content error:', error);
      throw error;
    }
  }

  // Helper methods for caching
  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      expires: Date.now() + this.cacheDuration
    });
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }
}

// Export singleton instance
export const supabaseClient = new OptimizedSupabaseClient();