/** Pairs the signals feed always loads. The watchlist is a subset of these. */
export const MARKET_ASSETS = [
    { symbol: 'BTCUSDT', name: 'Bitcoin' },
    { symbol: 'ETHUSDT', name: 'Ethereum' },
    { symbol: 'BNBUSDT', name: 'BNB' },
    { symbol: 'SOLUSDT', name: 'Solana' },
    { symbol: 'XRPUSDT', name: 'XRP' },
  ] as const;
  
  export type MarketSymbol = (typeof MARKET_ASSETS)[number]['symbol'];
  
  export const DEFAULT_WATCHLIST: MarketSymbol[] = ['BTCUSDT', 'ETHUSDT'];
  