import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env, isSupabaseConfigured } from '@/config/env';
import { secureStoreAdapter } from '@/data/storage/secureStorage';


// Cache a single Supabase instance in memory so we don't recreate it on every call
let client: SupabaseClient | null = null;

/**
 * Lazy-loads and returns the Supabase client instance. 
 * If the environment keys are missing, it safely returns null so the app 
 * can render a helpful configuration screen instead of crashing on launch.
 */
export function getSupabase() {
    // Guard check: Ensure the user has actually supplied their Supabase URL and anon key
    if (!isSupabaseConfigured()) return null;
    
    // Singleton pattern: Return the existing client if it has already been initialized
    if (client) return client;
  
    // Initialize the Supabase client with custom mobile storage and security options
    client = createClient(env.supabaseUrl.trim(), env.supabaseAnonKey.trim(), {
      auth: {
        // Hook up Expo SecureStore so auth tokens are encrypted and saved locally on the device
        storage: secureStoreAdapter,
        autoRefreshToken: true,
        persistSession: true,
        
        // Since this is a native mobile app and not a web browser, 
        // we disable parsing session tokens from web redirect URLs
        detectSessionInUrl: false,
      },
    });
  
    return client;
  }