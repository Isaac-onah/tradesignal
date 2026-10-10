import { Redirect, useRouter } from 'expo-router';
import { ProfileScreen } from '@/presentation/screens/profileScreen';
import LoadingScreen from '@/presentation/screens/loadingscreen';

/** Profile route. Save updates metadata. Log out clears the session and returns to login. */
export default function ProfilePage() {
  const router = useRouter();
  const { ready, session, profile, saveProfile, signOut } = null as any;


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
