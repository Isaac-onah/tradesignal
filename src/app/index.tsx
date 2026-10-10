import { Redirect } from 'expo-router';

/** First screen. Bypasses session check to directly display UI. */
export default function Index() {
  return <Redirect href="/login" />;
}