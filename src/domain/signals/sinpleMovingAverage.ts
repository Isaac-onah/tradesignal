import type { RiskProfile } from '@/domain/profile';

/**
 * Technical analysis domain logic. Implements a Simple Moving Average (SMA) crossover rule 
 * comparing 10-hour and 20-hour averages, modulated dynamically by the user's risk profile threshold.
 */

export type SignalSide = 'BUY' | 'SELL' | 'NEUTRAL';

export type MarketSignal = {
  symbol: string;
  assetName: string;
  side: SignalSide;
  rationale: string;
  timestamp: number;
  price: number;
};

// Standard candle window intervals for short-term and long-term trend analysis
const SHORT_PERIOD = 10;
const LONG_PERIOD = 20;

/** Required percentage spread buffer before a signal escapes the NEUTRAL band, per risk profile. */
const SPREAD_THRESHOLD: Record<RiskProfile, number> = {
  conservative: 0.005,  // Requires 0.5% spread buffer (stricter trend validation)
  balanced: 0.0015,     // Requires 0.15% spread buffer
  aggressive: 0,        // No buffer; triggers immediately on crossover
};

/**
 * Calculates the Simple Moving Average (SMA) for a given lookback window.
 * Returns null if there are insufficient data points.
 */
export function movingAverage(values: number[], period: number) {
  if (period <= 0 || values.length < period) return null;
  const window = values.slice(values.length - period);
  const total = window.reduce((sum, value) => sum + value, 0);
  return total / period;
}

/**
 * Evaluates price action against the moving averages to derive a BUY, SELL, or NEUTRAL signal,
 * along with a human-readable explanation of the market conditions.
 */
export function signalFromCloses(input: {
  symbol: string;
  assetName: string;
  closes: number[];
  timestamp: number;
  riskProfile: RiskProfile;
}): MarketSignal {
  const price = input.closes[input.closes.length - 1];
  const shortAverage = movingAverage(input.closes, SHORT_PERIOD);
  const longAverage = movingAverage(input.closes, LONG_PERIOD);

  // Fallback state if historical data is incomplete or invalid
  if (
    shortAverage == null ||
    longAverage == null ||
    !Number.isFinite(price) ||
    longAverage === 0
  ) {
    return {
      symbol: input.symbol,
      assetName: input.assetName,
      side: 'NEUTRAL',
      rationale: 'Not enough hourly prices to compare the 10-hour and 20-hour averages.',
      timestamp: input.timestamp,
      price: Number.isFinite(price) ? price : 0,
    };
  }

  // Calculate percentage spread between short and long moving averages
  const spread = (shortAverage - longAverage) / longAverage;
  const threshold = SPREAD_THRESHOLD[input.riskProfile];
  
  // Determine market action based on whether spread clears the user's risk threshold
  const side: SignalSide =
    spread > threshold ? 'BUY' : spread < -threshold ? 'SELL' : 'NEUTRAL';

  // Construct a clear, informative rationale string explaining the signal decision
  const percent = (Math.abs(spread) * 100).toFixed(2);
  const rationale =
    side === 'BUY'
      ? `10-hour average is ${percent}% above the 20-hour average.`
      : side === 'SELL'
        ? `10-hour average is ${percent}% below the 20-hour average.`
        : `The averages are within the ${input.riskProfile} band, so this stays neutral.`;

  return {
    symbol: input.symbol,
    assetName: input.assetName,
    side,
    rationale,
    timestamp: input.timestamp,
    price,
  };
}