import { Slot } from 'expo-router';
import { AuthSessionProvider } from '../context/AuthContext';

export default function RootLayout() {
  return (
    <AuthSessionProvider>
      <Slot /> 
    </AuthSessionProvider>
  );
}