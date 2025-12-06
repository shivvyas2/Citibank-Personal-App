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
          borderTopWidth: 0,
          height: 90,
          paddingBottom: 24,
          paddingTop: 12,
          paddingHorizontal: 16,
          marginHorizontal: 12,
          marginBottom: 12,
          borderRadius: 24,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 12,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 6,
          letterSpacing: 0.2,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <IconSymbol size={24} name="house.fill" color={focused ? '#0066CC' : color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="accounts"
        options={{
          title: 'Accounts',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <IconSymbol size={24} name="building.2.fill" color={focused ? '#0066CC' : color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="credit-journey"
        options={{
          title: 'Credit Journey',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.centerIconContainer}>
              <IconSymbol size={28} name="chart.bar.fill" color={focused ? '#0066CC' : '#666'} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="approvals"
        options={{
          title: 'Approvals',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <IconSymbol size={24} name="checkmark.circle.fill" color={focused ? '#0066CC' : color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="pay-transfer"
        options={{
          title: 'Payments',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <IconSymbol size={24} name="arrow.left.arrow.right" color={focused ? '#0066CC' : color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="deposits"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="more"
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
    padding: 8,
    minWidth: 48,
    minHeight: 48,
    marginHorizontal: 4,
  },
  centerIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    minWidth: 56,
    minHeight: 56,
    marginHorizontal: 4,
  },
});
