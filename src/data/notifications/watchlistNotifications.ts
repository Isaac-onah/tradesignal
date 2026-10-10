import { Platform } from 'react-native';
import { secureStoreAdapter } from '@/data/storage/secureStorage';

/**
 * Local notification for a watchlist asset that just printed BUY or SELL.
 * The same candle is not announced twice. The seen ids live in memory and
 * in secure storage. Web skips this; expo-notifications is imported only
 * on a device.
 */
const LOG_KEY = 'signal-notify-log';
const seen = new Set<string>();
let handlerReady = false;

export type NotifyResult = 'sent' | 'denied' | 'unsupported' | 'idle';

export async function notifyWatchlistMatches(
): Promise<NotifyResult> {
    if (Platform.OS === 'web') return 'unsupported';
    if (!handlerReady) {
       
    }
    let sent = false;
    return sent ? 'sent' : 'idle';
}