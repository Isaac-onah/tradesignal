import { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MARKET_ASSETS, type MarketSymbol } from '@/domain/market/assets';
import { RISK_PROFILES, type RiskProfile, type UserProfile } from '@/domain/profile';
import { Icon } from '@/presentation/components/icon';
import { Colors } from '@/theme/colors';

/** Editable name, risk profile, and watchlist. Email is shown and is not edited here. */
type ProfileDraft = Pick<UserProfile, 'name' | 'riskProfile' | 'watchlist'>;

type ProfileScreenProps = {
  profile: UserProfile;
  onBack: () => void;
  onSave: (draft: ProfileDraft) => Promise<string | null>;
  onLogOut: () => void;
};

export function ProfileScreen({ profile, onBack, onSave, onLogOut }: ProfileScreenProps) {
  const [name, setName] = useState(profile.name);
  const [riskProfile, setRiskProfile] = useState<RiskProfile>(profile.riskProfile);
  const [watchlist, setWatchlist] = useState<MarketSymbol[]>(profile.watchlist);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setName(profile.name);
    setRiskProfile(profile.riskProfile);
    setWatchlist(profile.watchlist);
  }, [profile]);

  function toggleAsset(symbol: MarketSymbol) {
    setSaved(false);
    setWatchlist((current) =>
      current.includes(symbol) ? current.filter((item) => item !== symbol) : [...current, symbol],
    );
  }

  async function save() {
    if (name.trim().length === 0) {
      setError('Enter a name.');
      return;
    }
    setSaving(true);
    setError(null);
    setSaved(false);
    const message = await onSave({
      name: name.trim(),
      riskProfile,
      watchlist,
    });
    setSaving(false);
    if (message) setError(message);
    else setSaved(true);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable
          onPress={onBack}
          hitSlop={8}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Icon name="back" size={26} color={Colors.accent} />
        </Pressable>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionLabel}>Name</Text>
        <View style={styles.group}>
          <TextInput
            value={name}
            onChangeText={(value) => {
              setName(value);
              setSaved(false);
            }}
            placeholder="Your name"
            placeholderTextColor={Colors.textMuted}
            style={styles.input}
          />
          <Text style={styles.email}>{profile.email}</Text>
        </View>

        <Text style={styles.sectionLabel}>Risk profile</Text>
        <View style={styles.riskRow}>
          {RISK_PROFILES.map((option) => {
            const selected = riskProfile === option;
            return (
              <Pressable
                key={option}
                onPress={() => {
                  setRiskProfile(option);
                  setSaved(false);
                }}
                style={[styles.riskChip, selected && styles.riskChipSelected]}
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                <Text style={[styles.riskText, selected && styles.riskTextSelected]}>
                  {labelForRisk(option)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionLabel}>Watchlist</Text>
        <View style={styles.group}>
          {MARKET_ASSETS.map((asset, index) => {
            const selected = watchlist.includes(asset.symbol);
            return (
              <View key={asset.symbol}>
                {index > 0 ? <View style={styles.divider} /> : null}
                <Pressable
                  onPress={() => toggleAsset(asset.symbol)}
                  style={styles.assetRow}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selected }}
                >
                  <View style={[styles.checkbox, selected && styles.checkboxChecked]}>
                    {selected ? <Text style={styles.checkmark}>✓</Text> : null}
                  </View>
                  <View style={styles.assetText}>
                    <Text style={styles.assetName}>{asset.name}</Text>
                    <Text style={styles.assetSymbol}>{asset.symbol}</Text>
                  </View>
                </Pressable>
              </View>
            );
          })}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {saved ? <Text style={styles.saved}>Profile saved</Text> : null}

        <Pressable
          onPress={save}
          disabled={saving}
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        >
          <Text style={styles.saveText}>{saving ? 'Saving...' : 'Save profile'}</Text>
        </Pressable>

        <Text style={styles.disclaimer}>Not financial advice.</Text>
      </ScrollView>

      <Pressable onPress={onLogOut} style={styles.logout} accessibilityRole="button">
        <Text style={styles.logoutText}>Log Out</Text>
      </Pressable>
    </SafeAreaView>
  );
}

function labelForRisk(risk: RiskProfile) {
  if (risk === 'conservative') return 'Conservative';
  if (risk === 'aggressive') return 'Aggressive';
  return 'Balanced';
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 12,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sectionLabel: {
    color: Colors.accent,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 18,
    marginBottom: 10,
    marginLeft: 4,
  },
  group: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    overflow: 'hidden',
  },
  input: {
    color: Colors.textPrimary,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  email: {
    color: Colors.textSecondary,
    fontSize: 13,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  riskRow: {
    flexDirection: 'row',
    gap: 8,
  },
  riskChip: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  riskChipSelected: {
    backgroundColor: Colors.accent,
  },
  riskText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  riskTextSelected: {
    color: Colors.white,
  },
  assetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.inputBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  checkmark: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  assetText: {
    flex: 1,
  },
  assetName: {
    color: Colors.textPrimary,
    fontSize: 16,
  },
  assetSymbol: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 48,
  },
  error: {
    color: Colors.danger,
    fontSize: 14,
    marginTop: 14,
  },
  saved: {
    color: Colors.accent,
    fontSize: 14,
    marginTop: 14,
  },
  saveButton: {
    marginTop: 18,
    backgroundColor: Colors.accent,
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 16,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  disclaimer: {
    color: Colors.gold,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 16,
  },
  logout: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: Colors.accent,
    borderRadius: 16,
    alignItems: 'center',
    paddingVertical: 16,
  },
  logoutText: {
    color: Colors.accent,
    fontSize: 16,
    fontWeight: '700',
  },
});
