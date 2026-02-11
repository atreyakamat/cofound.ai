import { Stack } from "expo-router";

export default function DecisionLayout() {
  return (
    <Stack>
      <Stack.Screen name="[id]" options={{ headerShown: true }} />
    </Stack>
  );
}
