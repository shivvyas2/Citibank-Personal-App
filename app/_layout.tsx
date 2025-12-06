import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
// CLERK CODE COMMENTED OUT - Using internal API only
// import { ClerkProvider } from '@clerk/clerk-expo';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/contexts/SidebarContext';
import Drawer from '@/components/Drawer';

export const unstable_settings = {
  anchor: '(tabs)',
};

// CLERK CODE COMMENTED OUT
// // Get Clerk publishable key from environment variables
// // Set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env file
// const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
//
// if (!clerkPublishableKey || clerkPublishableKey === 'pk_test_your_clerk_publishable_key_here') {
//   console.warn(
//     '⚠️ Clerk Publishable Key not found!\n' +
//     'Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env file.\n' +
//     'Get your key from https://dashboard.clerk.com'
//   );
// }

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'login' || segments[0] === 'signup';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
        <ActivityIndicator size="large" color="#0066CC" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // CLERK CODE COMMENTED OUT
  // if (!clerkPublishableKey || clerkPublishableKey === 'pk_test_your_clerk_publishable_key_here') {
  //   return (
  //     <GestureHandlerRootView style={{ flex: 1 }}>
  //       <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: 'white' }}>
  //         <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' }}>
  //           Clerk Key Missing
  //         </Text>
  //         <Text style={{ fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 8 }}>
  //           Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env file
  //         </Text>
  //         <Text style={{ fontSize: 12, color: '#999', textAlign: 'center' }}>
  //           1. Copy .env.example to .env{'\n'}
  //           2. Add your Clerk publishable key{'\n'}
  //           3. Restart the development server
  //         </Text>
  //       </View>
  //     </GestureHandlerRootView>
  //   );
  // }

  return (
    // CLERK CODE COMMENTED OUT
    // <ClerkProvider publishableKey={clerkPublishableKey}>
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthProvider>
          <SidebarProvider>
            <RootLayoutNav />
            <Drawer />
            <StatusBar style="light" backgroundColor="#0066CC" />
          </SidebarProvider>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
    // CLERK CODE COMMENTED OUT
    // </ClerkProvider>
  );
}

