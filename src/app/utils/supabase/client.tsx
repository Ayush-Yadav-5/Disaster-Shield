import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

// Singleton pattern to ensure only one Supabase client instance
let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = createClient(
      `https://${projectId}.supabase.co`,
      publicAnonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storageKey: 'disaster-shield-auth' // Use unique storage key to avoid conflicts
        },
        realtime: {
          params: {
            eventsPerSecond: 2 // Limit real-time events to prevent overwhelming
          }
        }
      }
    );
  }
  
  return supabaseInstance;
}

// Export the singleton instance
export const supabase = getSupabaseClient();