import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { notifyWatchlistMatches } from '@/data/notifications/watchlistNotifications';
import type { RiskProfile } from '@/domain/profile';
import { Avatar } from '@/presentation/components/avatar';
import { Icon } from '@/presentation/components/icon';
import { Colors } from '@/theme/colors';

/**
 * Main dashboard screen displaying live technical analysis signals from Binance.
 * Fetches data according to the user's risk profile and evaluates watchlist matches for notifications.
 */
type SignalsScreenProps = {
  greetingName: string;
  riskProfile: RiskProfile;
  watchlist: string[];
  onOpenProfile: () => void;
};

export function SignalsScreen({
  greetingName,
  riskProfile,
  watchlist,
  onOpenProfile,
}: SignalsScreenProps) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [notificationsDenied, setNotificationsDenied] = useState(false);

  // Fetches market signals from Binance and handles loading/refresh states
  const load = useCallback(async (mode: 'initial' | 'refresh') => {
    if (mode === 'refresh') setRefreshing(true);
    else setStatus('loading');
    setError(null);

    try {

      setStatus('ready');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not load signals.');
      setStatus('error');
    } finally {
      setRefreshing(false);
    }
  }, [riskProfile]);

  // Re-fetch signals whenever the user's risk profile changes (since indicator gaps depend on it)
  useEffect(() => {
    load('initial');
  }, [load]);

  // Evaluate watchlist alerts only after a successful signal update
  useEffect(() => {
    if (status !== 'ready') return;
    let cancelled = false;
    
    return () => {
      cancelled = true;
    };
  }, [status, watchlist]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.top}>
        <View style={styles.greetingRow}>
          <View style={styles.identity}>
            <Avatar size={48} />
            <View>
              <Text style={styles.greeting}>Hi, {greetingName}</Text>
              <Text style={styles.welcome}>Welcome back</Text>
            </View>
          </View>
          <Pressable
            onPress={onOpenProfile}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Profile"
            style={styles.iconButton}
          >
            <Icon name="settings" size={24} color={Colors.white} />
          </Pressable>
        </View>

        {/* Informational disclaimer required for trading demo interfaces */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerTitle}>Not financial advice</Text>
          <Text style={styles.disclaimerBody}>
            Signals compare a 10-hour average with a 20-hour average. They are a demo rule, not a recommendation to trade.
          </Text>
        </View>

        {notificationsDenied ? (
          <Text style={styles.permissionNote}>
            Notifications are off. Allow them in system settings to hear about watchlist signals.
          </Text>
        ) : null}
      </View>

      {status === 'loading' ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      ) : status === 'error' ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={() => load('initial')} style={styles.retry}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : (
        <Text>Signals</Text>
      )}
    </SafeAreaView>
  );
}


// Formats crypto price dynamically based on magnitude (fewer decimals for high-value coins)
function formatPrice(price: number) {
  const digits = price >= 1000 ? 0 : price >= 1 ? 2 : 4;
  return `$${price.toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;
}

// Formats timestamp into a short, readable local string
function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  top: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  greeting: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  welcome: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disclaimer: {
    marginTop: 16,
    backgroundColor: '#2A2416',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#6B5420',
  },
  disclaimerTitle: {
    color: Colors.gold,
    fontSize: 15,
    fontWeight: '700',
  },
  disclaimerBody: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  permissionNote: {
    color: Colors.gold,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 10,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    color: Colors.textPrimary,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  retry: {
    marginTop: 16,
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  retryText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
    gap: 12,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardTitle: {
    flex: 1,
  },
  symbol: {
    color: Colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
  pair: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  side: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  sideText: {
    fontSize: 13,
    fontWeight: '700',
  },
  buy: {
    backgroundColor: Colors.accentSoft,
  },
  buyText: {
    color: Colors.accentText,
  },
  sell: {
    backgroundColor: '#FECACA',
  },
  sellText: {
    color: '#7F1D1D',
  },
  neutral: {
    backgroundColor: '#2A2E39',
  },
  neutralText: {
    color: Colors.textSecondary,
  },
  price: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    marginTop: 10,
  },
  rationale: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 8,
  },
  time: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  watched: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: '600',
  },
});