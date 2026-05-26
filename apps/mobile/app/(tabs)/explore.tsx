import { View, Text } from 'react-native';

export default function ExploreTab() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-2xl font-bold text-white mb-2">Explore</Text>
      <Text className="text-zinc-400">Discover new publications.</Text>
    </View>
  );
}
