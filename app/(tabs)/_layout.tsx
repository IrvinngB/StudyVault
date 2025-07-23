import { BottomNavBar } from '@/components/ui/BottomNavBar';
import { ThemedView } from '@/components/ui/ThemedComponents';
import { Stack } from 'expo-router';

export default function TabLayout() {
  return (
    <ThemedView variant="background" style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="explore" />
        <Stack.Screen name="themes-demo" />
      </Stack>
      <BottomNavBar />
    </ThemedView>
  );
}
