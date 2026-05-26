import { View, Text } from 'react-native';

export default function VaultTab() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-2xl font-bold text-white mb-2">Vault</Text>
      <Text className="text-zinc-400">Your collected passes and posts.</Text>
    </View>
  );
}
