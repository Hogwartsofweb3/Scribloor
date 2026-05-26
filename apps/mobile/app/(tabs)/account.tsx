import { View, Text } from 'react-native';
import { usePrivy } from '@privy-io/expo';

export default function AccountTab() {
  const { user } = usePrivy();

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-2xl font-bold text-white mb-2">Account</Text>
      <Text className="text-zinc-400">
        {user ? `Logged in as ${user.id}` : 'Not logged in.'}
      </Text>
    </View>
  );
}
