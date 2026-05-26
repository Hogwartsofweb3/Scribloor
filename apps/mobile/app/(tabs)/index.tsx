import { View, Text } from 'react-native';
import { usePrivy } from '@privy-io/expo';

export default function HomeTab() {
  const { user, isReady } = usePrivy();

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-2xl font-bold text-white mb-2">Home</Text>
      {isReady && user ? (
        <Text className="text-zinc-400">Welcome back!</Text>
      ) : (
        <Text className="text-zinc-400">Please log in to view your feed.</Text>
      )}
    </View>
  );
}
