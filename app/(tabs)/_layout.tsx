import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0066CC',
        tabBarInactiveTintColor: '#666666',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#E5E5E5',
          height: 80,
          paddingBottom: 20,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accounts',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <IconSymbol size={24} name="line.3.horizontal" color={focused ? '#0066CC' : color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="credit-journey"
        options={{
          title: 'Credit Journey',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <IconSymbol size={24} name="chart.bar.fill" color={focused ? '#0066CC' : color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="approvals"
        options={{
          title: 'Services',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <IconSymbol size={24} name="star" color={focused ? '#0066CC' : color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <IconSymbol size={24} name="person" color={focused ? '#0066CC' : color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="accounts"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="pay-transfer"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="deposits"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
});
