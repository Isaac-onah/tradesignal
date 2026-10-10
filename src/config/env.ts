/**
 * Environment Configuration
 * 
 * Designed this module to safely centralize and validate public environment variables 
 * across Expo's build boundaries.
 * 
 * Note: Expo only exposes environment variables prefixed with `EXPO_PUBLIC_` 
 * to the client bundle. Only store the public Supabase anon key here—never 
 * expose the administrative service-role key on the client.
 * 
 * key details:
 * - Restricts credentials strictly to the public Supabase anon key (ensuring private 
 *   service-role keys are never leaked to the client).
 * - Implements a graceful fallback for the Binance REST endpoint and a validation helper 
 *   (`isSupabaseConfigured`) to handle missing local setup cleanly without crashing the app.
 */
export const env = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  
  // Defaults to the official public Binance REST endpoint if not overridden in .env
  binanceEndpoint:
    process.env.EXPO_PUBLIC_BINANCE_ENDPOINT || 'https://api.binance.com',
};

export function isSupabaseConfigured() {
  return env.supabaseUrl.trim().length > 0 && env.supabaseAnonKey.trim().length > 0;
}


/** Message shown when the Supabase config is missing. for production purposes only. */
export const missingSupabaseConfigMessageProduction =
  'We are unable to connect to our servers right now. Please check back shortly or try again later.';

/** Message shown when the Supabase config is missing. for development purposes only. */
export const missingSupabaseConfigMessageDevelopment =
  'Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to a .env file, then reload the app.';