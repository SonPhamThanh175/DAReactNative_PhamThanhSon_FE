// import { Stack } from 'expo-router';

// export default function PropertiesLayout() {
//   return (
//     <Stack>
//       <Stack.Screen name="index" options={{ title: 'Danh sách tài sản' ,headerShown: false}} />
//       {/* <Stack.Screen name="[id]" options={{ title: 'Chi tiết tài sản',headerShown: false  }} /> */}
//       <Stack.Screen name="create" options={{ title: 'Tạo bài đăng mới',headerShown: false }} />
//       <Stack.Screen name="[id]/edit" options={{ title: 'Chỉnh sửa tài sản',headerShown: false }} />
//       <Stack.Screen name="[id]/[id]" options={{ title: 'Chi tiết sản phẩm' }} />
//     </Stack>
//   );
// }
// app/(tabs)/properties/_layout.tsx
import { Stack } from 'expo-router';

export default function PropertiesLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Danh sách tài sản',
          headerShown: false ,

        }} 
      />
      <Stack.Screen 
        name="create" 
        options={{ 
          title: 'Tạo bài đăng mới',
          headerShown: false,
          presentation: 'modal' 
        }} 
      />
      <Stack.Screen 
        name="[id]" 
        options={{ 
          headerShown: false, 
          presentation: 'modal'
        }} 
      />
      <Stack.Screen 
        name="edit" 
        options={{ 
          headerShown: false 
        }} 
      />
    </Stack>
  );
}