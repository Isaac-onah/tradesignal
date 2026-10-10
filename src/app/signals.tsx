import { Redirect, useRouter } from 'expo-router';
import { SignalsScreen } from '@/presentation/screens/signalsScreen';
import { LoadingScreen } from '@/presentation/screens/loadingScreen';
import { useSession } from '@/presentation/state/sessionProvider';

/** Signed-in home. Sends guests back to login and passes the profile into the feed. */
export default function SignalsPage() {
  const router = useRouter();
  const { ready, session, profile } = useSession();

  if (!ready) {
    return <LoadingScreen message="Restoring your session..." />;
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  return (
    <SignalsScreen
      greetingName={profile.name}
      riskProfile={profile.riskProfile}
      watchlist={profile.watchlist}
      onOpenProfile={() => router.push('/profile')}
    />
  );
}
