import { Stack } from 'expo-router';
import { Platform } from 'react-native';

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: Platform.OS === 'ios' ? 'slide_from_right' : 'slide_from_bottom',
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{
          title: 'Hồ sơ',
        }}
      />
      <Stack.Screen 
        name="edit-profile" 
        options={{
          title: 'Chỉnh sửa hồ sơ',
          presentation: 'card',
          animation: 'slide_from_right',
          gestureEnabled: true,
        }}
      />
      <Stack.Screen 
        name="my-properties" 
        options={{
          title: 'Tài sản của tôi',
          presentation: 'card',
        }}
      />
      <Stack.Screen 
        name="settings" 
        options={{
          title: 'Cài đặt',
          presentation: 'card',
        }}
      />
    </Stack>
  );
}