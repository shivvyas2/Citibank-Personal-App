import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Alert, Animated, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';
import { getMockBusinessCode, getMockUserId } from '@/data/mockBusinessData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.75;
const MAX_DRAWER_WIDTH = 320;

export default function Drawer() {
  const { signOut } = useAuth();
  const router = useRouter();
  const { isOpen, closeSidebar } = useSidebar();
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(false);
  const translateX = React.useRef(new Animated.Value(-DRAWER_WIDTH)).current;

  useEffect(() => {
    if (isOpen) {
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.spring(translateX, {
        toValue: -DRAWER_WIDTH,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    }
  }, [isOpen]);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationX < 0) {
        translateX.setValue(Math.max(-DRAWER_WIDTH, event.translationX));
      }
    })
    .onEnd((event) => {
      if (event.translationX < -DRAWER_WIDTH / 2 || event.velocityX < -500) {
        closeSidebar();
      } else {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }).start();
      }
    });

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/login');
            } catch (error) {
              Alert.alert('Error', 'Failed to log out');
            }
          },
        },
      ]
    );
  };

  const menuItems = [
    { label: 'Change Your Password', icon: 'lock' },
    { label: 'Mobile Token Management', icon: 'key' },
    { label: 'System Administration', icon: 'gearshape', hasChevron: true },
    { label: 'Push Notification Device Status', icon: 'bell' },
  ];

  const legalItems = [
    { label: 'Contact Us', icon: 'phone' },
    { label: 'Frequently Asked Questions', icon: 'questionmark.circle' },
    { label: 'CitiBusiness® Online User Agreement', icon: 'doc.text' },
    { label: 'Mobile Terms of Use', icon: 'doc.text' },
    { label: 'Privacy Statement', icon: 'lock.shield' },
    { label: 'Cookie Policy', icon: 'cookie' },
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <TouchableOpacity
        style={[styles.backdrop, { opacity: isOpen ? 0.5 : 0 }]}
        activeOpacity={1}
        onPress={closeSidebar}
      />
      
      {/* Drawer */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.drawer,
            {
              transform: [{ translateX }],
            },
          ]}>
          <SafeAreaView style={styles.drawerContent}>
            {/* Drawer Header */}
            <View style={styles.drawerHeader}>
              <TouchableOpacity 
                style={styles.drawerCloseButton}
                onPress={closeSidebar}>
                <View style={styles.drawerIconContainer}>
                  <IconSymbol name="person.circle.fill" size={20} color="#0066CC" />
                  <View style={styles.drawerIconLines}>
                    <View style={styles.drawerIconLine} />
                    <View style={styles.drawerIconLine} />
                    <View style={styles.drawerIconLine} />
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.drawerScroll}
              contentContainerStyle={styles.drawerScrollContent}
              showsVerticalScrollIndicator={false}>
              
              {/* Menu Items */}
              {menuItems.map((item, index) => (
                <TouchableOpacity 
                  key={index}
                  style={styles.menuItem}
                  onPress={() => {
                    closeSidebar();
                  }}>
                  <Text style={styles.menuItemText}>{item.label}</Text>
                  {item.hasChevron && (
                    <IconSymbol name="chevron.down" size={16} color="#666" />
                  )}
                </TouchableOpacity>
              ))}

              {/* Push Notifications with Toggle */}
              <View style={styles.menuItem}>
                <Text style={styles.menuItemText}>Push Notifications</Text>
                <Switch
                  value={pushNotificationsEnabled}
                  onValueChange={setPushNotificationsEnabled}
                  trackColor={{ false: '#E5E5E5', true: '#0066CC' }}
                  thumbColor={pushNotificationsEnabled ? 'white' : '#f4f3f4'}
                />
              </View>

              {/* Gray Bar */}
              <View style={styles.grayBar} />

              {/* Legal Items */}
              {legalItems.map((item, index) => (
                <TouchableOpacity 
                  key={index}
                  style={styles.menuItem}
                  onPress={() => {
                    closeSidebar();
                  }}>
                  <Text style={styles.menuItemText}>{item.label}</Text>
                </TouchableOpacity>
              ))}

              {/* Business Code and User ID */}
              <View style={styles.userInfo}>
                <Text style={styles.userInfoText}>
                  Business Code:{getMockBusinessCode().charAt(0)}{'*'.repeat(4)}{getMockBusinessCode().slice(-1)}
                </Text>
                <Text style={styles.userInfoText}>User Id:{getMockUserId()}</Text>
              </View>

              {/* Log Out Button */}
              <TouchableOpacity 
                style={styles.logoutButton}
                onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>Log Out</Text>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      </GestureDetector>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 998,
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH > MAX_DRAWER_WIDTH ? MAX_DRAWER_WIDTH : DRAWER_WIDTH,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 999,
  },
  drawerContent: {
    flex: 1,
  },
  drawerHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  drawerCloseButton: {
    padding: 8,
    alignSelf: 'flex-start',
    marginLeft: -8,
  },
  drawerIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  drawerIconLines: {
    flexDirection: 'column',
    gap: 3,
    marginLeft: 2,
  },
  drawerIconLine: {
    width: 12,
    height: 2,
    backgroundColor: '#0066CC',
    borderRadius: 1,
  },
  drawerScroll: {
    flex: 1,
  },
  drawerScrollContent: {
    paddingBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  menuItemText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '400',
    flex: 1,
  },
  grayBar: {
    height: 8,
    backgroundColor: '#E5E5E5',
    marginVertical: 8,
  },
  userInfo: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    marginTop: 8,
  },
  userInfoText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
    marginBottom: 4,
  },
  logoutButton: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    backgroundColor: '#E31837',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
});

