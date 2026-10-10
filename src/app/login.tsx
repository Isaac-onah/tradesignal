import { useState } from 'react';
import { Redirect, useRouter } from 'expo-router';
import { missingSupabaseConfigMessageProduction } from '@/config/env';
import { LoadingScreen } from '@/presentation/screens/loadingScreen';
import { useSession } from '@/presentation/state/sessionProvider';
import { LoginScreen } from '@/presentation/screens/loginScreen';

/** Route for `/login`. Collects the form, calls `signIn`, and leaves navigation to the session redirect. */
export default function LoginPage() {
  const router = useRouter();
  const { ready, session, configured, signIn } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!ready) {
    return <LoadingScreen message="Restoring your session..." />;
  }

  if (session) {
    return <Redirect href="/signals" />;
  }

  return (
    <LoginScreen
      error={configured ? error : missingSupabaseConfigMessageProduction}
      submitting={submitting}
      disabled={!configured}
      onLogin={async (data) => {
        setSubmitting(true);
        setError(null);
        const result = await signIn(data.email, data.password);
        setSubmitting(false);
        // A session makes this page redirect to /signals. Only failures stay here.
        if (result.error) setError(result.error);
      }}
      onNavigateSignUp={() => router.push('/signup')}
    />
  );
}
