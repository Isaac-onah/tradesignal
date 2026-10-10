import { Platform } from 'react-native';
import { secureStoreAdapter } from '@/data/storage/secureStorage';
import type { MarketSignal } from '@/domain/signals/sinpleMovingAverage';

/**
 * Local notification service for active watchlist assets.
 * Evaluates signals and triggers local device alerts for non-NEUTRAL actions (BUY/SELL).
 * Uses local state & SecureStore persistence to prevent dispatching duplicate alerts
 * for the same market candle signal.   
 */
const LOG_KEY = 'signal-notify-log';
const seen = new Set<string>();
let handlerReady = false;

export type NotifyResult = 'sent' | 'denied' | 'unsupported' | 'idle';

export async function notifyWatchlistMatches(
  signals: MarketSignal[],
  watchlist: string[],
): Promise<NotifyResult> {
  // Web does not support native local notifications via expo-notifications
  if (Platform.OS === 'web') return 'unsupported';

  // Filter signals matching the user's watchlist that generated an actionable trade side
  const matches = signals.filter(
    (signal) => watchlist.includes(signal.symbol) && signal.side !== 'NEUTRAL',
  );
  if (matches.length === 0) return 'idle';

  // Dynamic import keeps native notification bundles off the Web build platform
  const Notifications = await import('expo-notifications');
  
  // Configure foreground notification behavior once on first execution
  if (!handlerReady) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    handlerReady = true;
  }

  // Create explicit notification channel required for Android 8.0+
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('signals', {
      name: 'Watchlist signals',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  // Check and request system notification permissions if allowed
  const current = await Notifications.getPermissionsAsync();
  let status = current.status;
  if (status !== 'granted' && current.canAskAgain) {
    status = (await Notifications.requestPermissionsAsync()).status;
  }
  if (status !== 'granted') return 'denied';

  // Load previously dispatched notification IDs into our in-memory set
  const stored = await readLog();
  for (const id of stored) seen.add(id);

  let sent = false;
  for (const signal of matches) {
    // Unique identifier combining symbol, timestamp, and side to avoid repeat alerts
    const id = `${signal.symbol}:${signal.timestamp}:${signal.side}`;
    if (seen.has(id)) continue;
    
    // Mark as seen immediately in memory to avoid race condition double-fires
    seen.add(id);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${signal.assetName} ${signal.side}`,
        body: signal.rationale,
        data: { symbol: signal.symbol, side: signal.side },
      },
      trigger:
        Platform.OS === 'android'
          ? { channelId: 'signals' }
          : {
              type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
              seconds: 1,
            },
    });
    sent = true;
  }

  // Persist the 40 most recent signal IDs to prevent duplicate alerts across app relaunches
  if (sent) {
    await secureStoreAdapter.setItem(LOG_KEY, JSON.stringify([...seen].slice(-40)));
  }

  return sent ? 'sent' : 'idle';
}

/**
 * Reads and validates the previously dispatched notification log from encrypted storage.
 */
async function readLog() {
  const raw = await secureStoreAdapter.getItem(LOG_KEY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}