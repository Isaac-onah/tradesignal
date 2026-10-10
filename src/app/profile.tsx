import { Redirect, useRouter } from 'expo-router';
import { ProfileScreen } from '@/presentation/screens/profileScreen';
import { useSession } from '@/presentation/state/sessionProvider';
import { LoadingScreen } from '@/presentation/screens/loadingScreen';

/** Profile route. Save updates metadata. Log out clears the session and returns to login. */
export default function ProfilePage() {
  const router = useRouter();
  const { ready, session, profile, saveProfile, signOut } = useSession();

  if (!ready) {
    return <LoadingScreen message="Restoring your session..." />;
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  return (
    <ProfileScreen
      profile={profile}
      onBack={() => {
        if (router.canGoBack()) router.back();
        else router.replace('/signals');
      }}
      onSave={async (draft) => {
        const result = await saveProfile(draft);
        return result.error;
      }}
      onLogOut={async () => {
        await signOut();
        router.replace('/login');
      }}
    />
  );
}
