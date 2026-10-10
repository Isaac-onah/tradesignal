import { useState } from 'react';
import { Redirect, useRouter } from 'expo-router';
import LoadingScreen from '@/presentation/screens/loadingscreen';
import { SignUpScreen } from '@/presentation/screens/signupScreen';
import { missingSupabaseConfigMessageDevelopment } from '@/config/env';

/** Route for `/signup`. Shows a confirm-email notice when Supabase does not return a session. */
export default function SignUpPage() {
  const router = useRouter();
  const { ready, session, configured, signUp } = null as any;
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!ready) {
    return <LoadingScreen message="Restoring your session..." />;
  }

  if (session) {
    return <Redirect href="/signals" />;
  }

  return (
    <SignUpScreen
      error={configured ? error : missingSupabaseConfigMessageDevelopment}
      notice={notice}
      submitting={submitting}
      disabled={!configured}
      onSignUp={async (data) => {
        setSubmitting(true);
        setError(null);
        setNotice(null);
        const result = await signUp(data.name, data.email, data.password);
        setSubmitting(false);
        if (result.error) {
          setError(result.error);
          return;
        }
        // No session yet: stay here and tell the user to confirm, then log in.
        if (result.needsConfirmation) {
          setNotice('Confirm your email, then log in.');
        }
      }}
      onNavigateLogin={() => router.push('/login')}
    />
  );
}
