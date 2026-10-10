import React from 'react';
import { LoadingScreen } from '@/presentation/screens/loadingScreen';

/** Standalone `/loading` route. The real session wait uses LoadingScreen from `index.tsx`. */
export default function LoadingPage() {
  return <LoadingScreen message="You're almost done!\nWe're creating your profile." />;
}