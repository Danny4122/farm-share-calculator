import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack initialRouteName="(tabs)">
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="individual"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="results"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="calculation-rules"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
