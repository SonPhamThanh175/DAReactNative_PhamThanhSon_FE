import { Stack } from 'expo-router';

export default function PropertiesLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Danh sách tài sản' }} />
      <Stack.Screen name="[id]" options={{ title: 'Chi tiết tài sản' }} />
      <Stack.Screen name="create" options={{ title: 'Tạo tài sản mới' }} />
      <Stack.Screen name="[id]/edit" options={{ title: 'Chỉnh sửa tài sản' }} />
    </Stack>
  );
}