import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SessionProvider } from "@/presentation/state/sessionProvider";
import { Colors } from "../theme/colors";

/**
 * App shell. SessionProvider must wrap every screen so login, signals,
 * and profile share one session. Each Stack.Screen is a file in this folder.
 */
export default function RootLayout() {
  return (
    <SessionProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="loading" />
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="signals" />
        <Stack.Screen name="profile" />
      </Stack>
    </SessionProvider>
  );
}