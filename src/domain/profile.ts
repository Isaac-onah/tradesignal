import { DEFAULT_WATCHLIST, MARKET_ASSETS, type MarketSymbol } from '@/domain/market/assets';

/**
 * Maps raw Supabase `user_metadata` into a strongly-typed domain profile.
 * Applies sensible fallbacks (e.g., default watchlist and email username) for missing fields.
 */

export const RISK_PROFILES = ['conservative', 'balanced', 'aggressive'] as const;

export type RiskProfile = (typeof RISK_PROFILES)[number];

export type UserProfile = {
  name: string;
  email: string;
  riskProfile: RiskProfile;
  watchlist: MarketSymbol[];
};

// Set lookup for fast validation against supported app assets
const KNOWN_SYMBOLS = new Set<string>(MARKET_ASSETS.map((asset) => asset.symbol));

export function profileFromMetadata(
  email: string | undefined,
  metadata: Record<string, unknown> | undefined,
): UserProfile {
  const nameValue = metadata?.display_name;
  const riskValue = metadata?.risk_profile;
  const watchlistValue = metadata?.watchlist;

  // Filter stored items against supported symbols, defaulting to standard watchlist if undefined
  const watchlist = Array.isArray(watchlistValue)
    ? watchlistValue.filter((item): item is MarketSymbol => typeof item === 'string' && KNOWN_SYMBOLS.has(item))
    : [...DEFAULT_WATCHLIST];

  // Derive a friendly display name from the email prefix if display name is missing
  const fallbackName = email?.split('@')[0] || 'Trader';

  return {
    name: typeof nameValue === 'string' && nameValue.trim() ? nameValue.trim() : fallbackName,
    email: email ?? '',
    riskProfile: isRiskProfile(riskValue) ? riskValue : 'balanced',
    watchlist,
  };
}

// Type guard to safely check valid risk profile entries
function isRiskProfile(value: unknown): value is RiskProfile {
  return typeof value === 'string' && RISK_PROFILES.includes(value as RiskProfile);
}