import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { Colors } from '@/theme/colors';

/** Sign-up form only. `app/signup.tsx` calls Supabase and shows errors or the confirm notice. */
export type SignUpData = {
  name: string;
  email: string;
  password: string;
};

type SignUpScreenProps = {
  onSignUp: (data: SignUpData) => void;
  onNavigateLogin: () => void;
  error?: string | null;
  notice?: string | null;
  submitting?: boolean;
  disabled?: boolean;
};

export function SignUpScreen({
  onSignUp,
  onNavigateLogin,
  error,
  notice,
  submitting = false,
  disabled = false,
}: SignUpScreenProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  const canSubmit =
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length > 0 &&
    !submitting &&
    !disabled;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Create your Account</Text>
          <Text style={styles.subtitle}>
            Enter your details to create an account
          </Text>

          <View style={styles.card}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              autoCorrect={false}
              placeholder="Your name"
              placeholderTextColor={Colors.textMuted}
              style={styles.input}
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              placeholder="you@email.com"
              placeholderTextColor={Colors.textMuted}
              style={styles.input}
            />

            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!passwordVisible}
                placeholder="Password"
                placeholderTextColor={Colors.textMuted}
                style={[styles.input, styles.passwordInput]}
              />
              <Pressable
                onPress={() => setPasswordVisible((v) => !v)}
                style={styles.eyeButton}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={
                  passwordVisible ? 'Hide password' : 'Show password'
                }
              >
                <SymbolView
                  name={{
                    ios: passwordVisible ? 'eye.slash' : 'eye',
                    android: passwordVisible ? 'visibility_off' : 'visibility',
                    web: passwordVisible ? 'visibility_off' : 'visibility',
                  }}
                  size={22}
                  tintColor={Colors.textMuted}
                />
              </Pressable>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            {notice ? <Text style={styles.noticeText}>{notice}</Text> : null}

            <Pressable
              style={[styles.button, !canSubmit && styles.buttonDisabled]}
              disabled={!canSubmit}
              onPress={() =>
                onSignUp({
                  name: name.trim(),
                  email: email.trim(),
                  password,
                })
              }
            >
              <Text style={styles.buttonText}>Sign Up</Text>
            </Pressable>

            <Pressable onPress={onNavigateLogin} style={styles.footerRow}>
              <Text style={styles.footerMuted}>Already have an account? </Text>
              <Text style={styles.footerLink}>Log In</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
    justifyContent: 'center',
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 38,
    marginBottom: 8,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 28,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 28,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.inputBg,
    borderColor: Colors.inputBorder,
    borderWidth: 1,
    borderRadius: 12,
    color: Colors.textPrimary,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  passwordRow: {
    position: 'relative',
    marginBottom: 24,
  },
  passwordInput: {
    marginBottom: 0,
    paddingRight: 48,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  noticeText: {
    color: Colors.accent,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  eyeButton: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 28,
    flexWrap: 'wrap',
  },
  footerMuted: {
    color: Colors.textSecondary,
    fontSize: 15,
  },
  footerLink: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
});
