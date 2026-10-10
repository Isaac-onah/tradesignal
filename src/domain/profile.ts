import { DEFAULT_WATCHLIST, MARKET_ASSETS, type MarketSymbol } from '@/domain/market/assets';

/**
 * Turns Supabase `user_metadata` into the profile the screens render.
 * A missing watchlist uses Bitcoin and Ethereum. A saved empty list stays empty.
 */

export const RISK_PROFILES = ['conservative', 'balanced', 'aggressive'] as const;

export type RiskProfile = (typeof RISK_PROFILES)[number];

export type UserProfile = {
  name: string;
  email: string;
  riskProfile: RiskProfile;
  watchlist: MarketSymbol[];
};