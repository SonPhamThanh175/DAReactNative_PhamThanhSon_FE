import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import * as SecureStore from 'expo-secure-store';
import { authService } from '../services/auth.service';
import { router, useSegments } from 'expo-router';
import { User } from '../types/User';

SplashScreen.preventAutoHideAsync();

interface AuthContextType {
  session: string | null;
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, phone: string) => Promise<void>;
  signOut: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useSession() {
  const context = useContext(AuthContext);
  console.log('useSession context:', context);
  if (context === undefined) {
    throw new Error('useSession must be used within an AuthSessionProvider');
  }
  return context;
}

export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        setSession(token);
        // Optionally fetch user info with token
        // const fetchedUser = await authService.getUserProfile(token);
        const user = await SecureStore.getItemAsync('user');
        setUser(user);
      } catch (error) {
        console.error('Failed to load session from SecureStore:', error);
      } finally {
        setIsLoading(false);
        SplashScreen.hideAsync();
      }
    };

    loadSession();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { token, user: loggedInUser } = await authService.login(email, password);
      await SecureStore.setItemAsync('userToken', token);
      setSession(token);
      setUser(loggedInUser);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }, []);

  const register = useCallback(async (email: string, password: string, name: string, phone: string) => {
    try {
      const token = await authService.register(email, password, name, phone);
      await SecureStore.setItemAsync('userToken', token);
      setSession(token);
      // Optionally auto-login or fetch user profile here
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    await authService.logout();
    await SecureStore.deleteItemAsync('userToken');
    setSession(null);
    setUser(null);
  }, []);

  const segments = useSegments();
  const inAuthGroup = segments[0] === '(auth)';

  useEffect(() => {
    if (!isLoading) {
      if (!session && !inAuthGroup) {
        router.replace('/(auth)/login');
      } else if (session && inAuthGroup) {
        router.replace('/(tabs)');
      }
    }
  }, [session, isLoading, inAuthGroup]);

  const contextValue = useMemo(
    () => ({
      session,
      user,
      signIn,
      register,
      signOut,
      isLoading,
    }),
    [session, user, signIn, register, signOut, isLoading]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}
