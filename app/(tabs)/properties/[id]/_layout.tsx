// app/(tabs)/properties/[id]/_layout.tsx
import { Stack } from 'expo-router';

export default function PropertyDetailLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }} >
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Chi tiết tài sản',
          headerShown: true 
        }} 
      />
      <Stack.Screen 
        name="edit" 
        options={{ 
          title: 'Chỉnh sửa tài sản',
          headerShown: true 
        }} 
      />
    </Stack>
  );
}