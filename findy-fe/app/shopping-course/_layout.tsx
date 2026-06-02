import { Stack } from "expo-router";

export default function ShoppingCourseLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="pick-zones" />
    </Stack>
  );
}
