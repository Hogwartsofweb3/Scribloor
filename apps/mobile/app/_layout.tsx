import { Stack } from 'expo-router';
import { PrivyProvider } from '@privy-io/expo';
import { StatusBar } from 'expo-status-bar';
import '../global.css';

const PRIVY_APP_ID = process.env.EXPO_PUBLIC_PRIVY_APP_ID || '';

export default function RootLayout() {
  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
    >
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#09090b' },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </PrivyProvider>
  );
}
