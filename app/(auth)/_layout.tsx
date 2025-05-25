import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Screens in this group (login, register) will not have a header */}
    </Stack>
  );
}