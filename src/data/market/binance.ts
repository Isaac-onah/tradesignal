import { env } from '@/config/env';
import { MARKET_ASSETS } from '@/domain/market/assets';
import type { RiskProfile } from '@/domain/profile';
import { signalFromCloses, type MarketSignal } from '@/domain/signals/sinpleMovingAverage';

type CandleSeries = {
  closes: number[];
  timestamp: number;
};

/**
 * Fetches 30-period hourly market candles in parallel for all supported assets,
 * transforming raw kline data into actionable technical signals.
 */
export async function fetchSignals(riskProfile: RiskProfile): Promise<MarketSignal[]> {
  const series = await Promise.all(
    MARKET_ASSETS.map(async (asset) => {
      const candles = await fetchHourlyCloses(asset.symbol);
      return signalFromCloses({
        symbol: asset.symbol,
        assetName: asset.name,
        closes: candles.closes,
        timestamp: candles.timestamp,
        riskProfile,
      });
    }),
  );

  return series;
}

/**
 * Queries the public Binance REST API for recent hourly candlestick data (klines).
 * Parses index 4 (close price) and index 6 (close timestamp) from each raw kline array.
 */
async function fetchHourlyCloses(symbol: string): Promise<CandleSeries> {
  const origin = env.binanceEndpoint.replace(/\/$/, '');
  const url = `${origin}/api/v3/klines?symbol=${encodeURIComponent(symbol)}&interval=1h&limit=30`;

  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    throw new Error(
      'Could not reach Binance. Check EXPO_PUBLIC_BINANCE_ENDPOINT and your connection.',
    );
  }

  if (!response.ok) {
    throw new Error(`Binance returned ${response.status} for ${symbol}.`);
  }

  const payload: unknown = await response.json();
  if (!Array.isArray(payload) || payload.length === 0) {
    throw new Error(`Binance returned no candles for ${symbol}.`);
  }

  // Extract close prices (index 4) from the raw Binance kline array structure
  const closes = payload.map((row) => {
    if (!Array.isArray(row)) return Number.NaN;
    return Number(row[4]);
  });

  // Extract the close timestamp of the most recent candle (index 6)
  const last = payload[payload.length - 1];
  const timestamp = Array.isArray(last) ? Number(last[6]) : Date.now();

  if (closes.some((close) => !Number.isFinite(close))) {
    throw new Error(`Binance returned an unreadable price for ${symbol}.`);
  }

  return {
    closes,
    timestamp: Number.isFinite(timestamp) ? timestamp : Date.now(),
  };
}   