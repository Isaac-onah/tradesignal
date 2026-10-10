import { useState } from 'react';
import { Redirect, useRouter } from 'expo-router';
import LoadingScreen from '@/presentation/screens/loadingscreen';
import { LoginScreen } from '@/presentation/screens/loginscreen';
import { missingSupabaseConfigMessageDevelopment } from '@/config/env';

/** Route for `/login`. Collects the form, calls `signIn`, and leaves navigation to the session redirect. */
export default function LoginPage() {
  const router = useRouter();
//   const { ready, session, configured, signIn } = null as any;
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  

  return (
    <LoginScreen
      error={false ? error : missingSupabaseConfigMessageDevelopment}
      submitting={submitting}
      disabled={false}
      onLogin={async (data) => {
       
      }}
      onNavigateSignUp={() => router.push('/signup')}
    />
  );
}
